import PostItTemplate from "text-loader!./template.html";
import PostItModel from "./model";

const PostItView = Backbone.View.extend({
    template: _.template(PostItTemplate),
    // wird aufgerufen wenn die View erstellt wird
    initialize: function () {
        this.render();
    },
    id: "postIt",
    model: new PostItModel(),
    render: function () {
        $(this.el).html(this.template());
        $("body").append(this.$el);
    }
});

export default PostItView;
