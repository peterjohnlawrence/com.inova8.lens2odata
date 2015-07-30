sap.ui.core.Control.extend("sparqlish.control.conceptFiltersControl", {
	metadata : {
		aggregations : {
			_conceptFilters : {
				type : "sparqlish.control.conceptFilterControl",
				multiple : true
			},
			_extendFilter : {
				type : "sparqlish.control.iconLink",
				multiple : false,
				visibility : "hidden"
			}
		}
	},
	init : function() {
		var self = this;
		self.bindAggregation("_conceptFilters", "queryModel>conceptFilters", new sparqlish.control.conceptFilterControl({
			//conceptFilter : "{Id}",
			deleted : function(oEvent) {
				// TODO is this really the best way to delete an element?
				var currentModel = oEvent.getSource().getModel("queryModel");
			  var currentContext = oEvent.getSource().getBindingContext("queryModel");
			  var path = currentContext.getPath().split("/");
			  var index = path[path.length - 1];
			  var conceptFiltersContextPath = currentContext.getPath().slice(0,-(1+index.length))
			  var conceptFiltersContext = new sap.ui.model.Context("queryModel",conceptFiltersContextPath);
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
			visible : true,
			press : function(oEvent) {
				var currentModel = self.getModel("queryModel");
			  var currentContext = self.getBindingContext("queryModel");
			  var currentModelData = currentModel.getProperty("", currentContext);
				if (currentModelData.conceptFilters == null) {
					currentModelData.conceptFilters = [];
				}
				currentModelData.conceptFilters.push({
					Id : "[enter new value]"
				});
				//currentModel.setData(currentModelData,"queryModel");
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
					oRm.write(", ");
				} else {
					oRm.write(" in ");
				}
				oRm.renderControl(conceptFilters[i]);
			}
		}
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_extendFilter"));
	}
});