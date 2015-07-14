sap.ui.core.Control.extend("sparqlish.control.dataPropertyFiltersControl", {
	metadata : {
		properties : {
			dataPropertyFilters : "object"
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
				type : "sap.ui.commons.Link",
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
				var path = oEvent.getSource().getBindingContext().getPath().split("/");
				var index = path[path.length - 1];
				var currentModel = oEvent.getSource().getModel();
				var currentModelData = currentModel.getData();
				currentModelData.dataPropertyClause.filters.filter = {};
				currentModel.setData(currentModelData);
				currentModel.refresh();
				self.getParent().rerender();
			}
		}).bindElement("filter"));
		self.bindAggregation("_dataPropertyConjunctionFilters", "conjunctionFilters",
				new sparqlish.control.dataPropertyConjunctionFilterControl({
					deleted : function(oEvent) {
						// TODO is this really the best way to delete an element?
						var path = oEvent.getSource().getBindingContext().getPath().split("/");
						var index = path[path.length - 1];
						var currentModel = oEvent.getSource().getModel();
						var currentModelData = currentModel.getData();
						currentModelData.dataPropertyClause.filters.conjunctionFilters.splice(index, 1);
						currentModel.setData(currentModelData);
						currentModel.refresh();
						self.getParent().rerender();
					}
				})//.bindElement("conjunctionFilters")
				);

		self.setAggregation("_extendFilter", new sap.ui.commons.Link({
			text : "[+]",
			tooltip : "Add a filter value",
			press : function(oEvent) {
				var currentModel = self.getModel();
				var currentModelData = currentModel.getData();
				if (currentModelData.propertyClause.filters == null) {
					currentModelData.propertyClause.filters = {
						"_class" : "Filters",
						"filter" : {
							"_class" : "Filter",
							"condition" : "[enter condition]",
							"value" : "[enter value]",
							"datatype" : null
						}
					};
				} else {
					if (currentModelData.propertyClause.filters.conjunctionFilters == null) {
						currentModelData.propertyClause.filters.conjunctionFilters = [ {
							"_class" : "ConjunctionFilter",
							"filterConjunction" : "[enter conjunction]",
							"filter" : {
								"_class" : "Filter",
								"condition" : "[enter condition]",
								"value" : "[enter value]",
								"datatype" : null
							}
						} ]
					} else {
						currentModelData.propertyClause.filters.conjunctionFilters.push({
							"_class" : "ConjunctionFilter",
							"filterConjunction" : "[enter conjunction]",
							"filter" : {
								"_class" : "Filter",
								"condition" : "[enter condition]",
								"value" : "[enter value]",
								"datatype" : null
							}
						}
						);
					}
				}
				currentModel.setData(currentModelData);
				currentModel.refresh();
				self.getParent().rerender();
			}
		}));
	},
	setDataPropertyFilters : function(oDataPropertyFilters) {
		var self = this;
//		self.setProperty("dataPropertyFilters", oDataPropertyFilters);
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_dataPropertyFilter"));
		var dataPropertyConjunctionFilters = oControl.getAggregation("_dataPropertyConjunctionFilters");
		if (dataPropertyConjunctionFilters != null) {
			oRm.write("&nbsp;");
			for (var i = 0; i < dataPropertyConjunctionFilters.length; i++) {
				oRm.renderControl(dataPropertyConjunctionFilters[i]);
			}
		}
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_extendFilter"));
	}
});