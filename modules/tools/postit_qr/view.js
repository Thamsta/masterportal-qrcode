import PostItQRTemplate from "text-loader!./template.html";
import PostItQRModel from "./model";

const PostItQRView = Backbone.View.extend({
    template: _.template(PostItQRTemplate),
    events: {
        //input events
        "click #savebutton": "saveclicked"
    },
    initialize: function () {
        //listeners on model
        this.listenTo(this.model, {
            "change:isActive change:url": this.render,
            "change:positionMapProjection": this.changedPosition,
        });
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },

    id: "postItQR",
    model: new PostItQRModel(),

    render: function (model, value) {
        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.model.createInteraction();
            this.$el.html(this.template(model.toJSON()));
            this.changedPosition();
            this.delegateEvents();
            this.checkInput();
        }
        else {
            this.model.setUpdatePosition(true);
            this.model.removeInteraction();
            this.undelegateEvents();
        }
        return this;
      },

    //Called whenever the position in the model has changed
    changedPosition: function () {
        var targetProjectionName = "EPSG:25832",
            position = this.model.returnTransformedPosition(targetProjectionName);
        this.model.setCurrentProjectionName(targetProjectionName);
        if (position) {
            this.adjustPosition(position);
        }
        this.checkInput();
    },
    
    //Sets the coords in the textfield (for debugging purposes. Can be deleted later)
    adjustPosition: function (position) {
        var coord,easting,northing;
        //Kartesische Koordinaten
        coord = this.model.getCartesian(position).split(",");
        easting = coord[0].trim();
        northing = coord[1].trim();

        this.$("#coordinatesEastingField").val(easting);
        this.$("#coordinatesNorthingField").val(northing);
    },

    /**
     * Enable the Save button when enough data is set (title, content and coords)
     */
    checkInput: function(){
       let coords = this.model.getPositionMapProjection().length > 0;
        this.$("#savebutton").attr("disabled", !(coords));
    },

    /**
     * React to user input
     */

    saveclicked: function(){
        this.model.saveclicked();
    },
  });

export default PostItQRView;