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
				var dataPropertyFiltersContextPath = currentContext.getPath().slice(0,-(1+index.length))
				var dataPropertyFiltersContext = new sap.ui.model.Context("queryModel",dataPropertyFiltersContextPath);
				var currentModelData = currentModel.getProperty("",dataPropertyFiltersContext);
				//TODO
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
				var dataPropertyFiltersContextPath = currentContext.getPath().slice(0,-(1+index.length))
				var dataPropertyFiltersContext = new sap.ui.model.Context("queryModel",dataPropertyFiltersContextPath);
				var currentModelData = currentModel.getProperty("",dataPropertyFiltersContext);
				//TODO
				currentModelData.splice(index, 1);
				// currentModel.setData(currentModelData);
				currentModel.refresh();
				self.getParent().rerender();
			}
		})// .bindElement("conjunctionFilters")
		);

		self.setAggregation("_extendFilter", new sparqlish.control.iconLink({
			text : "[+]",
			icon : "add-filter",
			tooltip : "Add a filter value",
			press : function(oEvent) {
				var currentModel = self.getModel("queryModel");
				var currentContext = oEvent.getSource().getBindingContext("queryModel");
				var currentModelData = currentModel.getProperty("",currentContext);
				if (currentModelData.dataPropertyFilters == null) {
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
					if (currentModelData.dataPropertyFilters.conjunctionFilters == null) {
						currentModelData.dataPropertyFilters.conjunctionFilters = [ {
							"_class" : "ConjunctionFilter",
							"filterConjunction" : "[enter conjunction]",
							"dataPropertyFilter" : {
								"_class" : "DataPropertyFilter",
								"condition" : "[enter condition]",
								"value" : "[enter value]",
								"datatype" : null
							}
						} ]
					} else {
						currentModelData.dataPropertyFilters.conjunctionFilters.push({
							"_class" : "ConjunctionFilter",
							"filterConjunction" : "[enter conjunction]",
							"dataPropertyFilter" : {
								"_class" : "DataPropertyFilter",
								"condition" : "[enter condition]",
								"value" : "[enter value]",
								"datatype" : null
							}
						});
					}
				}
				//currentModel.setData(currentModelData, "queryModel");
				currentModel.refresh();
				self.getParent().rerender();
			}
		}));
	},
	setDataPropertyFilters : function(oDataPropertyFilters) {
		var self = this;
		// self.setProperty("dataPropertyFilters", oDataPropertyFilters);
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