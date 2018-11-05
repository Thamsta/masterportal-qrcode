import PostItTemplate from "text-loader!./template.html";
import PostItModel from "./model";

const PostItView = Backbone.View.extend({
    template: _.template(PostItTemplate),
    // wird aufgerufen wenn die View erstellt wird
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive change:url": this.render,
            "click button": this.testcall,
        });
        this.testcall();
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },
    id: "postit",
    model: new PostitModel(),
    render: function (model, value) {
        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.model.createInteraction();
            this.$el.html(this.template(model.toJSON()));
            this.changedPosition();
            this.delegateEvents();
        }
        else {
            this.model.setUpdatePosition(true);
            this.model.removeInteraction();
            this.undelegateEvents();
        }
        return this;
      },
      testcall: function(){
        console.log("testcall called");
        /*
        $.get("http://localhost:8080/get/bier", function(data){
            console.log("success");
        }).fail(function(error){
            console.log("error");
            console.log(error);
        })
        var request = $.ajax("http://localhost:8080/get/bier")
            .done(function() {
                console.log("success");
            })
            .fail(function(jq,textStatus,httperror) {
                console.log(jq);
                console.log(textStatus);
                console.log(httperror);
            })
            .always(function() {
            });  */ 
      },
  });

export default PostItView;