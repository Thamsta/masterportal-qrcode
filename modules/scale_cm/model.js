///define(function(require){
// var Backbone = require("backbone"),

//Model;
import Backbone from "backbone";
import Radio from "backbone.radio";
const Model = Backbone.Model.extend({
    // wird aufgerufen, wenn das Mdel erstellt wird
    initialize: function () {
        //var Radio = require("backbone.radio");  
        this.listenTo(Radio.channel("MapView"), {
            // Wird ausgelöst wenn sich Zoomlevel, Center
            // oder Resolution der Karte ändert
            "changedOptions": function (value) {
                this.setCurrentScale(value.scale);
            }
        });
        this.listenTo(this, {
            "change:currentScale": function () {
                //sendet den neuen Maßstab an die MapView
                //Dadurch uoomt die Karte in den Maßstab
                Radio.trigger("MapView", "setScale", this.getCurrentScale());
            }
        })
        this.setScales(Radio.reqest("MapView", "getScales"));
        this.setCurrentScale(Radio.reqest("MapView", "getOptions").scale);
    },
    setScales: function (value) {
        this.set("scales", value);
    },
    setCurrentScale: function (value) {
        this.set("currentScale", value);
    },
    getCurrentScale: function () {
        return this.get("currentScale");
    }
});
//  return Model;
//});

export default Model;
