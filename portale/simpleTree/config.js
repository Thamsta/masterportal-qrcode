define(function() {

    var config = {
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: true,
            poi: false
        },
        isMenubarVisible: true,
        layerConf: "../components/lgv-config/services-fhhnet.json",
        menu: {
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false
        },
        menubar: true,
        print: {
            printID: "99999",
            title: "Master-Portal",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        scaleLine: true,
        searchBar: {
            bkg: {
                minChars: 3,
                bkgSuggestURL: "/bkg_suggest",
                bkgSearchURL: "/bkg_geosearch",
                extent: [454591, 5809000, 700000, 6075769],
                epsg: "EPSG:25832",
                filter: "filter=(typ:*)",
                score: 0.6
            },
            tree: {
                minChars: 3
            },
            placeholder: "Suche nach Ort/Thema",
            geoLocateHit: true
        },
        styleConf: "../components/lgv-config/style.json",
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            draw: false,
            active: "gfi",
            record: false
        },
        tree: {
            type: "custom",
            filter: false,
            customConfig: "../components/lgv-config/tree-config/simpleTree.json",
            baseLayer: [
                {
                    id: "39",
                    visibility: true
                },
                {
                    id: "487",
                    visibility: false
                },
                {
                    id: "2625",
                    visibility: false
                }
            ],
        },
        view: {
            center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769], // extent aus altem portal erzeugt fehler im webatlas und suchdienst
            resolution: 76.43718115953851,
            options: [
                {
                    resolution: 76.43718115953851,
                    scale: "288896",
                    zoomLevel: 0
                },
                {
                    resolution: 38.21859057976939,
                    scale: "144448",
                    zoomLevel: 1
                },
                {
                    resolution: 19.109295289884642,
                    scale: "72223",
                    zoomLevel: 2
                },
                {
                    resolution: 9.554647644942321,
                    scale: "36112",
                    zoomLevel: 3
                },
                {
                    resolution: 4.7773238224711605,
                    scale: "18056",
                    zoomLevel: 4
                },
                {
                    resolution: 2.3886619112355802,
                    scale: "9028",
                    zoomLevel: 5
                },
                {
                    resolution: 1.1943309556178034,
                    scale: "4514",
                    zoomLevel: 6
                },
                {
                    resolution: 0.5971654778089017,
                    scale: "2257",
                    zoomLevel: 7
                }
            ]
        },
        wfsImgPath: "../components/lgv-config/img/"
    };

    return config;
});