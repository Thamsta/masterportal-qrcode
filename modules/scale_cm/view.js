import ScaleModel from "./model";
import ScaleTemplate from "text-loader!./template.html";
import Backbone from "backbone";
import _ from "underscore";
import $ from "jquery";
//import Model from "../snippets/value/model";
//define(function (require) {


const View = Backbone.View.extend({
    //// var Backbone = require("backbone"),
    // _ = require("underscore"),
    //// ScaleTemplate = require("text!modules/scale_cm/template.html"),
    // $ = require("jquery"),
    // scaleModel = new ScaleModel(),


    //View = Backbone.View.extend({
    id: "scale",
    model: ScaleModel(),
    // underscore template Funktion
    template: _.template(ScaleTemplate),
    events: {
        // DOM Change Event führt rhis.setCurrentScale aus
        "change .form-control": "setCurrentScale"
    },
    // wird aufgerufen wenn die View erstellt wird
    initialize: function () {
        this.listenTo(this.model, {
            // Verändert sich der Maßstab der Karte und damit der currentScale
            // des Models, wird die View neu gezeichnet.
            "change:currentScale": this.render
        });
        this.render();
    },
    //Konvention: Die Methode fürs zeichnen der View, heißt render.
    render: function () {
        var attr = this.model.toJSON();
        //var $ = require("jquery");
        $(this.el).html(this.template(attr));
        $("body").append(this.$el);
    },
    setCurrentScale: function (evt) {
        this.model.setCurrentScale(parsInt(evt.target.value, 10));
    }
});

//     return View;
// });

export default View;