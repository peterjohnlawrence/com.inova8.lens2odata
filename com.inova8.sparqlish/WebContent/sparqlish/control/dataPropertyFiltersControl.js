sap.ui.core.Control.extend("sparqlish.control.dataPropertyFiltersControl", {
	metadata : {
		properties : {
			dataPropertyClause : "object"
		},
		aggregations : {
			_dataPropertyFilter : {
				type : "sparqlish.control.dataPropertyFilterControl",
				multiple : false,
				visibility : "hidden"
			},
			_dataPropertyConjunctionFilters : {
				type : "sparqlish.control.dataPropertyConjunctionFilterControl",
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
				if (self.getAggregation("_dataPropertyConjunctionFilters") == null) {
					self.setAggregation("_dataPropertyFilter", new sparqlish.control.dataPropertyFilterControl({
						dataPropertyClause : self.getProperty("dataPropertyClause")
					}));
				} else {
					var dataPropertyConjunctionFilters = self.getAggregation("_dataPropertyConjunctionFilters").length;
					self.addAggregation("_dataPropertyConjunctionFilters", new sparqlish.control.dataPropertyConjunctionFilterControl({
						dataPropertyClause : self.getProperty("dataPropertyClause"),
						filterIndex : dataPropertyConjunctionFilters + 1
					}));
				}
				self.getParent().rerender();
			}
		}));
	},
	setDataPropertyClause : function(oDataPropertyClause) {
		var self = this;
		self.setProperty("dataPropertyClause", oDataPropertyClause, true);
		var dataPropertyFilters = oDataPropertyClause.filters.length;
		for (var i = 0; i < dataPropertyFilters; i++) {
			var filterControls = self.getAggregation("_filters");
			var filterControl = null;
			if (filterControls != null) {
				filterControl = filterControls[i];
			}
			if (filterControl != null) {
				filterControl.setDataPropertyClause(oDataPropertyClause);
				filterControl.setFilterIndex(i);
			} else {
				self.addAggregation("_dataPropertyFilters", new sparqlish.control.dataPropertyFilterControl({
					dataPropertyClause : oDataPropertyClause,
					filterIndex : i
				}));
			}
		}
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