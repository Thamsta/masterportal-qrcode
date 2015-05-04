define(function () {
    var config = {
        allowParametricURL: false,
        view: {
            center: [565874, 5934140],
            resolution: 5.2916638091682096,
            scale: 20000 // für print.js benötigt
        },
        layerConf: "../components/lgv-config/services-fhhnet.json",
        categoryConf: "../components/lgv-config/category.json",
        layerIDs: [
            {id: "453", visible: true},
            {id: "8", visible: false},
            {id: "5182", visible: false, displayInTree: false},
            {id: "5183", visible: false, displayInTree: false}
        ],
        styleConf: "../components/lgv-config/style.json",
        menubar: true,
        scaleLine: false,
        isMenubarVisible: true,
        menu: {
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: true,
            wfsFeatureFilter: false,
            legend: false,
            routing: false
        },
        startUpModul: "",
        // gazetteerURL: locations.host + '/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        searchBar: {
            placeholder: "Suche Adresse, Stadtteil",
            gazetteerURL: function () {
                return "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
            }
        },
        tools: {
            gfi: true,
            measure: false,
            print: true,
            coord: true,
            draw: false,
            orientation: false,
            active: "gfi"
        },
        print: {
            url: function () {
                return "http://wscd0096:8680/mapfish_print_2.0/";
            },
            title: "Strassenbaum-Online",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    }

    return config;
});
