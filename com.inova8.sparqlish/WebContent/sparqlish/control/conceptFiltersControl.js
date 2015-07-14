sap.ui.core.Control.extend("sparqlish.control.conceptFiltersControl", {
	metadata : {
		aggregations : {
			_conceptFilters : {
				type : "sparqlish.control.conceptFilterControl",
				multiple : true
			},
			_extendFilter : {
				type : "sap.ui.commons.Link",
				multiple : false,
				visibility : "hidden"
			}
		}
	},
	init : function() {
		var self = this;
		self.bindAggregation("_conceptFilters", "conceptFilters", new sparqlish.control.conceptFilterControl({
			//conceptFilter : "{Id}",
			deleted : function(oEvent) {
				// TODO is this really the best way to delete an element?
				var path = oEvent.getSource().getBindingContext().getPath().split("/");
				var index = path[path.length - 1];
				var currentModel = oEvent.getSource().getModel();
				var currentModelData = currentModel.getData();
				currentModelData.query.conceptFilters.splice(index, 1);
				currentModel.setData(currentModelData);
				currentModel.refresh();
				self.getParent().rerender();
			}
		}));
		self.setAggregation("_extendFilter", new sap.ui.commons.Link({
			text : "[+]",
			tooltip : "Add a filter value",
			visible : true,
			press : function(oEvent) {
				var currentModel = self.getModel();
				var currentModelData = currentModel.getData();
				if (currentModelData.query.conceptFilters == null) {
					currentModelData.query.conceptFilters = [];
				}
				currentModelData.query.conceptFilters.push({
					Id : "[enter new value]"
				});
				currentModel.setData(currentModelData);
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