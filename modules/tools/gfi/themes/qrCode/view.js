import ThemeView from "../view";
import qrCodeTemplate from "text-loader!./template.html";

const qrCodeThemeView = ThemeView.extend({
    tagName: "table",
    className: "table table-condensed table-hover popover-trinkwasser",
    template: _.template(qrCodeTemplate)
});

export default qrCodeThemeView;
