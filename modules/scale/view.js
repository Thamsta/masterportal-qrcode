define(function (require) {
    var Backbone = require("backbone"),
    _ = require("underscore"),
    ScaleTemplate = require("text!modules/scale/template.html"),
    ScaleModel = require("modules/scale/model"),
    $ = require("jquery"),
    View;

View = Backbone.View.extend({
    // Konvention: Id = Name des Moduls
    id: "scale",
    model: new ScaleModel(),
    // underscore template Funktion
    template: _.template(ScaleTemplate),
    // wird aufgerufen wenn die View erstellt wird
    events: {
        // DOM Change Event führt this.setCurrentScale aus
        "change .form-control": "setCurrentScale"
    },
    initialize: function () {
        this.listenTo(this.model, {
            // Verändert sich der Maßstab der Karte und damit der currentScale
            // des Models, wird die View neu gezeichnet.
            "change:currentScale": this.render
        });
        this.render();
    },
    // Konvention: Die Methode fürs zeichnen der View, heißt render.
    render: function () {
        var attr = this.model.toJSON();
        $(this.el).html(this.template(attr));
        $("body").append(this.$el);
    },
    // Ruft im Model die Methode setCurrentScale auf
    setCurrentScale: function (evt) {
        this.model.setCurrentScale(parseInt(evt.target.value, 10));
    }
});
    return View;
});