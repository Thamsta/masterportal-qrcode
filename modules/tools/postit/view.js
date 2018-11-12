import PostItTemplate from "text-loader!./template.html";
import PostItModel from "./model";

const PostItView = Backbone.View.extend({
    template: _.template(PostItTemplate),
    events: {
        //input events
        "change #titleField": "titleFieldChanged",
        "change #contentField": "contentFieldChanged",
        "change #tagField": "tagFieldChanged",
        "click #savebutton": "saveclicked"
    },
    initialize: function () {
        //listeners on model
        this.listenTo(this.model, {
            "change:isActive change:url": this.render,
            "change:positionMapProjection": this.changedPosition,
            "change:title change:content change:tags": this.checkInput,
        });
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },

    id: "postit",
    model: new PostItModel(),

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
        let title = this.model.getTitle();
        let content = this.model.getContent();
        let coords = this.model.getPositionMapProjection().length > 0;
        this.$("#savebutton").attr("disabled", !(title && content && coords));
    },

    /**
     * React to user input
     */
    titleFieldChanged: function(){
        var value = this.$("#titleField").val();
        this.model.setTitle(value);
    },
    contentFieldChanged: function(){
        var value = this.$("#contentField").val();
        this.model.setContent(value);
    },
    tagFieldChanged: function(){
        var value = this.$("#tagField").val();
        this.model.setTags(value);
    },

    saveclicked: function(){
        this.model.saveclicked();
    },

    /*
    testcall: function(){
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
            });
      },*/

  });

export default PostItView;