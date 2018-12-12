import Tool from "../../core/modelList/tool/model";
import { Pointer } from "ol/interaction.js";
import { toStringHDMS, toStringXY } from "ol/coordinate.js";
import Overlay from "ol/Overlay.js";
import VectorLayer from "ol/layer/Vector";
import VectorSource from 'ol/source/Vector.js';
import Point from "ol/geom/Point.js";
import Feature from "ol/Feature.js";
import { Circle as CircleStyle, Style, Fill, Stroke } from "ol/style.js";

const Model = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        selectPointerMove: null,
        positionMapProjection: [],
        currentProjectionName: "EPSG:25832",

        qrBild: undefined,
        qrOverlay: new Overlay({
            position: undefined,
            stopEvent: false,
            element: undefined,
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            },
        }),
        postitLayer: undefined,
        // qrArray: [],


    }),
    initialize: function () {
        this.superInitialize();
        this.listenTo(this, {
            "change:isActive": function () {
                Radio.trigger("MapMarker", "hideMarker");
            },
        });
    },

    refreshLayer: function (layer) {
        console.log(self.layer);
        console.log(self.layer);
        console.log(self.layer);
    },

    createQrLayer: function () {
        $.ajax({
            url: "https://thawing-brushlands-15739.herokuapp.com/postit/all.json",
            //data: params,
            async: true,
            type: "GET",
            context: this,
            success: function (data) {
                var features = [];
                var pointstyle = new Style({
                    image: new CircleStyle({
                        radius: 7,
                        fill: new Fill({
                            color: 'rgba(0, 0, 0, 1)'
                        })
                    })
                });

                for (var i = 0; i < data.length; i++) {
                    var object = data[i];
                    var point = new Feature({
                        geometry: new Point(object.coords),
                        name: object.title,
                        inhalt: object.content,
                        tag: object.tag
                    });
                    point.setStyle(pointstyle);
                    features.push(point);
                }
                var source = new VectorSource({});
                var layer = new VectorLayer({
                    source: source,
                });
                this.set("postitLayer", layer);
                layer.setVisible(true);
                Radio.trigger("Map", "addLayer", this.get("postitLayer"));
                source.addFeatures(features);
                setInterval((function(self){
                    return function(){
                        self.refreshLayer(self.layer);
                    }
                })(this), 1000);
            },
        });
    },

    //Creates Mouse interaction and binds to function
    createInteraction: function () {
        this.setSelectPointerMove(new Pointer({
            handleDownEvent: function (evt) {
                this.positionClicked(evt.coordinate);
            }.bind(this)
        }, this));

        Radio.trigger("Map", "addInteraction", this.get("selectPointerMove"));
    },

    //Removes all mouse interaction
    removeInteraction: function () {
        Radio.trigger("Map", "removeInteraction", this.get("selectPointerMove"));
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
        Radio.trigger("Map", "addOverlay", this.get("qrOverlay"));
        this.setPositionMapProjection(position);
    },

    //Transforms and returns the current position to a certain projection (atm always called with EPSG:25832 )
    returnTransformedPosition: function (targetProjection) {
        var positionMapProjection = this.get("positionMapProjection"),
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

    // setter for selectPointerMove
    setSelectPointerMove: function (value) {
        this.set("selectPointerMove", value);
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
