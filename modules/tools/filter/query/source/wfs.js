import QueryModel from "../model";
import {intersects} from "ol/extent.js";

const WfsQueryModel = QueryModel.extend({
    initialize: function () {
        this.superInitialize();
        this.prepareQuery();

        if (this.get("searchInMapExtent") === true) {
            Radio.trigger("Map", "registerListener", "moveend", this.isSearchInMapExtentActive.bind(this), this);
        }
    },
    /**
     * gathers Information for this Query including the wfs features and metadata
     * waits for WFS features to be loaded if they aren't loaded already.
     * @return {ol.Feature[]} openlayers Features
     */
    prepareQuery: function () {
        var features = this.getFeaturesFromWFS();

        if (features.length > 0) {
            this.processFeatures(features);
        }
        else {
            this.listenToFeaturesLoaded();
        }
        return features;
    },
    processFeatures: function (features) {
        this.setFeatures(features);
        this.setFeatureIds(this.collectAllFeatureIds(features));
        this.buildQueryDatastructure();
    },
    collectAllFeatureIds: function (features) {
        var featureIds = [];

        _.each(features, function (feature) {
            featureIds.push(feature.getId());
        });
        return featureIds;
    },
    /**
     * Waits for the Layer to load its features and proceeds requests the metadata
     * @return {[type]} [description]
     */
    listenToFeaturesLoaded: function () {
        this.listenTo(Radio.channel("Layer"), {
            "featuresLoaded": function (layerId, features) {
                if (layerId === this.get("layerId")) {
                    this.processFeatures(features);
                }
            }
        });
    },
    /**
     * request the features for this query from the modellist
     * @return {Object} - olFeatures
     */
    getFeaturesFromWFS: function () {
        var model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")}),
            features = [];

        if (!_.isUndefined(model)) {
            features = model.get("layerSource").getFeatures();
        }
        return features;
    },

    /**
     * Sends a DescriptFeatureType Request for the Layer asscociated with this Query
     * and proceeds to build the datastructure including the snippets for this query
     * @param  {string} url - WFS Url
     * @param  {string} featureType - WFS FeatureType
     * @param  {string} version - WFS Version
     * @returns {void}
     */
    buildQueryDatastructure: function () {
        var layerObject = Radio.request("RawLayerList", "getLayerWhere", {id: this.get("layerId")}),
            url,
            featureType,
            version;

        if (this.get("searchInMapExtent") === true) {
            this.addSearchInMapExtentSnippet();
        }
        if (!_.isUndefined(layerObject)) {
            url = Radio.request("Util", "getProxyURL", layerObject.get("url"));
            featureType = layerObject.get("featureType");
            version = layerObject.get("version");
            this.requestMetadata(url, featureType, version, this.parseResponse);
        }
    },
    /**
     * Führt DescriptFeatureType Request aus
     * @param  {string} url         url to wfs
     * @param  {string} featureType featuretype of wfs
     * @param  {string} version     version of wfs
     * @param  {function} callback  callbackfunction for ajaxrequest
     * @return {void}
     */
    requestMetadata: function (url, featureType, version, callback) {
        $.ajax({
            url: url,
            context: this,
            data: "service=WFS&version=" + version + "&request=DescribeFeatureType&typename=" + featureType,
            // parent (QueryModel) function
            success: callback
        });
    },
    /**
     * Extract Attribute names and types from DescribeFeatureType-Response
     * @param  {XML} response response xml from ajax call
     * @return {object} - Mapobject containing names and types
     */
    parseResponse: function (response) {
        var elements = $("element", response),
            featureAttributesMap = [];

        _.each(elements, function (element) {
            featureAttributesMap.push({name: $(element).attr("name"), type: $(element).attr("type")});
        });

        this.createSnippets(featureAttributesMap);
    },


    /**
     * [getValuesFromFeature description]
     * @param  {ol.feature} feature olfeature
     * @param  {string} attrName [description]
     * @return {[string]}          [description]
     */
    getValuesFromFeature: function (feature, attrName) {
        var values = this.parseValuesFromString(feature, attrName);

        return _.unique(values);
    },

    /**
     * parses attribute values with pipe-sign ("|") and returnes array with single values
     * @param  {ol.feature} feature olfeature
     * @param  {string} attributeName - key name of a feature attribute
     * @return {array} array of string[] || number[]
     */
    parseValuesFromString: function (feature, attributeName) {
        var values = [],
            attributeValue = feature.get(attributeName),
            attributeValues = [];

        if (!_.isUndefined(attributeValue)) {
            if (_.isString(attributeValue) && attributeValue.indexOf("|") !== -1) {
                attributeValues = attributeValue.split("|");

                _.each(attributeValues, function (value) {
                    if (this.isValid(value)) {
                        values.push(this.trimValue(value));
                    }
                }, this);
            }
            else if (_.isArray(attributeValue)) {
                _.each(attributeValue, function (value) {
                    if (this.isValid(value)) {
                        values.push(this.trimValue(value));
                    }
                }, this);
            }
            else if (this.isValid(attributeValue)) {
                values.push(this.trimValue(attributeValue));
            }
        }
        return _.unique(values);
    },
    isValid: function (value) {
        return value !== null && !_.isUndefined(value);
    },
    trimValue: function (value) {
        var trimmedValue = value;

        if (_.isString(value)) {
            trimmedValue = value.trim();
        }
        return trimmedValue;
    },
    /**
     * Collect the feature Ids that match the predefined rules
     * and trigger them to the ModelList
     * @returns {ol.feature[]} features that passed the predefined rules
     */
    runPredefinedRules: function () {
        var features = this.get("features"),
            newFeatures = [];

        if (!_.isUndefined(this.get("predefinedRules")) && this.get("predefinedRules").length > 0) {
            _.each(features, function (feature) {
                _.each(this.get("predefinedRules"), function (rule) {
                    if (_.contains(rule.values, feature.get(rule.attrName))) {
                        newFeatures.push(feature);
                    }
                });
            }, this);
        }
        else {
            return features;
        }

        return newFeatures;
    },
    /**
     * runs predefined rules,
     * determines selected values from snippets,
     * derives featureIds from matching Features and triggers "featureIdsChanged" to filterModel
     * @return {[type]} [description]
     */
    runFilter: function () {
        var features = this.runPredefinedRules(),
            selectedAttributes = [],
            featureIds = [];

        this.get("snippetCollection").forEach(function (snippet) {
            if (snippet.hasSelectedValues() === true) {
                selectedAttributes.push(snippet.getSelectedValues());
            }
        });

        if (selectedAttributes.length > 0) {
            _.each(features, function (feature) {
                var isMatch = this.isFilterMatch(feature, selectedAttributes);

                if (isMatch) {
                    featureIds.push(feature.getId());
                }
            }, this);
        }
        else {
            _.each(features, function (feature) {
                featureIds.push(feature.getId());
            }, this);
        }

        this.updateSnippets(features, selectedAttributes);
        this.setFeatureIds(featureIds);
        this.trigger("featureIdsChanged", featureIds, this.get("layerId"));
    },

    sendFeaturesToRemote: function () {
        var model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")}),
            features = [],
            feature;

        _.each(this.get("featureIds"), function (id) {
            feature = model.get("layerSource").getFeatureById(id);
            feature.set("extent", feature.getGeometry().getExtent());
            features.push(_.omit(feature.getProperties(), ["geometry", "geometry_EPSG_25832", "geometry_EPSG_4326"]));
        });

        Radio.trigger("RemoteInterface", "postMessage", {"features": JSON.stringify(features), "layerId": model.get("id"), "layerName": model.get("name")});
    },
    /**
     * determines the attributes and their values that are still selectable
     * @param  {ol.Feature[]} features olfeatures
     * @param  {object[]} selectedAttributes attribute object
     * @param  {object[]} allAttributes      array of all attributes and their values
     * @return {object[]}                    array of attributes and their values that are still selectable
     */
    collectSelectableOptions: function (features, selectedAttributes, allAttributes) {
        var selectableOptions = [],
            selectableValues = [];

        _.each(allAttributes, function (attribute) {
            selectableValues = {name: attribute.name, displayName: attribute.displayName, type: attribute.type, values: [], matchingMode: attribute.matchingMode};

            _.each(features, function (feature) {
                var isMatch = this.isFilterMatch(feature, _.filter(selectedAttributes, function (attr) {
                    return attr.attrName !== attribute.name;
                }));

                if (isMatch) {
                    selectableValues.values.push(this.parseValuesFromString(feature, attribute.name));
                }
            }, this);
            selectableValues.values = _.unique(_.flatten(selectableValues.values));

            selectableOptions.push(selectableValues);
        }, this);

        return selectableOptions;
    },
    /**
     * after every filtering the snippets get updated with selectable values
     * @param  {ol.Feature[]} features features
     * @param  {object[]}     selectedAttributes [description]
     * @returns {void}
     */
    updateSnippets: function (features, selectedAttributes) {
        var snippets = this.get("snippetCollection"),
            selectableOptions = this.collectSelectableOptions(features, selectedAttributes, this.get("featureAttributesMap"));

        _.each(snippets.where({"snippetType": "dropdown"}), function (snippet) {
            var attribute;

            snippet.resetValues();
            attribute = _.find(selectableOptions, {name: snippet.get("name")});
            snippet.updateSelectableValues(attribute.values);
        });
    },
    /**
     * checks if feature hat attribute that contains value
     * @param  {ol.Feature}  feature olfeature
     * @param  {object}      attribute attributeObject
     * @return {Boolean}               true if feature has attribute that contains value
     */
    isValueMatch: function (feature, attribute) {
        var featureMap = _.findWhere(this.get("featureAttributesMap"), {name: attribute.attrName});

        attribute.matchingMode = featureMap.matchingMode;
        return attribute.matchingMode === "OR" ? this.isORMatch(feature, attribute) : this.isANDMatch(feature, attribute);
    },
    isORMatch: function (feature, attribute) {
        var isMatch = false;

        isMatch = _.find(attribute.values, function (value) {
            return this.containsValue(feature, attribute, value);
        }, this);
        return !_.isUndefined(isMatch);
    },
    isANDMatch: function (feature, attribute) {
        return _.every(attribute.values, function (value) {
            return this.containsValue(feature, attribute, value);
        }, this);
    },
    containsValue: function (feature, attribute, value) {
        if (_.isUndefined(feature.get(attribute.attrName)) === false) {
            return feature.get(attribute.attrName).indexOf(value) !== -1;
        }
        return false;
    },
    /**
     * checks if a value is within a range of values
     * @param  {ol.Feature} feature olfeature
     * @param  {string} attributeName name of attribute
     * @param  {number[]} values arra of values
     * @return {boolean} flag if value is in range
     */
    isNumberInRange: function (feature, attributeName, values) {
        var valueList = _.extend([], values),
            featureValue = feature.get(attributeName),
            isNumberInRange;

        valueList.push(featureValue);
        valueList = _.sortBy(valueList);
        isNumberInRange = valueList[1] === featureValue;

        return isNumberInRange;
    },

    isFeatureInExtent: function (feature) {
        var mapExtent = Radio.request("MapView", "getCurrentExtent");

        return intersects(mapExtent, feature.getGeometry().getExtent());
    },

    /**
     * checks if feature matches the filter
     * @param  {ol.Feature}  feature    [description]
     * @param  {object[]}    filterAttr array of attributes and their values to filter
     * @return {Boolean}            [description]
     */
    isFilterMatch: function (feature, filterAttr) {
        var isMatch = false;

        isMatch = _.every(filterAttr, function (attribute) {
            if (feature.get(attribute.attrName) === null) {
                return false;
            }
            else if (attribute.type === "integer" || attribute.type === "decimal") {
                return this.isNumberInRange(feature, attribute.attrName, attribute.values);
            }
            else if (attribute.type === "searchInMapExtent") {
                return this.isFeatureInExtent(feature);
            }

            return this.isValueMatch(feature, attribute);

        }, this);
        return isMatch;
    },

    setFeatures: function (value) {
        this.set("features", value);
    }
});

export default WfsQueryModel;
