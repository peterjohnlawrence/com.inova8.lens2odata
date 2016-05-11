jQuery.sap.require("control.dataPropertyFilter");
jQuery.sap.require("control.dataPropertyConjunctionFilter");
jQuery.sap.require("control.extendFilter");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.dataPropertyFilters", {
		metadata : {
			properties : {},
			aggregations : {
				_dataPropertyFilter : {
					type : "control.dataPropertyFilter",
					multiple : false
				},
				_dataPropertyConjunctionFilters : {
					type : "control.dataPropertyConjunctionFilter",
					multiple : true
				},
				_extendFilter : {
					type : "control.extendFilter",
					multiple : false
				}
			},
			events : {
				dataPropertyFiltersChanged : {
					enablePreventDefault : true
				}
			}
		},
		init : function() {
			var self = this;
			self.setAggregation("_dataPropertyFilter", new control.dataPropertyFilter({
				dataPropertyFilterDeleted : function(oEvent) {
					// TODO is this really the best way to delete an element?
					var currentModel = oEvent.getSource().getModel("queryModel");
					var currentContext = oEvent.getSource().getBindingContext("queryModel");
					var path = currentContext.getPath().split("/");
					var index = path[path.length - 1];
					var dataPropertyFiltersContextPath = currentContext.getPath().slice(0, -(1 + index.length))
					var dataPropertyFiltersContext = new sap.ui.model.Context("queryModel", dataPropertyFiltersContextPath);
					var currentModelData = currentModel.getProperty("", dataPropertyFiltersContext);
					if (jQuery.isEmptyObject(currentModelData.conjunctionFilters)) {
						currentModelData.dataPropertyFilter = {};
					} else {
						currentModelData.dataPropertyFilter = currentModelData.conjunctionFilters[0].dataPropertyFilter;
						currentModelData.conjunctionFilters.splice(0, 1);
					}
					currentModel.refresh();
					self.fireDataPropertyFiltersChanged();
					// self.getParent().getParent().rerender();
				}
			}).bindElement("queryModel>dataPropertyFilter"));
			// TODO should we use a factory function to ensure correct binding of context?
			self.bindAggregation("_dataPropertyConjunctionFilters", "queryModel>conjunctionFilters", new control.dataPropertyConjunctionFilter({
				deleted : function(oEvent) {
					// TODO is this really the best way to delete an element?
					var currentModel = oEvent.getSource().getModel("queryModel");
					var currentContext = oEvent.getSource().getBindingContext("queryModel");
					var path = currentContext.getPath().split("/");
					var index = path[path.length - 1];
					var dataPropertyFiltersContextPath = currentContext.getPath().slice(0, -(1 + index.length))
					var dataPropertyFiltersContext = new sap.ui.model.Context("queryModel", dataPropertyFiltersContextPath);
					var currentModelData = currentModel.getProperty("", dataPropertyFiltersContext);
					// TODO
					currentModelData.splice(index, 1);
					currentModel.refresh();
					self.fireDataPropertyFiltersChanged();
					// self.getParent().getParent().rerender();
				}
			})// .bindElement("conjunctionFilters")
			);

			self.setAggregation("_extendFilter", new control.extendFilter({
				visible : true,
				text : "[+]",
				icon : "add-filter",
				tooltip : "{i18nModel>dataPropertyFilters.tooltip}",
				press : function(oEvent) {
					var currentModel = self.getModel("queryModel");
					var currentContext = oEvent.getSource().getBindingContext("queryModel");
					// TODO make sure correct type for all occurrences of filter
					var keyProperty = oEvent.getSource().getParent().getParent().getDataProperty();
					var type = keyProperty.type;
					var sOperator = sap.ui.getCore().getModel("datatypesModel").getProperty("/datatypes/" + type + "/operators/0/operator")
					var currentModelData = currentModel.getProperty("", currentContext);
					if (jQuery.isEmptyObject(currentModelData)) {
						currentModelData = {
							"_class" : "DataPropertyFilters",
							"dataPropertyFilter" : {
								"_class" : "DataPropertyFilter",
								"operator" : sOperator,
								"type" : type
							}
						};
					} else {
						if (jQuery.isEmptyObject(currentModelData.dataPropertyFilter)) {
							currentModelData.dataPropertyFilter = {
								"_class" : "DataPropertyFilter",
								"operator" : sOperator,
								"type" : type
							}
						} else if (jQuery.isEmptyObject(currentModelData.conjunctionFilters)) {
							currentModelData.conjunctionFilters = [ {
								"_class" : "ConjunctionFilter",
								"filterConjunction" : sap.ui.getCore().getModel("i18nModel").getProperty("dataPropertyFilters.and"),
								"dataPropertyFilter" : {
									"_class" : "DataPropertyFilter",
									"operator" : sOperator,
									"type" : type
								}
							} ]
						} else {
							currentModelData.conjunctionFilters.push({
								"_class" : "ConjunctionFilter",
								"filterConjunction" : sap.ui.getCore().getModel("i18nModel").getProperty("dataPropertyFilters.and"),
								"dataPropertyFilter" : {
									"_class" : "DataPropertyFilter",
									"operator" : sOperator,
									"type" : type
								}
							});
						}
					}
					self.getAggregation("_extendFilter").setVisible(true);
					currentModel.refresh();
					self.fireDataPropertyFiltersChanged();
				}
			}));
		},

		renderer : function(oRm, oControl) {
			if (!jQuery.isEmptyObject(oControl.getAggregation("_dataPropertyFilter"))) {
				oRm.renderControl(oControl.getAggregation("_dataPropertyFilter"));
				var dataPropertyConjunctionFilters = oControl.getAggregation("_dataPropertyConjunctionFilters");
				if (!jQuery.isEmptyObject(dataPropertyConjunctionFilters)) {
					for (var i = 0; i < dataPropertyConjunctionFilters.length; i++) {
						oRm.renderControl(dataPropertyConjunctionFilters[i]);
					}
				}
			}
			oRm.write("&nbsp;");
			oRm.renderControl(oControl.getAggregation("_extendFilter"));
		}
	});
});