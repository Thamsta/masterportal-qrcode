define([
    "backbone",
    "text!modules/menubar/template.html",
    "views/LayerListView",
    "modules/menubar/model",
    "config",
    "eventbus"
], function (Backbone, MenubarTemplate, LayerListView, Menubar, Config, EventBus) {

    var MenubarView = Backbone.View.extend({
        model: Menubar,
        tagName: "nav",
        className: "navbar navbar-default navbar-fixed-top",
        attributes: {role: "navigation"},
        template: _.template(MenubarTemplate),
        initialize: function () {
            EventBus.on("appendItemToMenubar", this.appendItemToMenubar, this);
            this.render();
            $("#tree").on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
        },
        events: {
            "click .filterTree": "activateFilterTree",
            "click .filterWfsFeature": "activateWfsFilter",
            "click .legend": "activateLegend",
            "click .routingModul": "activateRoutingModul",
            "click .addWMS": "activateAddWMSModul",
            "click .wfsFeatureFilter": "activateWfsFeatureFilter"
        },
        render: function () {
            var attr = this.model.toJSON();

            $("body").append(this.$el.append(this.template(attr)));
            if (Config.isMenubarVisible === false) {
                $("#navbarRow").css("display", "none");
            }
            if (_.has(Config, "tree") === true) {
                require(["modules/layerinformation/listView", "modules/layerselection/listView", "modules/layercatalog/listView", "modules/layertree/view", "modules/baselayercatalog/listView", "modules/catalogExtern/listView"], function (LayerInformationListView, LayerSelectionListView, TreeListView, LayerTreeView, BaseLayerListView, CataExView) {
                    new LayerInformationListView();
                    new LayerSelectionListView();
                    new LayerTreeView();
                    new TreeListView();
                    new BaseLayerListView();
                    new CataExView();
                });
            }
            else {
                new LayerListView();
            }
            if (_.has(Config, "title") === true) {
                require(["modules/title/view"], function (TitleView) {
                    new TitleView();
                });
            }
            // new OpenDataTreeList();
        },
        appendItemToMenubar: function (obj) {
            var html = "<li>";

            html += "<a href='#' class='menuitem " + obj.classname + "'>";
            html += "<span class='' + obj.symbol + ''></span>&nbsp;" + obj.title;
            html += "</a>";
            html += "</li>";
            $(".menubarlgv").append(html);
            $("." + obj.classname).on("click", function (evt) {
                EventBus.trigger("toggleWin", [evt.target.className.split(" ")[1], evt.target.text, evt.target.children[0].className]);
            });
        },
        activateFilterTree: function () {
            EventBus.trigger("toggleWin", ["treefilter", "Filtereinstellungen", "glyphicon-filter"]);
        },
        activateWfsFilter: function () {
            EventBus.trigger("toggleFilterWfsWin");
        },
        activateLegend: function () {
            EventBus.trigger("toggleLegendWin");
        },
        activateRoutingModul: function () {
            EventBus.trigger("toggleWin", ["routing", "Routenplaner", "glyphicon-road"]);
        },
        activateAddWMSModul: function () {
            EventBus.trigger("toggleWin", ["addwms", "AddWMS", "glyphicon-road"]);
        },
        activateWfsFeatureFilter: function () {
            EventBus.trigger("toggleWin", ["wfsfeaturefilter", "Filter", "glyphicon-filter"]);
        }
    });

    return MenubarView;

});
