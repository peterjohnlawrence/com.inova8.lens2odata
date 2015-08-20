jQuery.sap.require("sparqlish.control.dataPropertyFilterControl");
jQuery.sap.require("sparqlish.control.dataPropertyConjunctionFilterControl");
jQuery.sap.require("sparqlish.control.iconLink");
sap.ui.core.Control.extend("sparqlish.control.dataPropertyFiltersControl", {
	metadata : {
		properties : {
		},
		aggregations : {
			_dataPropertyFilter : {
				type : "sparqlish.control.dataPropertyFilterControl",
				multiple : false
			},
			_dataPropertyConjunctionFilters : {
				type : "sparqlish.control.dataPropertyConjunctionFilterControl",
				multiple : true
			},
			_extendFilter : {
				type : "sparqlish.control.iconLink",
				multiple : false
			}
		}
	},
	init : function() {
		var self = this;
		self.setAggregation("_dataPropertyFilter", new sparqlish.control.dataPropertyFilterControl({
			deleted : function(oEvent) {
				// TODO Should not delete if there are still some conjunctions
				// TODO is this really the best way to delete an element?
				var currentModel = oEvent.getSource().getModel("queryModel");
				var currentContext = oEvent.getSource().getBindingContext("queryModel");
				var path = currentContext.getPath().split("/");
				var index = path[path.length - 1];
				var dataPropertyFiltersContextPath = currentContext.getPath().slice(0, -(1 + index.length))
				var dataPropertyFiltersContext = new sap.ui.model.Context("queryModel", dataPropertyFiltersContextPath);
				var currentModelData = currentModel.getProperty("", dataPropertyFiltersContext);
				// TODO
				currentModelData.dataPropertyFilter = {};
				// currentModel.setData(currentModelData,"queryModel");
				currentModel.refresh();
				self.getParent().rerender();
			}
		}).bindElement("queryModel>dataPropertyFilter"));
		self.bindAggregation("_dataPropertyConjunctionFilters", "queryModel>conjunctionFilters", new sparqlish.control.dataPropertyConjunctionFilterControl({
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
				// currentModel.setData(currentModelData);
				currentModel.refresh();
				self.getParent().rerender();
			}
		})// .bindElement("conjunctionFilters")
		);

		self.setAggregation("_extendFilter", new sparqlish.control.iconLink({
			visible : true,
			text : "[+]",
			icon : "add-filter",
			tooltip : "Add a data filter value",
			press : function(oEvent) {
				var currentModel = self.getModel("queryModel");
				var currentContext = oEvent.getSource().getBindingContext("queryModel");
				var currentModelData = currentModel.getProperty("", currentContext);
				if (currentModelData == null) {
					currentModelData = {
						"_class" : "DataPropertyFilters",
						"dataPropertyFilter" : {
							"_class" : "DataPropertyFilter",
							"condition" : "[enter condition]",
							"value" : "[enter value]",
							"datatype" : null
						}
					};
				} else {
					if (currentModelData.dataPropertyFilter == null) {
						currentModelData.dataPropertyFilter = {
							"_class" : "DataPropertyFilter",
							"condition" : "[enter condition]",
							"value" : "[enter value]",
							"datatype" : null
						}
					} else if (currentModelData.conjunctionFilters == null) {
						currentModelData.conjunctionFilters = [ {
							"_class" : "ConjunctionFilter",
							"filterConjunction" : sap.ui.getCore().getModel("i18nModel").getProperty("conjunctionClauseAnd"),
							"dataPropertyFilter" : {
								"_class" : "DataPropertyFilter",
								"condition" : "[enter condition]",
								"value" : "[enter value]",
								"datatype" : null
							}
						} ]
					} else {
						currentModelData.conjunctionFilters.push({
							"_class" : "ConjunctionFilter",
							"filterConjunction" : sap.ui.getCore().getModel("i18nModel").getProperty("conjunctionClauseAnd"),
							"dataPropertyFilter" : {
								"_class" : "DataPropertyFilter",
								"condition" : "[enter condition]",
								"value" : "[enter value]",
								"datatype" : null
							}
						});
					}
				}
				// currentModel.setData(currentModelData, "queryModel");
				self.getAggregation("_extendFilter").setVisible(true);
				currentModel.refresh();
				self.getParent().rerender();
			}
		}));
	},

	renderer : function(oRm, oControl) {
		if (oControl.getAggregation("_dataPropertyFilter") != null) {
			oRm.renderControl(oControl.getAggregation("_dataPropertyFilter"));
			var dataPropertyConjunctionFilters = oControl.getAggregation("_dataPropertyConjunctionFilters");
			if (dataPropertyConjunctionFilters != null) {
				for (var i = 0; i < dataPropertyConjunctionFilters.length; i++) {
					oRm.renderControl(dataPropertyConjunctionFilters[i]);
				}
			}
		}
		oRm.renderControl(oControl.getAggregation("_extendFilter"));
	}
});