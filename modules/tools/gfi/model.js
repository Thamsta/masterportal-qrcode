import Overlay from "ol/Overlay.js";
import ThemeList from "./themes/list";
import DesktopDetachedView from "./desktop/detached/view";
import TableView from "./table/view";
import DesktopAttachedView from "./desktop/attached/view";
import MobileView from "./mobile/view";
import Tool from "../../core/modelList/tool/model";

const Gfi = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        // detached | attached
        desktopViewType: "detached",
        // ist das Modal/Popover sichtbar
        isVisible: false,
        // mobile Ansicht true | false
        isMobile: Radio.request("Util", "isViewMobile"),
        // uiStyle DEFAULT | TABLE | SIMPLE
        uiStyle: Radio.request("Util", "getUiStyle"),
        // ol.Overlay für attached
        overlay: new Overlay({element: undefined}),
        // desktop/attached/view.js | desktop/detached/view.js | mobile/view.js
        currentView: undefined,
        // Koordinate für das attached Popover und den Marker
        coordinate: undefined,
        // Verwaltet die Themes
        themeList: undefined,
        // Index für das aktuelle Theme
        themeIndex: 0,
        // Anzahl der Themes
        numberOfThemes: 0,
        rotateAngle: 0,
        glyphicon: "glyphicon-info-sign"
    }),
    initialize: function () {
        var channel = Radio.channel("GFI");

        this.setThemeList(new ThemeList());
        channel.on({
            "setIsVisible": this.setIsVisible,
            "layerAtPosition": this.setGfiOfLayerAtPosition,
            "changeFeature": this.changeFeature
        }, this);

        channel.reply({
            "getIsVisible": function () {
                return this.get("isVisible");
            },
            "getGfiForPrint": this.getGfiForPrint,
            "getCoordinate": function () {
                return this.get("coordinate");
            },
            "getCurrentView": function () {
                return this.get("currentView");
            },
            "getVisibleTheme": this.getVisibleTheme
        }, this);

        this.listenTo(this, {
            "change:isVisible": function (model, value) {
                channel.trigger("isVisible", value);
                if (value === false && this.get("numberOfThemes") > 0) {
                    this.get("themeList").setAllInVisible();
                }
            },
            "change:isMobile": function () {
                this.initView();
                if (this.get("isVisible") === true) {
                    this.get("currentView").render();
                    this.get("themeList").appendTheme(this.get("themeIndex"));
                    this.get("currentView").toggle();
                }
            },
            "change:themeIndex": function (model, value) {
                this.get("themeList").appendTheme(value);
            }
        });

        this.listenTo(this.get("themeList"), {
            "isReady": function () {
                if (this.get("themeList").length > 0) {
                    this.setNumberOfThemes(this.get("themeList").length);
                    this.get("currentView").render();
                    this.get("themeList").appendTheme(0);
                    this.setIsVisible(true);
                }
                else {
                    this.setIsVisible(false);
                }
            }
        });

        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": this.setIsMobile
        }, this);

        this.listenTo(Radio.channel("Tool"), {
            "activatedTool": this.toggleGFI
        });

        this.listenTo(Radio.channel("Map"), {
            "isReady": function () {
                this.toggleGFI(this.get("id"), this.get("deactivateGFI"));
                Radio.trigger("Map", "addOverlay", this.get("overlay"));
            }
        }, this);

        this.initView();
    },

    /**
     * if the displayed feature changes, the model is recreated and the gfi adjusted
     * @param  {ol.Feature} feature - the feature which has been changed
     * @returns {void}
     */
    changeFeature: function (feature) {
        var gfiFeature,
            gfiTheme;

        if (this.get("isVisible")) {
            gfiFeature = this.get("themeList").models[0].attributes.feature;

            if (gfiFeature === feature) {
                gfiTheme = this.get("themeList").models[0].attributes.gfiTheme;

                Radio.trigger("gfiList", "redraw");
                Radio.trigger(gfiTheme + "Theme", "changeGfi");
            }
        }
    },

    /**
     * Prüft ob GFI aktiviert ist und registriert entsprechend den Listener oder eben nicht
     * @param  {String} id - Tool Id
     * @param  {String} deactivateGFI - soll durch aktivierung des Tools das GFI deaktiviert werden?
     * @return {undefined}
     */
    toggleGFI: function (id, deactivateGFI) {
        if (id === "gfi" && deactivateGFI === false) {
            this.setClickEventKey(Radio.request("Map", "registerListener", "click", this.setGfiParams.bind(this)));
            // this.set("key", Radio.request("Map", "registerListener", "click", this.setGfiParams.bind(this)));
        }
        else if (deactivateGFI === true) {
            Radio.trigger("Map", "unregisterListener", this.get("clickEventKey"));
        }
        else if (_.isUndefined(deactivateGFI)) {
            Radio.trigger("Map", "unregisterListener", this.get("clickEventKey"));
        }
    },

    /**
     * Löscht vorhandene View - falls vorhanden - und erstellt eine neue
     * mobile | detached | attached
     * @return {undefined}
     */
    initView: function () {
        var CurrentView;

        // Beim ersten Initialisieren ist CurrentView noch undefined
        if (_.isUndefined(this.get("currentView")) === false) {
            this.get("currentView").removeView();
        }

        if (this.get("isMobile")) {
            CurrentView = MobileView;
        }
        else if (this.get("desktopViewType") === "attached") {
            CurrentView = DesktopAttachedView;
        }
        else if (this.get("uiStyle") === "TABLE") {
            CurrentView = TableView;
        }
        else {
            CurrentView = DesktopDetachedView;
        }
        this.setCurrentView(new CurrentView({model: this}));
    },

    /**
     *
     * @param {ol.MapBrowserPointerEvent} evt Event
     * @return {undefined}
     */
    setGfiParams: function (evt) {
        var visibleLayerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isOutOfRange: false}),
            gfiParamsList = this.getGFIParamsList(visibleLayerList),
            visibleWMSLayerList = gfiParamsList.wmsLayerList,
            visibleVectorLayerList = gfiParamsList.vectorLayerList,
            eventPixel = Radio.request("Map", "getEventPixel", evt.originalEvent),
            vectorGFIParams,
            wmsGFIParams,
            unionParams;

        Radio.trigger("ClickCounter", "gfi");
        // für detached MapMarker
        this.setCoordinate(evt.coordinate);
        // Vector
        vectorGFIParams = this.getVectorGFIParams(visibleVectorLayerList, eventPixel);
        // WMS
        wmsGFIParams = this.getWMSGFIParams(visibleWMSLayerList);

        this.setThemeIndex(0);
        unionParams = _.union(vectorGFIParams, wmsGFIParams);
        if (_.isEmpty(unionParams)) {
            this.setIsVisible(false);
        }
        else {
            this.get("overlay").setPosition(evt.coordinate);
            this.get("themeList").reset(_.union(vectorGFIParams, wmsGFIParams));
        }
    },

    /**
     * Aufschlüsselung von WMS und Vector-GFI Abfragen aus einer gemischten Layerliste unter Berücksichtung von GroupLayern.
     * @param   {model[]} layerList Liste der aufzuschlüsselnden Layer
     * @returns {Object}            Objekt der aufgeschlüsslten GFI
     */
    getGFIParamsList: function (layerList) {
        var wmsLayerList = [],
            vectorLayerList = [];

        // Zuordnen von Layertypen zur Abfrage
        _.each(layerList, function (layer) {
            var typ = layer.get("typ");

            if (typ === "WMS") {
                wmsLayerList.push(layer);
            }
            else if (typ === "GROUP") {
                _.each(layer.get("layerSource"), function (layerSource) {
                    if (layerSource.get("typ") === "WMS") {
                        wmsLayerList.push(layerSource);
                    }
                    else {
                        vectorLayerList.push(layerSource);
                    }
                }, this);
            }
            else {
                vectorLayerList.push(layer);
            }
        });

        return {
            wmsLayerList: wmsLayerList,
            vectorLayerList: vectorLayerList
        };
    },

    /**
     * Ermittelt die GFIParameter zur Abfrage von Vectorlayern
     * @param  {layer[]} layerlist  Liste der abzufragenden Vectorlayer
     * @param  {pixel} eventPixel   Pixelkoordinate
     * @return {object[]}           GFI-Parameter von Vektorlayern
     */
    getVectorGFIParams: function (layerlist, eventPixel) {
        var vectorGfiParams = [];

        _.each(layerlist, function (vectorLayer) {
            var features = Radio.request("Map", "getFeaturesAtPixel", eventPixel, {
                    layerFilter: function (layer) {
                        return layer.get("name") === vectorLayer.get("name");
                    },
                    hitTolerance: 0
                }),
                modelAttributes;

            _.each(features, function (featureAtPixel) {
                modelAttributes = _.pick(vectorLayer.attributes, "name", "gfiAttributes", "typ", "gfiTheme", "routable", "id", "isComparable");

                // Feature
                if (_.has(featureAtPixel.getProperties(), "features") === false) {
                    modelAttributes.feature = featureAtPixel;
                    vectorGfiParams.push(modelAttributes);
                }
                // Cluster Feature
                else {
                    _.each(featureAtPixel.get("features"), function (feature) {
                        modelAttributes = _.pick(vectorLayer.attributes, "name", "gfiAttributes", "typ", "gfiTheme", "routable");
                        modelAttributes.feature = feature;
                        vectorGfiParams.push(modelAttributes);
                    });
                }
            }, this);
        }, this);

        return vectorGfiParams;
    },

    /**
     * Ermittelt die GFIParameter zur Abfrage von WMSlayern
     * @param  {layer[]} layerlist  Liste der abzufragenden WMSlayer
     * @return {object[]}           GFI-Parameter vom WMS-Layern
     */
    getWMSGFIParams: function (layerlist) {
        var wmsGfiParams = [];

        _.each(layerlist, function (layer) {
            if (layer.get("gfiAttributes") !== "ignore" || _.isUndefined(layer.get("gfiAttributes")) === true) {
                layer.attributes.gfiUrl = layer.getGfiUrl();
                wmsGfiParams.push(layer.attributes);
            }
        }, this);

        return wmsGfiParams;
    },

    /**
     * Erzeugt ein GFI eines spezifischen Layers an einer bestimmten Position
     * @param {string} layerId    ID des Layers
     * @param {coordinate[]} coordinate Position des GFI
     * @returns {void}
     */
    setGfiOfLayerAtPosition: function (layerId, coordinate) {
        var layerList = Radio.request("ModelList", "getModelsByAttributes", {id: layerId}),
            gfiParamsList = this.getGFIParamsList(layerList),
            visibleWMSLayerList = gfiParamsList.wmsLayerList,
            visibleVectorLayerList = gfiParamsList.vectorLayerList,
            vectorGFIParams,
            wmsGFIParams;

        Radio.trigger("ClickCounter", "gfi");

        if (layerList.length === 1) {
            this.setCoordinate(coordinate);

            // Vector
            vectorGFIParams = this.getVectorGFIParams(visibleVectorLayerList, coordinate);
            // WMS
            wmsGFIParams = this.getWMSGFIParams(visibleWMSLayerList);

            this.setThemeIndex(0);
            this.get("themeList").reset(_.union(vectorGFIParams, wmsGFIParams));
        }
    },

    // Setter
    setCoordinate: function (value, options) {
        this.set("coordinate", value, options);
    },

    setCurrentView: function (value) {
        this.set("currentView", value);
    },

    setIsMobile: function (value) {
        this.set("isMobile", value);
    },

    setIsVisible: function (value) {
        this.set("isVisible", value);
    },

    setNumberOfThemes: function (value) {
        this.set("numberOfThemes", value);
    },

    setOverlayElement: function (value) {
        this.get("overlay").setElement(value);
    },

    setThemeIndex: function (value) {
        this.set("themeIndex", value);
    },

    getOverlayElement: function () {
        return this.get("overlay").getElement();
    },

    /*
    * @description Liefert die GFI-Infos ans Print-Modul.
    */
    getGfiForPrint: function () {
        var theme = this.get("themeList").at(this.get("themeIndex")),
            responseArray = [];

        if (!_.isUndefined(theme)) {
            responseArray = [theme.get("gfiContent")[0], theme.get("name"), this.get("coordinate")];
        }
        return responseArray;
    },

    getVisibleTheme: function () {
        return this.get("themeList").findWhere({isVisible: true});
    },

    /**
    * Prüft, ob clickpunkt in RemoveIcon und liefert true/false zurück.
    * @param  {integer} top Pixelwert
    * @param  {integer} left Pixelwert
    * @return {undefined}
    */
    checkInsideSearchMarker: function (top, left) {
        var button = Radio.request("MapMarker", "getCloseButtonCorners"),
            bottomSM = button.bottom,
            leftSM = button.left,
            topSM = button.top,
            rightSM = button.right;

        if (top <= topSM && top >= bottomSM && left >= leftSM && left <= rightSM) {
            return true;
        }
        return false;
    },

    setClickEventKey: function (value) {
        this.set("clickEventKey", value);
    },

    // setter for themeList
    setThemeList: function (value) {
        this.set("themeList", value);
    }

});

export default Gfi;
