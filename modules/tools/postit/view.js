import PostitTemplate from "text-loader!./template.html";
import PostitModel from "./model";

const View = Backbone.View.extend({
    template: _.template(PostitTemplate),
    // wird aufgerufen wenn die View erstellt wird
    initialize: function () {
        this.render();
    },
    id: "postit",
    model: new PostitModel(),
    render: function () {
        $(this.el).html(this.template());
        $("body").append(this.$el);
      }
  });

export default View;