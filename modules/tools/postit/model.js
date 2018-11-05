const Model = Backbone.Model.extend({
    // wird aufgerufen wenn das Model erstellt wird
    initialize: function () {

    },
    setIsActive: function (bool){
    },
    createInteraction: function () {
      this.setProjections(Radio.request("CRS", "getProjections"));
      this.setMapProjection(Radio.request("MapView", "getProjection"));
      this.setSelectPointerMove(new Pointer({
          handleMoveEvent: function (evt) {
              console.log("move event");
              //this.checkPosition(evt.coordinate);
          }.bind(this),
          handleDownEvent: function (evt) {
            console.log("down event");
              //this.positionClicked(evt.coordinate);
          }.bind(this)
      }, this));

      //Radio.trigger("Map", "addInteraction", this.get("selectPointerMove"));
  }
  });

  export default Model;