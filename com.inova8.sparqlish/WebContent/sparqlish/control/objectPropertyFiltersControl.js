sap.ui.core.Control.extend("sparqlish.control.objectPropertyFiltersControl", {
	metadata : {
		aggregations : {
			_objectPropertyFilters : {
				type : "sparqlish.control.objectPropertyFilterControl",
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
		self.bindAggregation("_objectPropertyFilters", "objectPropertyFilters", new sparqlish.control.objectPropertyFilterControl({
			deleted : function(oEvent) {
				// TODO is this really the best way to delete an element?
				var path = oEvent.getSource().getBindingContext().getPath().split("/");
				var index = path[path.length - 1];
				var currentModel = oEvent.getSource().getModel();
				var currentModelData = currentModel.getData();
				currentModelData.propertyClause.objectPropertyFilters.splice(index, 1);
				currentModel.setData(currentModelData);
				currentModel.refresh();
				self.getParent().rerender();
			}
		}));
		this.setAggregation("_extendFilter", new sap.ui.commons.Link({
			text : "[+]",
			tooltip : "Add a filter value",
			visible : true,
			press : function(oEvent) {
				var currentModel = self.getModel();
				var currentModelData = currentModel.getData();
				if (currentModelData.propertyClause.objectPropertyFilters == null) {
					currentModelData.propertyClause.objectPropertyFilters = [];
				}
				currentModelData.propertyClause.objectPropertyFilters.push({
					Id : "[enter new value]"
				});
				currentModel.setData(currentModelData);
				currentModel.refresh();
				self.getParent().rerender();
			}
		}));
	},
	setObjectPropertyClause : function(oObjectPropertyFilters) {
		var self = this;
		self.setProperty("objectPropertyFilters", oObjectPropertyFilters, true);
		if (oObjectPropertyFilters != null) {
			if (oObjectPropertyFilters.length > 0)
				self.getAggregation("_extendFilter").setVisible(true);
		}
	},
	renderer : function(oRm, oControl) {
		var objectPropertyFilters = oControl.getAggregation("_objectPropertyFilters");
		if (objectPropertyFilters != null) {
			for (var i = 0; i < objectPropertyFilters.length; i++) {
				if (i > 0) {
					oRm.write(", ");
				} else {
					oRm.write(" in ");
				}
				oRm.renderControl(objectPropertyFilters[i]);
			}
		}
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_extendFilter"));
	}
});