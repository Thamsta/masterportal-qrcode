import DrawTemplate from "text-loader!./template.html";
import DownloadView from "../download/view";

const DrawToolView = Backbone.View.extend({
    events: {
        "change .interaction": "setDrawType",
        "keyup .text input": "setText",
        "change .font-size select": "setFontSize",
        "change .font select": "setFont",
        "change .radius select": "setRadius",
        "change .stroke-width select": "setStrokeWidth",
        "change .opacity select": "setOpacity",
        "change .color select": "setColor",
        "change select": "createDrawInteraction",
        "keyup input": "createDrawInteraction",
        "click .delete": "deleteFeatures",
        "click .modify.once": "createModifyInteraction",
        "click .modify": "toggleInteraction",
        "click .trash.once": "createSelectInteraction",
        "click .trash": "toggleInteraction",
        "click .btn-primary": "enableAllElements",
        "click .downloadDrawing": "downloadFeatures"
    },
    initialize: function () {
        this.template = _.template(DrawTemplate);

        new DownloadView();

        this.listenTo(this.model, {
            "change:isActive": this.render
        });
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },
    render: function (model, value) {
        if (value) {

            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents();
            this.renderForm();
            this.renderGlyphicon();
        }
        else {
            $("#map").removeClass("no-cursor");
            $("#map").removeClass("cursor-crosshair");
            $("#cursorGlyph").remove();
            $("#map").off("mousemove");
            this.undelegateEvents();
        }
        return this;
    },

    renderForm: function () {
        var element = this.$el.find(".interaction")[0];

        switch (element.options[element.selectedIndex].text) {
            case "Punkt zeichnen": {
                this.$el.find(".text").toggle(false);
                this.$el.find(".font-size").toggle(false);
                this.$el.find(".font").toggle(false);
                this.$el.find(".radius").toggle(true);
                this.$el.find(".stroke-width").toggle(false);
                break;
            }
            case "Text schreiben": {
                this.$el.find(".text").toggle(true);
                this.$el.find(".font-size").toggle(true);
                this.$el.find(".font").toggle(true);
                this.$el.find(".radius").toggle(false);
                this.$el.find(".stroke-width").toggle(false);
                break;
            }
            default: {
                this.$el.find(".text").toggle(false);
                this.$el.find(".font-size").toggle(false);
                this.$el.find(".font").toggle(false);
                this.$el.find(".radius").toggle(false);
                this.$el.find(".stroke-width").toggle(true);
                break;
            }
        }
    },

    renderGlyphicon: function () {
        $("#map").after("<span id='cursorGlyph' class='glyphicon glyphicon-pencil'></span>");

        $("#map").mousemove(function (e) {
            $("#cursorGlyph").css("left", e.offsetX + 5);
            $("#cursorGlyph").css("top", e.offsetY + 50 - 15); // absolute offset plus height of menubar (50)
        });
    },

    setDrawType: function (evt) {
        var element = evt.target,
            selectedElement = element.options[element.selectedIndex];

        this.model.setDrawType(selectedElement.value, selectedElement.text);
        this.renderForm();
    },

    createDrawInteraction: function () {
        this.model.createDrawInteraction(this.model.get("drawType"), this.model.get("layer"));
    },

    /**
     * removes the class 'once' from target and
     * calls createModifyInteraction in the model
     * @param {MouseEvent} evt -
     * @returns {void}
     */
    createModifyInteraction: function (evt) {
        $(evt.target).removeClass("once");
        this.model.createModifyInteraction(this.model.get("layer"));
    },

    /**
     * removes the class 'once' from target and
     * calls createSelectInteraction in the model
     * @param {MouseEvent} evt -
     * @returns {void}
     */
    createSelectInteraction: function (evt) {
        $(evt.target).removeClass("once");
        this.model.createSelectInteraction(this.model.get("layer"));
    },

    toggleInteraction: function (evt) {
        $(evt.target).toggleClass("btn-primary");
        if ($(evt.target).hasClass("btn-primary") === true) {
            this.disableAllElements();
            $(evt.target).prop("disabled", false);
        }
        this.model.toggleInteraction($(evt.target));
    },

    enableAllElements: function () {
        this.$el.find("button:disabled, select:disabled").each(function () {
            $(this).prop("disabled", false);
        });
    },

    disableAllElements: function () {
        this.$el.find("button, select").each(function () {
            $(this).prop("disabled", true);
        });
    },

    deleteFeatures: function () {
        this.model.deleteFeatures();
    },

    downloadFeatures: function () {
        this.model.downloadFeatures();
    },

    setFont: function (evt) {
        this.model.setFont(evt.target.value);
    },

    setText: function (evt) {
        this.model.setText(evt.target.value);
    },

    setFontSize: function (evt) {
        this.model.setFontSize(evt.target.value);
    },

    setColor: function (evt) {
        var colors = evt.target.value.split(","),
            newColor = [];

        colors.forEach(function (color) {
            newColor.push(parseInt(color, 10));
        });
        newColor.push(this.model.get("opacity"));
        this.model.setColor(newColor);
    },

    setRadius: function (evt) {
        this.model.setRadius(evt.target.value);
    },

    setStrokeWidth: function (evt) {
        this.model.setStrokeWidth(evt.target.value);
    },

    setOpacity: function (evt) {
        var newColor = this.model.get("color");

        newColor[3] = parseFloat(evt.target.value);
        this.model.setColor(newColor);
        this.model.setOpacity(parseFloat(evt.target.value));
    }
});

export default DrawToolView;
