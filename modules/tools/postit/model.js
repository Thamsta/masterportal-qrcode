import Tool from "../../core/modelList/tool/model";
import {Pointer} from "ol/interaction.js";
import {toStringHDMS, toStringXY} from "ol/coordinate.js";


const Model = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        selectPointerMove: null,
        projections: [],
        mapProjection: null,
        positionMapProjection: [],
        updatePosition: true,
        currentProjectionName: "EPSG:25832",
        deactivateGFI: true,
        renderToWindow: true,
        position: null,
        "title": null,
        "content": null,
        "tags": [],
        allPostits: []
    }),
    initialize: function () {
        this.superInitialize();
        this.listenTo(this, {
            "change:isActive": function () {
                Radio.trigger("MapMarker", "hideMarker");
            }
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
        this.setPositionMapProjection(position);
        this.updateMapMarker(position);
    },

    //Updates the position of the map marker to the given position
    updateMapMarker: function (position){
      Radio.trigger("MapMarker", "showMarker", position);
    },

    //Gets called when the save button is clicked.
    saveclicked: function(){
        var postit = {title:this.getTitle(), content:this.getContent(), tags:this.getTags(), 
                        coordinates: this.get("positionMapProjection")};
        allPostits.push(postit)
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

    setTitle: function(value){
        this.set("title", value);
    },

    getTitle: function(){
        return this.get("title");
    },

    setContent: function(value){
        this.set("content", value);
    },

    getContent: function(){
        return this.get("content");
    },

    //Includes split by ","
    setTags: function(value){
        this.set("tags", value.split(","));
    },

    getTags: function(){
        return this.get("tags");
    },

    // setter for selectPointerMove
    setSelectPointerMove: function (value) {
        this.set("selectPointerMove", value);
    },

    // setter for mapProjection
    setMapProjection: function (value) {
        this.set("mapProjection", value);
    },

    // setter for projections
    setProjections: function (value) {
        this.set("projections", value);
    },

    // setter for positionMapProjection
    setPositionMapProjection: function (value) {
        this.set("positionMapProjection", value);
    },

    getPositionMapProjection: function(){
        return this.get("positionMapProjection");
    },

    // setter for updatePosition
    setUpdatePosition: function (value) {
        this.set("updatePosition", value);
    },
    // setter for currentProjection
    setCurrentProjectionName: function (value) {
        this.set("currentProjectionName", value);
    }
});

export default Model;
