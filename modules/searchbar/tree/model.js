define([
    "backbone",
    "eventbus",
    "modules/layer/list",
    "modules/searchbar/model"
    ], function (Backbone, EventBus) {
    "use strict";
    return Backbone.Model.extend({
        /**
        *
        */
        defaults: {
            inUse: false,
            minChars: 3,
            layers: [],
            nodes: []
        },
        /**
         * @description Initialisierung der wfsFeature Suche
         * @param {Object} config - Das Konfigurationsobjekt der Tree-Suche.
         * @param {integer} [config.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
         */
        initialize: function (config) {
            if (config.minChars) {
                this.set("minChars", config.minChars);
            }
            EventBus.on("searchbar:search", this.search, this);
            EventBus.on("layerlist:sendOverlayerList", this.getLayerForSearch, this);
            EventBus.on("sendNodeChild", this.getNodesForSearch, this);
            EventBus.trigger("layerlist:getOverlayerList");
        },
        /**
        *
        */
        search: function (searchString) {
            if (this.get("inUse") === false && searchString.length >= this.get("minChars")) {
                this.set("inUse", true);
                var searchStringRegExp = new RegExp(searchString.replace(/ /g, ""), "i"); // Erst join dann als regulärer Ausdruck

                this.searchInLayers(searchStringRegExp);
                this.searchInNodes(searchStringRegExp);
                EventBus.trigger("createRecommendedList");
                this.set("inUse", false);
            }
        },
        /**
         * @description Führt die Suche in der Nodesvariablen aus.
         * @param {string} Suchstring als RegExp
         */
        searchInNodes: function (searchStringRegExp) {
            var nodes = _.uniq(this.get("nodes"), function (node) {
                return node.name;
            });

            _.each(nodes, function (node) {
                var nodeName = node.name.replace(/ /g, "");

                if (nodeName.search(searchStringRegExp) !== -1) {
                    EventBus.trigger("searchbar:pushHits", "hitList", node);
                }
            }, this);
        },
        /**
         * @description Lädt initial die Node in eine Variable. Wird in nodechild getriggert.
         * @param {Object} Node
         */
        getNodesForSearch: function (node) {
            this.get("nodes").push({
                name: node.get("name"),
                type: "Thema",
                glyphicon: "glyphicon-list",
                id: node.cid, model: node
            });
        },
        /**
        * @description Führt die Suche in der Layervariablen mit Suchstring aus.
         * @param {string} searchStringRegExp - Suchstring als RegExp.
        */
        searchInLayers: function (searchStringRegExp) {
            _.each(this.get("layers"), function (layer) {
                var layerName = layer.name.replace(/ /g, ""),
                    metaName;

                if (layer.metaName !== null) {
                    metaName = layer.metaName.replace(/ /g, "");
                    if (layer.model.get("type") === "nodeLayer" && metaName.search(searchStringRegExp) !== -1) {
                        EventBus.trigger("searchbar:pushHits", "hitList", layer);
                    }
                    else if (metaName.search(searchStringRegExp) !== -1 || layerName.search(searchStringRegExp) !== -1) {
                        EventBus.trigger("searchbar:pushHits", "hitList", layer);
                    }
                }
                else {
                    if (layerName.search(searchStringRegExp) !== -1) {
                        EventBus.trigger("searchbar:pushHits", "hitList", layer);
                    }
                }
            }, this);
        },

        /**
         * @description Lädt initial die Layer in eine Variable.
         * @param {[Object]} layerModels - Layerlist
         */
        getLayerForSearch: function (layerModels) {
            // Damit jeder Layer nur einmal in der Suche auftaucht, auch wenn er in mehreren Kategorien enthalten ist
            // und weiterhin mehrmals, wenn er mehrmals existiert mit je unterschiedlichen Datensätzen
            layerModels = _.uniq(layerModels, function (model) {
                return model.get("name") + model.get("metaID");
            });
            _.each(layerModels, function (model) {
                this.get("layers").push({
                    name: model.get("name"),
                    metaName: model.get("metaName"),
                    type: "Thema",
                    glyphicon: "glyphicon-list",
                    id: model.get("id"),
                    model: model
                });
            }, this);
        }
    });
});