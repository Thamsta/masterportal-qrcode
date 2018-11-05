define(function (require) {
    var Backbone = require("backbone"),
    Radio = require("backbone.radio"),
    Model;

      Model = Backbone.Model.extend({
        initialize: function () {
            this.listenTo(Radio.channel("MapView"), {
                // Wird ausgelöst wenn sich Zoomlevel, Center
                // oder Resolution der Karte ändert
                "changedOptions": function (value) {
                    this.setCurrentScale(value.scale);
                }
            });
            this.listenTo(this, {
                "change:currentScale": function () {
                    // Sendet den neuen Maßstab an die MapView
                    // Dadurch zoomt die Karte in diesen Maßstab
                    Radio.trigger("MapView", "setScale", this.getCurrentScale());
                }
            });
    
            this.setScales(Radio.request("MapView", "getScales"));
            this.setCurrentScale(Radio.request("MapView", "getOptions").scale);

        },
        // Setter für alle verfügbaren Maßstäbe
        setScales: function (value) {
          this.set("scales", value);
        },
        // Setter für den aktuellen Maßstab
        setCurrentScale: function (value) {
          this.set("currentScale", value);
        },
        getCurrentScale: function () {
            return this.get("currentScale");
          }
      });

    return Model;
});