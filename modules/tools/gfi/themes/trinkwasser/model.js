import Theme from "../model";

const TrinkwasserTheme = Theme.extend({

    initialize: function () {
        this.listenTo(this, {
            "change:isReady": this.splitContent,
            "change:isVisible": this.testMethode,
        });
    },
    splitContent: function () {
        console.log("trinkwasser 1");
        var allgemContent = {},
            mikrobioContent = {},
            chemContent = {};

        if (_.isUndefined(this.get("gfiContent")) === false) {
            _.each(this.get("gfiContent"), function (element) {
                _.each(element, function (value, key) {
                    if (_.contains(["Entnahmedatum", "Bezirk", "Stadtteil", "Versorgungsgebiet"], key)) {
                        allgemContent[key] = value;
                    }
                    else if (_.contains(["Coliforme Bakterien", "Coliforme Bakterien MPN", "Escherichia coli", "Escherichia coli (E.coli) MPN", "Koloniezahl, 36°C", "Koloniezahl, 20°C", "intestinale Enterokokken", "Coliforme Bakterien Grenzwertwarnung", "Coliforme Bakterien MPN Grenzwertwarnung", "Escherichia coli Grenzwertwarnung", "Escherichia coli (E.coli) MPN Grenzwertwarnung", "Koloniezahl, 36°C Grenzwertwarnung", "Koloniezahl, 20°C Grenzwertwarnung", "intestinale Enterokokken Grenzwertwarnung"], key)) {
                        mikrobioContent[key] = value;
                    }
                    else {
                        chemContent[key] = value;
                    }
                });
            });

            this.set("gfiContent", {"allgemContent": allgemContent, "mikrobioContent": mikrobioContent, "chemContent": chemContent});
        }
    },
    testMethode: function (){
        console.log("trinkwasser 2");

    }
});

export default TrinkwasserTheme;
