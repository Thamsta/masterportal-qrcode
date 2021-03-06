const FooterModel = Backbone.Model.extend({
    defaults: {
        urls: [
            {
                "bezeichnung": "Kartographie und Gestaltung: ",
                "url": "http://www.geoinfo.hamburg.de/",
                "alias": "Landesbetrieb Geoinformation und Vermessung",
                "alias_mobil": "LGV Hamburg"
            }
        ]
    }
});

export default FooterModel;
