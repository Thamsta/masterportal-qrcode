define([
    "backbone",
    "modules/tools/list",
    "modules/tools/view"
], function (Backbone, TreeList, ToolView) {

    var ToolListView = Backbone.View.extend({
        collection: new TreeList(),
        el: "#tools",
        initialize: function () {
            this.render();
        },
        render: function () {
            this.collection.forEach(this.addTool, this);
            // löscht den letzten divider in der Toolliste
            $("#tools li:last-child").remove();
        },
        addTool: function (tool) {
            var toolView = new ToolView({model: tool});

            this.$el.append(toolView.render().el);
            this.$el.append("<li class='divider'></li>");
        }
    });

    return ToolListView;
});
