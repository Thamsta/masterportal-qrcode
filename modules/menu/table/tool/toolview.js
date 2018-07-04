define(function (require) {

    var ToolTemplate = require("text!modules/menu/table/tool/tooltemplate.html"),
        $ = require("jquery"),
        ToolView;

    ToolView = Backbone.View.extend({
        events: {
            "click": "checkItem"
        },
        initialize: function () {
            this.render();
        },
        id: "table-tool",
        className: "table-tool",
        template: _.template(ToolTemplate),
        render: function () {
            var attr = this.model.toJSON();

            $("#table-tools-menu").append(this.$el.html(this.template(attr)));

            return this;
        },
        checkItem: function () {
            if (this.model.getName() === "legend") {
                Radio.trigger("Legend", "toggleLegendWin");
            }
            else {
                this.model.setIsActive(true);
            }
        }
    });

    return ToolView;
});