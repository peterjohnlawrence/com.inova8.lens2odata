jQuery.sap.require("sparqlish.control.conceptFilterControl");
sap.ui.core.Control.extend("sparqlish.control.conceptFiltersControl", {
	metadata : {
		aggregations : {
			_conceptFilters : {
				type : "sparqlish.control.conceptFilterControl",
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
		self.bindAggregation("_conceptFilters", "queryModel>conceptFilters", new sparqlish.control.conceptFilterControl({
			// conceptFilter : "{Id}",
			deleted : function(oEvent) {
				// TODO is this really the best way to delete an element?
				var currentModel = oEvent.getSource().getModel("queryModel");
				var currentContext = oEvent.getSource().getBindingContext("queryModel");
				var path = currentContext.getPath().split("/");
				var index = path[path.length - 1];
				var conceptFiltersContextPath = currentContext.getPath().slice(0, -(1 + index.length))
				var conceptFiltersContext = new sap.ui.model.Context("queryModel", conceptFiltersContextPath);
				var currentModelData = currentModel.getProperty("", conceptFiltersContext);
				currentModelData.splice(index, 1);

				currentModel.refresh();
				self.getParent().rerender();
			}
		}));
		self.setAggregation("_extendFilter", new sparqlish.control.iconLink({
			text : "add-filter",
			icon : "add-filter",
			tooltip : "Add a filter value",
			visible : false,
			press : function(oEvent) {
				// var me = oEvent.getSource().getParent();
				var currentModel = self.getModel("queryModel");
				var currentContext = self.getBindingContext("queryModel");
				var currentModelData = currentModel.getProperty("", currentContext);
				if (currentModelData.conceptFilters == null) {
					currentModelData.conceptFilters = [];
				}
				currentModelData.conceptFilters.push({
					OrderID : "[enter new value]"
				});
				// currentModel.setData(currentModelData,"queryModel");
				self.getAggregation("_extendFilter").setVisible(true);
				currentModel.refresh();
				self.getParent().rerender();
			}
		}));
	},
	renderer : function(oRm, oControl) {
		var conceptFilters = oControl.getAggregation("_conceptFilters");
		if (conceptFilters != null) {
			for (var i = 0; i < conceptFilters.length; i++) {
				if (i > 0) {
					oRm.write(sap.ui.getCore().getModel("i18n").getProperty("conceptClauseConjunction"));
				} else {
					oRm.write("&nbsp;");
					oRm.write(sap.ui.getCore().getModel("i18n").getProperty("conceptClauseIn"));
				}
				oRm.renderControl(conceptFilters[i]);
			}
		}
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_extendFilter"));
	}
});