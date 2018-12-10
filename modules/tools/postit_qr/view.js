import PostItQRTemplate from "text-loader!./template.html";
import PostItQRModel from "./model";

const PostItQRView = Backbone.View.extend({
    template: _.template(PostItQRTemplate),
    id: "postItQR",
    model: new PostItQRModel(),
    events: {
        //input events
        "click #deletePostitsButton": "hideQrMarker",
        // "click #newPostitButton": "newPostit"
    },
    
    initialize: function () {
        //listeners on model
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "change:positionMapProjection": this.createQR,
        });
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
        this.model.get("qrOverlay").setElement(this.$el[0]);
    },

    render: function (model, value) {
        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents();
            this.model.createInteraction();
            this.model.createQrLayer();
            document.getElementById("popup-content").style.visibility = "hidden";
        }
        else {
            this.hideQrMarker();
            this.model.get("qrOverlay").setElement(this.$el[0]);
            $("#map").removeClass("cursor-crosshair");
            $("#cursorGlyph").remove();
            $("#map").off("mousemove");
            this.model.removeInteraction();
            this.undelegateEvents();
        }
    },

    createQR: function () {
        var position = this.model.returnTransformedPosition(this.model.getCurrentProjectionName());
        var content = document.getElementById('popup-content');
        content.style.visibility = "visible";

        document.getElementById("QRplaceHolderLabel").innerHTML = "Scannen Sie den QR-Code mit Ihrem Endgerät.";
        document.getElementById('image').src = this.model.getqrBild();
        this.model.get("qrOverlay").set("element", content);
        this.showQrMarker(position);

    },

    showQrMarker: function (coordinate) {
        this.$el.show();
        this.model.get("qrOverlay").setPosition(coordinate);
    },

    hideQrMarker: function () {
        // this.$el.hide();
        document.getElementById("popup-content").style.visibility = "hidden";

        this.model.get("qrOverlay").setPosition(undefined);
    },

    deletePostits: function () {
        this.model.set("isActive", false);
    }
});

export default PostItQRView;