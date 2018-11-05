import PostitTemplate from "text-loader!./template.html";
import PostitModel from "./model";

const View = Backbone.View.extend({
    template: _.template(PostitTemplate),
    // wird aufgerufen wenn die View erstellt wird
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive change:url": this.render,
            "click button": this.testcall,
            "change:positionMapProjection": this.changedPosition
        });
        this.testcall();
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },

    id: "postit",
    model: new PostitModel(),

    render: function (model, value) {
        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.model.createInteraction();
            this.$el.html(this.template(model.toJSON()));
            this.changedPosition();
            this.delegateEvents();
        }
        else {
            this.model.setUpdatePosition(true);
            this.model.removeInteraction();
            this.undelegateEvents();
        }
        return this;
      },

    changedPosition: function () {
        var targetProjectionName = "EPSG:25832",
            position = this.model.returnTransformedPosition(targetProjectionName);
            //targetProjection = this.model.returnProjectionByName(targetProjectionName);

        this.model.setCurrentProjectionName(targetProjectionName);
        if (position) {
            this.adjustPosition(position);
            //this.adjustWindow(targetProjection);
        }
    },

    adjustPosition: function (position) {
        var coord,easting,northing;
        //Kartesische Koordinaten
        coord = this.model.getCartesian(position).split(",");
        easting = coord[0].trim();
        northing = coord[1].trim();

        this.$("#coordinatesEastingField").val(easting);
        this.$("#coordinatesNorthingField").val(northing);
    },

    adjustWindow: function (targetProjection) {
        // geographische Koordinaten
        if (targetProjection.projName === "longlat") {
            this.$("#coordinatesEastingLabel").text("Breite");
            this.$("#coordinatesNorthingLabel").text("Länge");
        }
        // kartesische Koordinaten
        else {
            this.$("#coordinatesEastingLabel").text("Rechtswert");
            this.$("#coordinatesNorthingLabel").text("Hochwert");
        }
    },

    testcall: function(){
        console.log("testcall called");
        /*
        $.get("http://localhost:8080/get/bier", function(data){
            console.log("success");
        }).fail(function(error){
            console.log("error");
            console.log(error);
        })
        var request = $.ajax("http://localhost:8080/get/bier")
            .done(function() {
                console.log("success");
            })
            .fail(function(jq,textStatus,httperror) {
                console.log(jq);
                console.log(textStatus);
                console.log(httperror);
            })
            .always(function() {
            });  */ 
      },
  });

export default View;