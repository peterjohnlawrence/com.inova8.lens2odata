sap.ui.core.Control.extend("sparqlish.control.objectPropertyFiltersControl", {
	metadata : {
		properties : {
			objectPropertyClause : "object"
		},
		aggregations : {
			_objectPropertyFilters : {
				type : "sparqlish.control.objectPropertyFilterControl",
				multiple : true,
				visibility : "hidden"
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
		this.setAggregation("_extendFilter", new sap.ui.commons.Link({
			text : "[+]",
			tooltip : "Add a filter value",
			press : function(oEvent) {
				var objectPropertyFilters = self.getAggregation("_objectPropertyFilters").length;
				self.addAggregation("_objectPropertyFilters", new sparqlish.control.objectPropertyFilterControl({
					objectPropertyClause : self.getProperty("objectPropertyClause"),
					filterIndex : objectPropertyFilters + 1
				}));
				self.getParent().rerender();
			}
		}));
	},
	setObjectPropertyClause : function(oObjectPropertyClause) {
		var self = this;
		self.setProperty("objectPropertyClause", oObjectPropertyClause, true);
		var objectPropertyFilters = oObjectPropertyClause.objectPropertyFilters.length;
		for (var i = 0; i < objectPropertyFilters; i++) {
			var filterControls = self.getAggregation("_objectPropertyFilters");
			var filterControl = null;
			if (filterControls != null) {
				filterControl = filterControls[i];
			}
			if (filterControl != null) {
				filterControl.setObjectPropertyClause(oObjectPropertyClause);
				filterControl.setFilterIndex(i);
			} else {
				self.addAggregation("_objectPropertyFilters", new sparqlish.control.objectPropertyFilterControl({
					objectPropertyClause : oObjectPropertyClause,
					filterIndex : i
				}));
			}
		}
	},
	renderer : function(oRm, oControl) {
		var objectPropertyFilters = oControl.getAggregation("_objectPropertyFilters");
		if (objectPropertyFilters != null) {
			oRm.write("&nbsp;");
			for (var i = 0; i < objectPropertyFilters.length; i++) {
				oRm.renderControl(objectPropertyFilters[i]);
			}
		}
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_extendFilter"));
	}
});