import PostitTemplate from "text-loader!./template.html";
import PostitModel from "./model";

const View = Backbone.View.extend({
    template: _.template(PostitTemplate),
    // wird aufgerufen wenn die View erstellt wird
    initialize: function () {
        //this.render();
        this.listenTo(this.model, {
            "change:isActive change:url": this.render,
        });
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },
    id: "postit",
    model: new PostitModel(),
    render: function (model, value) {
        console.log("rendered");
        $(this.el).html(this.template());
        $("body").append(this.$el);
        return this;
      }
  });

export default View;