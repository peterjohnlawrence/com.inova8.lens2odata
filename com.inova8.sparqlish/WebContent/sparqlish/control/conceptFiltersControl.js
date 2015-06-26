sap.ui.core.Control.extend("sparqlish.control.conceptFiltersControl", {
	metadata : {
		properties : {
			query : "object"
		},
		aggregations : {
			_conceptFilters : {
				type : "sparqlish.control.conceptFilterControl",
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
				var conceptFilters = self.getAggregation("_conceptFilters").length;
				self.addAggregation("_conceptFilters", new sparqlish.control.conceptFilterControl({
					query : self.getProperty("query"),
					filterIndex : conceptFilters + 1
				}));
				self.getParent().rerender();
			}
		}));
	},
	setQuery : function(oQuery) {
		var self = this;
		self.setProperty("query", oQuery, true);
		var conceptFilters = oQuery.conceptFilters.length;
		for (var i = 0; i < conceptFilters; i++) {
			var filterControls = self.getAggregation("_conceptFilters");
			var filterControl = null;
			if (filterControls != null) {
				filterControl = filterControls[i];
			}
			if (filterControl != null) {
				filterControl.setQuery(oQuery);
				filterControl.setFilterIndex(i);
			} else {
				self.addAggregation("_conceptFilters", new sparqlish.control.conceptFilterControl({
					query : oQuery,
					filterIndex : i
				}));
			}
		}
	},
	renderer : function(oRm, oControl) {
		var conceptFilters = oControl.getAggregation("_conceptFilters");
		if (conceptFilters != null) {
			oRm.write("&nbsp;");
			for (var i = 0; i < conceptFilters.length; i++) {
				oRm.renderControl(conceptFilters[i]);
			}
		}
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_extendFilter"));
	}
});