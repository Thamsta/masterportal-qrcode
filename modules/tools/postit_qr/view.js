import PostItQRTemplate from "text-loader!./template.html";
import PostItQRModel from "./model";

const PostItQRView = Backbone.View.extend({
    template: _.template(PostItQRTemplate),

    initialize: function () {
        //listeners on model
        this.listenTo(this.model, {
            "change:isActive": this.render,
          //  "change:url": this.render,
            "change:positionMapProjection": this.changedPosition, 
            "change:positionMapProjection": this.createQR, 
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
        var QRCode = require("qrcode")
        var canvas = document.getElementById("QRplaceHolder")
        var text = this.model.getCartesian(this.model.returnTransformedPosition("EPSG:25832")).split(",")
        QRCode.toCanvas(canvas, text, function (error) {
            if (error) console.error(error)
            console.log('success!');
        })
        this.model.saveclicked();
    },
    createQR: function(){
        var QRCode = require("qrcode")
        var canvas = document.getElementById("QRplaceHolder")
        document.getElementById("QRplaceHolderLabel").innerHTML = "Scannen Sie den QR-Code mit Ihrem Endgerät";

        //$('QRplaceHolderLabel').remove();
        //document.getElementById("QRplaceHolderLabel").fillText("Hello World",10,50);
        //var text = this.model.getCartesian(this.model.returnTransformedPosition("EPSG:25832")).split(",")
        var text2 = this.model.getCartesian(this.model.returnTransformedPosition("EPSG:25832")).split("&easting=")
        //console.log(text2)
        var text3 = "https://thawing-brushlands-15739.herokuapp.com/new.html?northing=" + text2
        QRCode.toCanvas(canvas, text3, function (error) {
            if (error) console.error(error)
            console.log('success!');
        })
       // this.setElement(document.getElementsByClassName("win-body")[10]);
       // window.adjustPosition("top: 414px; left: 262px");
    },
  });

export default PostItQRView;