import Theme from "../model";

const qrCodeTheme = Theme.extend({

    initialize: function () {
        this.listenTo(this, {
            "change:isVisible": this.render
        });
    },
    render: function () {
       console.log("Success!");
    }
});

export default qrCodeTheme;
