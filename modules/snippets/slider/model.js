define(function (require) {

    var SnippetModel = require("modules/snippets/model"),
        ValueModel = require("modules/snippets/slider/valuemodel"),
        SliderModel;

    SliderModel = SnippetModel.extend({
        initialize: function (attributes) {
            var parsedValues;
            // parent (SnippetModel) initialize
            this.superInitialize();
            parsedValues = this.parseValues(attributes.values);

            this.addValueModels(_.min(parsedValues), _.max(parsedValues));
            if (this.has("initSelectedValues")) {
                this.updateValues(this.getInitSelectedValues());
            }
            this.listenTo(this.getValuesCollection(), {
                "change:value": function (model, value) {
                    this.triggerValuesChanged(model, value);
                    if (model.get("initValue") === value) {
                        this.trigger("render");
                    }
                }
            });
        },

        /**
         * add minValueModel and maxValueModel to valuesCollection
         */
        addValueModels: function (min, max) {
            this.getValuesCollection().add([
                new ValueModel({
                    attr: this.getName(),
                    displayName: this.getDisplayName + " ab",
                    value: min,
                    type: this.getType(),
                    isMin: true
                }),
                new ValueModel({
                    attr: this.getName(),
                    displayName: this.getDisplayName + " bis",
                    value: max,
                    type: this.getType(),
                    isMin: false
                })
            ]);
        },

        /**
         * call the updateValueModel function and/or the updateMaxValueModel
         * trigger the valueChanged event on snippetCollection in queryModel
         * @param  {number | array} value - depending on slider type
         */
        updateValues: function (snippetValues) {
            // range slider
            if (_.isArray(snippetValues) === true) {
                this.getValuesCollection().at(0).setValue(snippetValues[0]);
                this.getValuesCollection().at(1).setValue(snippetValues[1]);
            }
            // slider
            else {
                this.getValuesCollection().at(0).set("value", snippetValues);
            }
        },

        /**
         * returns an object with the slider name and its values
         * @return {object} - contains the selected values
         */
        getSelectedValues: function () {
            return {
                attrName: this.getName(),
                type: this.getType(),
                values: this.getValuesCollection().pluck("value")
            };
        },

        /**
         * parse strings into numbers if necessary
         * @param  {array} valueList
         * @return {number[]} parsedValueList
         */
        parseValues: function (valueList) {
            var parsedValueList = [];

            _.each(valueList, function (value) {
                if (_.isString(value)) {
                    value = parseInt(value, 10);
                }
                parsedValueList.push(value);
            });

            return parsedValueList;
        }
    });

    return SliderModel;
});
