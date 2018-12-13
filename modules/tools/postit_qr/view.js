import PostItQRTemplate from "text-loader!./template.html";
import PostItQRModel from "./model";

const PostItQRView = Backbone.View.extend({
    template: _.template(PostItQRTemplate),

    id: "postItQR",
    model: new PostItQRModel(),
    events: {
        "click #toggleCreate": "toggleCreatePostItQR",
        "click #toggleView": "togglePostItSelectView",
        "click #select_popup_closer": "hidePostItSelect",
        "click #qr_popup_closer": "hidePostItQR",
    },

    initialize: function () {
        //listeners on model
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "change:positionMapProjection": this.createPostItQR,
            "change:selected_feature_content": this.createPostItSelectView,
        });
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },

    render: function (model, value) {
        if (this.model.get("isActive") === true) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            $('#qr_popup')[0].style.visibility = "hidden";
            $('#select_popup')[0].style.visibility = "hidden";

            this.delegateEvents();
            this.model.createQrLayer();
            this.model.createInteraction();
            if (this.model.get("view")){
                this.model.createSelectInteraction();
            }
        }
        else {
            this.hidePostItQR();
            this.hidePostItSelect();
            this.model.removeSelectInteraction();
            this.model.removeInteraction();
            this.model.removeQrLayer();
            this.undelegateEvents();
        }
    },

    createPostItSelectView: function () {
        var selected_feature_content = this.model.getSelectFeatureContent();
        var position2 = selected_feature_content[3].getCoordinates();
        var content = $('#select_popup')[0];
        $('#select_popup')[0].style.visibility = "visible";
        $("#titel_content")[0].innerHTML = selected_feature_content[0];
        $('#kategorie_content')[0].innerHTML = selected_feature_content[1];
        $('#inhalt_content')[0].innerHTML = selected_feature_content[2];
        this.model.getSelectOverlay().set("element", content);
        this.showPostItSelect(position2);
    },

    createPostItQR: function () {
        var position = this.model.returnTransformedPosition(this.model.getCurrentProjectionName());
        var content = $('#qr_popup')[0];
        $('#QRplaceHolderLabel')[0].innerHTML = "Scannen Sie den QR-Code mit Ihrem Endgerät.";
        $('#image')[0].src = this.model.getqrBild();
        this.model.getqrOverlay().set("element", content);

        this.showPostItQR(position);
    },

    showPostItQR: function (coordinate) {
        $('#qr_popup')[0].style.visibility = "visible";
        this.model.getqrOverlay().setPosition(coordinate);
    },

    hidePostItQR: function () {
        // $('#qr_popup')[0].style.visibility = "hidden";
        this.model.getqrOverlay().setPosition(undefined);

    },

    showPostItSelect: function (coordinate) {
        this.model.getSelectOverlay().setPosition(coordinate);
    },

    hidePostItSelect: function () {
        // $('#select_popup')[0].style.visibility = "hidden";
        this.model.getSelectOverlay().setPosition(undefined);
    },

    togglePostItSelectView: function () {
        if (this.model.get("view")) {
            this.model.removeSelectInteraction();
            this.hidePostItSelect();
            this.model.set("view", false);
        }
        else {
            this.model.createSelectInteraction();
            this.model.set("view", true);
        }
        this.model.toggleQrLayer();
    },
    toggleCreatePostItQR: function () {
        if (this.model.get("edit")) {
            this.model.removeInteraction();
            this.hidePostItQR();
            this.model.set("edit", false);
        }
        else {
            this.model.createInteraction();
            this.model.set("edit", true);
        }
    }
});

export default PostItQRView;