import Tool from "../../core/modelList/tool/model";
import { Pointer } from "ol/interaction.js";
import { toStringHDMS, toStringXY } from "ol/coordinate.js";
import Overlay from "ol/Overlay.js";
import VectorLayer from "ol/layer/Vector";
import VectorSource from 'ol/source/Vector.js';
import Point from "ol/geom/Point.js";
import Feature from "ol/Feature.js";
import { Circle as CircleStyle, Style, Fill, Stroke } from "ol/style.js";
import Select from 'ol/interaction/Select.js';
import click from 'ol/events/condition.js';

const Model = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        selectPointerMove: null,
        selectInteraction: undefined,
        positionMapProjection: [],
        currentProjectionName: "EPSG:25832",
        qrBild: undefined,
        qrOverlay: undefined,
        postitLayer: undefined,
        postitFeatures: [], //TODO: delete
        edit: true,
        view: false,
        selectOverlay: undefined,
        selected_feature_content: undefined,
    }),

    initialize: function () {
        this.superInitialize();
        this.listenTo(this, {
            "change:isActive": function () {
                Radio.trigger("MapMarker", "hideMarker");
            },
        });
        this.setqrOverlay(
            new Overlay({
                position: undefined,
                stopEvent: false,
                element: undefined,
                autoPan: true,
                autoPanAnimation: {
                    duration: 250
                },
            }));
        this.setSelectOverlay(
            new Overlay({
                position: undefined,
                stopEvent: false,
                element: undefined,
                autoPan: true,
                autoPanAnimation: {
                    duration: 250
                },
            })
        );
        this.setSelectInteraction(
            new Select({
                condition: click,
            })
        )
    },

    createPostitLayer: function () {
        var that = this;
        $.ajax({
            url: "https://thawing-brushlands-15739.herokuapp.com/postit/all.json",
            async: true,
            type: "GET",
            context: this,
            success: function (data) {
                this.updateFeatures(data);

                var source = new VectorSource({});
                source.addFeatures(that.getPostitFeatures());
                var layer = new VectorLayer({
                    source: source,
                });

                layer.setVisible(false);
                this.setPostitLayer(layer);
                Radio.trigger("Map", "addLayer", this.getPostitLayer());

                setInterval((function (self) {
                    return function () {
                        self.refreshLayer();
                    }
                })(this), 1000);
            },
        });
    },

    /**
     * Creates a style for a point based on it's tag
     * @param {Tag of the style} tag 
     */
    createPointStyle: function (tag) {
        switch (tag) {
            case "Verkehr":
                var thecolor = 'rgba(50, 50, 50, 1)';
                break;
            case "Soziales":
                var thecolor = 'rgba(255, 255, 0, 1)'
                break;
            case "Parkplätze":
                var thecolor = 'rgba(0, 0, 255, 1)'
                break;
            case "Radwege":
                var thecolor = 'rgba(255, 0, 0, 1)'
                break;
            case "Fußwege":
                var thecolor = 'rgba(50, 50, 50, 1)'
                break;
            case "Natur":
                var thecolor = 'rgba(0, 255, 255, 1)'
                break;
            case "HVV":
                var thecolor = 'rgba(255, 150, 0, 1)'
                break;
            case "Schulen":
                var thecolor = 'rgba(100, 255, 255, 1)'
                break;
            case "Kindertagesstätten":
                var thecolor = 'rgba(100, 255, 100, 1)'
                break;
            case "Sonstiges":
                var thecolor = 'rgba(255, 0, 255, 1)'
                break;
            default:
                var thecolor = 'white'
                break;
        }


        var pointstyle = new Style({
            image: new CircleStyle({
                radius: 7,
                fill: new Fill({
                    color: thecolor
                }),
                stroke: new Stroke({
                    color: 'white'
                })
            })
        });

        return pointstyle;
    },


    /**
     * Called by setInterval
     * Fetches all postits from the server and calls updateFeatures with the data
     */
    refreshLayer: function () {
        $.ajax({
            url: "https://thawing-brushlands-15739.herokuapp.com/postit/all.json",
            async: true,
            type: "GET",
            context: this,
            success: function (data) {
                this.updateFeatures(data);
            }
        })
    },

    /**
     * Refreshes the Features by deleting all and loading
     * 
     * @param {JSON} data Post-It data from Server: JSON Array of Postits with title, content, tags and coords
     * @param {Style} pointstyle The Pointstyle with which the data will be displayed on the map
     */
    updateFeatures(data) {
        if (this.getPostitLayer()) {
            for (var i = 0; i < data.length; i++) {
                var object = data[i];
                var point = new Feature({
                    geometry: new Point(object.coords),
                    name: object.title,
                    inhalt: object.content,
                    tag: object.tags
                });
                point.setStyle(this.createPointStyle(object.tags));
                this.getPostitFeatures().push(point);
            }
            //TODO: index einfuehren für mehr effizienz!
            this.getPostitLayer().getSource().clear();
            this.getPostitLayer().getSource().addFeatures(this.getPostitFeatures());
        }
    },

    removePostitLayer: function () {
        this.getPostitLayer().setVisible(false);
        //TODO: Stop setInterval function

    },

    togglePostitLayer: function () {
        if (this.getPostitLayer().getVisible() === true) {
            this.getPostitLayer().setVisible(false);
            this.removeSelectInteraction();
        }
        else {
            this.getPostitLayer().setVisible(true);
            Radio.trigger("Map", "addInteraction", this.getSelectInteraction());
        }
    },
    createSelectInteraction: function () {
        var that = this;
        that.getSelectInteraction().on("select", function () {
            that.selectClicked();
        });
        Radio.trigger("Map", "addInteraction", this.getSelectInteraction());
    },
    removeSelectInteraction: function () {

        Radio.trigger("Map", "removeInteraction", this.getSelectInteraction());
    },
    selectClicked: function () {
        if (this.getSelectInteraction().getFeatures().item(0)) {
            var selected_feature = this.getSelectInteraction().getFeatures().item(0),
                title = selected_feature.get("name"),
                tag = selected_feature.get("tag"),
                inhalt = selected_feature.get("inhalt"),
                coord = selected_feature.get("geometry");
            this.set("selected_feature_content", [title, tag, inhalt, coord]);
            Radio.trigger("Map", "addOverlay", this.getSelectOverlay());
        }
    },
    //Creates Mouse interaction and binds to function
    createInteraction: function () {
        this.setSelectPointerMove(new Pointer({
            handleDownEvent: function (evt) {
                this.positionClicked(evt.coordinate);
            }.bind(this)
        }, this));
        Radio.trigger("Map", "addInteraction", this.getSelectPointerMove());
    },

    //Removes all mouse interaction
    removeInteraction: function () {
        Radio.trigger("Map", "removeInteraction", this.getSelectPointerMove());
        this.set("selectPointerMove", null);
    },

    //Triggered by mouse interaction (click)
    positionClicked: function (position) {
        var that = this;
        console.log(that.get("postitLayer"));
        var coord = this.getCartesian(position).split(", ");
        var easting = coord[1];
        var northing = coord[0];
        var QRCode = require("qrcode");
        var text = "https://thawing-brushlands-15739.herokuapp.com/new.html?northing=" + northing + "&easting=" + easting;
        var opts = {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            rendererOpts: {
                quality: 0.3
            }
        };

        console.log(text);
        QRCode.toDataURL(text, opts, function (err, url) {
            if (err) throw err
            that.setqrBild(url);
        });
        Radio.trigger("Map", "addOverlay", this.getqrOverlay());
        this.setPositionMapProjection(position);
    },

    //Transforms and returns the current position to a certain projection (atm always called with EPSG:25832 )
    returnTransformedPosition: function (targetProjection) {
        var positionMapProjection = this.getPositionMapProjection(),
            positionTargetProjection = [0, 0];

        if (positionMapProjection.length > 0) {
            positionTargetProjection = Radio.request("CRS", "transformFromMapProjection", targetProjection, positionMapProjection);
        }

        return positionTargetProjection;
    },

    getHDMS: function (coord) {
        return toStringHDMS(coord);
    },

    getCartesian: function (coord) {
        return toStringXY(coord, 2);
    },

    //GETTER&SETTER

    // setter for qrBild
    setqrBild: function (value) {
        this.set("qrBild", value);
    },

    // getter for qrBild
    getqrBild: function () {
        return this.get("qrBild");
    },

    // setter for qrOverlay
    setqrOverlay: function (value) {
        this.set("qrOverlay", value);
    },

    // getter for qrOverlay
    getqrOverlay: function () {
        return this.get("qrOverlay");
    },

    // setter for postitLayer
    setPostitLayer: function (value) {
        this.set("postitLayer", value);
    },

    // getter for postitLayer
    getPostitLayer: function () {
        return this.get("postitLayer");
    },

    // setter for postitFeatures
    setPostitFeatures: function (value) {
        this.set("postitFeatures", value);
    },

    // getter for postitFeatures
    getPostitFeatures: function () {
        return this.get("postitFeatures");
    },

    // setter for selectOverlay
    setSelectOverlay: function (value) {
        this.set("selectOverlay", value);
    },

    // getter for selectOverlay
    getSelectOverlay: function () {
        return this.get("selectOverlay");
    },

    // setter for selected_feature_content
    setSelectFeatureContent: function (value) {
        this.set("selected_feature_content", value);
    },

    // getter for selected_feature_content
    getSelectFeatureContent: function () {
        return this.get("selected_feature_content");
    },

    // setter for selectPointerMove
    setSelectPointerMove: function (value) {
        this.set("selectPointerMove", value);
    },

    // getter for selectPointerMove
    getSelectPointerMove: function () {
        return this.get("selectPointerMove");
    },

    // setter for setSelectInteraction
    setSelectInteraction: function (value) {
        this.set("selectInteraction", value);
    },

    // getter for setSelectInteraction
    getSelectInteraction: function () {
        return this.get("selectInteraction");
    },

    // setter for positionMapProjection
    setPositionMapProjection: function (value) {
        this.set("positionMapProjection", value);
    },

    getPositionMapProjection: function () {
        return this.get("positionMapProjection");
    },

    // setter for currentProjection
    setCurrentProjectionName: function (value) {
        this.set("currentProjectionName", value);
    },
    // getter for currentProjection
    getCurrentProjectionName: function () {
        return this.get("currentProjectionName");
    },
});

export default Model;
