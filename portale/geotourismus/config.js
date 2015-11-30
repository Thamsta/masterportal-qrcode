/*global define*/
define(function () {

    var config = {
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        view: {
            center: [565874, 5934140] // Rathausmarkt
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: true,
            poi: true
        },
        footer: true,
        quickHelp: true,
        layerConf: "../components/lgv-config/services-internet.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        categoryConf: "../components/lgv-config/category.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true},
                {id: "2056", visible: true, style: "2056", clusterDistance: 30, styleField: "kategorie"},
                {id: "353", visible: true, style: "353", clusterDistance: 30, styleField: "kategorie"},
                {id: "2059", visible: true, style: "2059", clusterDistance: 30, styleField: "kategorie"},
                {id: "2057", visible: true, style: "2057", clusterDistance: 30, styleField: "kategorie"},
                {id: "356", visible: true, style: "356", clusterDistance: 30, styleField: "kategorie"},
                {id: "2060", visible: true, style: "2060", clusterDistance: 30, styleField: "kategorie"},
                {id: "2054", visible: true, style: "2054", clusterDistance: 30, styleField: "kategorie"},
                {id: "2058", visible: true, style: "2058", clusterDistance: 30, styleField: "kategorie"}
            ]
        },
        menubar: true,
        scaleLine: true,
        isMenubarVisible: false,
        menu: {
            viewerName: "GeoViewer",
            searchBar: false,
            layerTree: true,
            helpButton: false,
            contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false,
            addWMS: false
        },
        startUpModul: "",
        tools: {
            gfi: true,
            measure: false,
            print: false,
            coord: false,
            draw: false,
            record: false,
            active: "gfi"
        }
    };

    return config;
});
