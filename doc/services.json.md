>Zurück zur [Dokumentation Masterportal](doc.md).

[TOC]

# services.json #
Die den Portalen zur Verfügung stehenden Dienste (WMS und WFS) bzw. deren Layer werden in einer JSON-Datei konfiguriert und gepflegt. Die Datei wird in der Datei *config.js*  der einzelnen Portale unter dem Parameter *layerConf* über ihren Pfad referenziert. Als Beispiel für eine solche Datei ist in *examples.zip* im Verzeichnis */examples/lgv-config*  *services-internet-webatlas.json* vorhanden. Hier werden alle Informationen der Layer hinterlegt, die das Portal für die Nutzung der Dienste benötigt. Die Konfiguration unterscheidet sich leicht zwischen WMS und WFS. Hier geht es zu einem [Beispiel](https://bitbucket.org/lgv-g12/lgv-config-public/raw/master/services-internet.json).

## WMS-Layer ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|cache|nein|Boolean||Ist dieser Layer Teil eines gecachten Dienstes? Wenn true wird bei Portalen, die in der [config.json](config.json.md) den „Baumtyp“ = „default“ benutzen, dieser Layer den Layern vorgezogen, die mit demselben Metadatensatz verknüpft sind, aber „cache“ = false haben. Bei anderen Baumtypen hat dieser Parameter keine Auswirkungen.|`false`|
|[datasets](#markdown-header-wms_wfs_datasets)|nein|Object||Verknüpfung zu den Metadaten. Hier werden die Metadatensätze der Datensätze angegeben, die in diesem Layer dargestellt werden. Sie werden nach Click auf den „i“-Button des Layers in den Layerinformationen über die CSW-Schnittstelle angesprochen und dargestellt. Dazu muss in der [rest-services.json](rest-services.json.md) die URL des Metadatenkatalogs bzw. seiner CSW-Schnittstelle angegeben sein. Die Angaben unter *kategorie_opendata*, *kategorie_inspire* und *kategorie_organisation* werden verwandt, um die Layer in die entprechenden Kategorien einzuordnen, wenn in der [config.json](config.json.md) der Baumtyp *default* gesetzt ist.||
|featureCount|ja|String||Anzahl der zurückzugebenden Features bei GFI-Abfragen. Entspricht dem *GetFeatureInfo-Parameter "FEATURE_COUNT"*|`"1"`|
|format|ja|String||Grafikformat der Kachel, die vom Portal über den *GetMap* aufgerufen wird. Muss einem der Werte aus den Capabilities unter *Capability/Request/GetMap/Format* entsprechen.|`"image/jpeg"`|
|gfiAttributes|ja|String||GFI-Attribute die angezeigt werden sollen. Hier erlauben Key-Value-Paare die portalseitige Übersetzung manchmal diensteseitig kryptischer Attributnamen in lesbare. Weitere Optionen sind: **ignore**: keine GFI-Abfrage möglich, **showAll**: alle GFI-Attribute werden abgefragt und wie vom Dienst geliefert angezeigt. Bestimmte Standard-Attribute ohne Informationswert für den Benutzer werden immer aus der Anzeige im Portal ausgeschlossen, z.B. *SHAPE, OBJECTID* etc.|`"ignore"`| 
|gfiTheme|ja|String||Darstellungsart der GFI-Informationen für diesen Layer. Wird hier nicht *default* gewählt, können eigens für diesen Layer erstellte Templates ausgewählt werden, die es erlauben die GFI-Informationen in anderer Struktur als die Standard-Tabellendarstellung anzuzeigen.|`"default"`|
|gutter|nein|String|"0"|Wert in Pixel, mit dem bei gekachelten Anfragen die Kacheln überlagert werden. Dient zur Vermeidung von abgeschnittenen Symbolen an Kachelgrenzen.|`"0"`|	
|id|ja|String||Frei wählbare Layer-ID|`"8"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|layers|ja|String||Layername im Dienst. Dieser muss dem Wert aus den Dienste-Capabilities unter *Layer/Layer/Name* entsprechen.|`"1"`|
|legendURL|ja|String||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.|`"ignore"`|
|maxScale|ja|String||Bis zu diesem Maßstab wird der Layer im Portal angezeigt|`"1000000"`|
|minScale|nein|String||Ab diesem Maßstab wird der Layer im Portal angezeigt|`"0"`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Luftbilder DOP 10"`|
|singleTile|nein|Boolean||Soll die Grafik als eine große Kachel ausgeliefert werden? Wenn true wird immer der gesamte Kartenausschnitt angefragt, wenn false wird der Kartenausschnitt in kleineren Kacheln angefragt und zusammengesetzt.|`false`|
|tilesize|ja|String||Kachelgröße in Pixel. Diese wird verwandt wenn singleTile=false gesetzt ist.|`"512"`|
|transparent|ja|Boolean||Hintergrund der Kachel transparent oder nicht (false/true). Entspricht dem GetMap-Parameter *TRANSPARENT*|`true`|
|typ|ja|String||Diensttyp, in diesem Fall WMS ([WFS siehe unten](#markdown-header-wfs-layer))|`"WMS"`|
|url|ja|String||Dienste URL|`"https://geodienste.hamburg.de/HH_WMS_DOP10"`|
|version|ja|String||Dienste Version, die über GetMap angesprochen wird.|`"1.3.0"`|
**Beispiel WMS:**


```
#!json

{
      "id" : "8",
      "name" : "Luftbilder DOP 10",
      "url" : "https://geodienste.hamburg.de/HH_WMS_DOP10",
      "typ" : "WMS",
      "layers" : "1",
      "format" : "image/jpeg",
      "version" : "1.3.0",
      "singleTile" : false,
      "transparent" : true,
      "tilesize" : "512",
      "gutter" : "0",
      "minScale" : "0",
      "maxScale" : "1000000",
      "gfiAttributes" : "ignore",
      "gfiTheme" : "default",
      "layerAttribution" : "nicht vorhanden",
      "legendURL" : "ignore",
      "cache" : false,
      "featureCount" : "1",
      "datasets" : [
         {
            "md_id" : "25DB0242-D6A3-48E2-BAE4-359FB28491BA",
            "rs_id" : "HMDK/25DB0242-D6A3-48E2-BAE4-359FB28491BA",
            "md_name" : "Digitale Orthophotos 10cm - FHHNET",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "Sonstiges"
            ],
            "kategorie_inspire" : [
               "nicht INSPIRE-identifiziert"
            ],
            "kategorie_organisation" : "Landesbetrieb Geoinformation und Vermessung"
         }
      ]
   }
```


## WFS-Layer ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|[datasets](#markdown-header-wms_wfs_datasets)|ja|Object||Hier werden die Metadatensätze der dargestellten Datensätze referenziert. Diese Werden in der Layerinfo (i-Knopf) im Portal zur Laufzeit aus dem Metadatenkatalog bzw. seiner CS-W – Schnittstelle abgerufen und dargestellt. Die Angaben unter „Kategorie_...“ werden im default-tree zur Auswahl der Kategorien bzw. zur Strukturierung des Layerbaums verwandt.||
|featureNS|ja|String||featureNamespace. Ist gewöhnlich im Header der WFS-Capabilities referenziert und löst den Namespace auf, der unter FeatureType/Name angegeben wird.|`"http://www.deegree.org/app"`|
|featureType|ja|String||featureType-Name im Dienst. Dieser muss dem Wert aus den Dienste-Capabilities unter *FeatureTypeList/FeatureType/Name* entsprechen. Allerdings ohne Namespace.|`"bab_vkl"`|
|gfiAttributes|ja|String||GFI-Attribute die angezeigt werden sollen. Hier erlauben Key-Value-Paare die portalseitige Übersetzung manchmal diensteseitig kryptischer Attributnamen in lesbare. Weitere Optionen sind: **ignore**: keine GFI-Abfrage möglich, **showAll**: alle GFI-Attribute werden abgefragt und wie vom Dienst geliefert angezeigt. Bestimmte Standard-Attribute ohne Informationswert für den Benutzer werden immer aus der Anzeige im Portal ausgeschlossen, z.B. *SHAPE, OBJECTID* etc.|`"showAll"`| 
|id|ja|String||Frei wählbare Layer-ID|`"44"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|legendURL|nein|String||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.|`""`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Verkehrslage auf Autobahnen"`|
|typ|ja|String||Diensttyp, in diesem Fall WFS ([WMS siehe oben](#markdown-header-wms-layer))|`"WFS"`|
|url|ja|String||Dienste URL|`"https://geodienste.hamburg.de/HH_WFS_Verkehr_opendata"`|
|version|nein|String||Dienste Version, die über GetFeature angesprochen wird.|`"1.1.0"`|

**Beispiel WFS:**


```
#!json

{
      "id" : "44",
      "name" : "Verkehrslage auf Autobahnen",
      "url" : "https://geodienste.hamburg.de/HH_WFS_Verkehr_opendata",
      "typ" : "WFS",
      "featureType" : "bab_vkl",
      "format" : "image/png",
      "version" : "1.1.0",
      "featureNS" : "http://www.deegree.org/app",
      "gfiAttributes" : "showAll",
      "layerAttribution" : "nicht vorhanden",
      "legendURL" : "",
      "datasets" : [
         {
            "md_id" : "2FC4BBED-350C-4380-B138-4222C28F56C6",
            "rs_id" : "HMDK/6f62c5f7-7ea3-4e31-99ba-97407b1af9ba",
            "md_name" : "Verkehrslage auf Autobahnen (Schleifen) Hamburg",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "Transport und Verkehr"
            ],
            "kategorie_inspire" : [
               "nicht INSPIRE-identifiziert"
            ],
            "kategorie_organisation" : "Behörde für Wirtschaft, Verkehr und Innovation"
         }
      ]
   }
```

## WMS_WFS_datasets ##

Hier werden die Metadatensätze der dargestellten Datensätze referenziert. Diese werden in der Layerinfo (i-Knopf) im Portal zur Laufzeit aus dem Metadatenkatalog bzw. seiner CS-W – Schnittstelle abgerufen und dargestellt. Die Angaben unter *kategorie..* werden im default-tree zur Auswahl der Kategorien bzw. zur Strukturierung des Layerbaums verwandt.

|Name|Verpflichtend|Typ|default|Beschreibung|
|----|-------------|---|-------|------------|
|md_id|nein|String||Metadatensatz-Identifier des Metadatensatzes|
|rs_id|nein|String||Ressource-Identifier des Metadatensatzes|
|md_name|nein|String||Name des Datensatzes|
|bbox|nein|String||Ausdehnung des Datensatzes|
|kategorie_opendata|nein|String||Opendata-Kategorie aus der Codeliste von govdata.de|
|kategorie_inspire|nein|String||Inspire-Kategorie aus der Inspire-Codeliste wenn vorhanden, wenn nicht vorhanden *„nicht Inspire-identifiziert“*|
|kategorie_organisation|nein|String||Organisationsname der datenhaltenden Stelle|

>Zurück zur [Dokumentation Masterportal](doc.md).