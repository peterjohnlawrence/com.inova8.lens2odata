sap.ui.core.Control.extend("sparqlish.control.dataPropertyFiltersControl", {
	metadata : {
		properties : {
			dataPropertyFilters : "object"
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
				// first add the initial filter before extending collection of conjunctionFilters
				if (self.getAggregation("_dataPropertyFilter") == null) {
					self.setAggregation("_dataPropertyFilter", new sparqlish.control.dataPropertyFilterControl({
						dataPropertyFilter : self.getProperty("dataPropertyFilters").filter
					}));
				} else {
					if (self.getAggregation("_dataPropertyConjunctionFilters") == null) {
						self.addAggregation("_dataPropertyConjunctionFilters", new sparqlish.control.dataPropertyConjunctionFilterControl({
							//TODO can we initialize at this stage
							dataPropertyConjunctionFilter : self.getProperty("dataPropertyFilters").conjunctionFilters[0],
							filterIndex : 0
						}));
					} else {
						var dataPropertyConjunctionFilters = self.getAggregation("_dataPropertyConjunctionFilters").length;
						self.addAggregation("_dataPropertyConjunctionFilters", new sparqlish.control.dataPropertyConjunctionFilterControl({
							//TODO initialize new filter
							//dataPropertyConjunctionFilter : self.getProperty("dataPropertyFilters").conjunctionFilters[dataPropertyConjunctionFilters],
							//filterIndex : dataPropertyConjunctionFilters 
						}));
					}
				}
				self.getParent().rerender();
			}
		}));
	},
	setDataPropertyFilters : function(oDataPropertyFilters) {
		var self = this;
		self.setProperty("dataPropertyFilters", oDataPropertyFilters, true);
//		if (oDataPropertyClause.filters != null) {	
		
			if (oDataPropertyFilters.filter != null) {
				if (self.getAggregation("_dataPropertyFilter")==null){
						self.setAggregation("_dataPropertyFilter", new sparqlish.control.dataPropertyFilterControl({
						dataPropertyFilter : self.getProperty("dataPropertyFilters").filter
					}));				
				}
				self.getAggregation("_dataPropertyFilter").setDataPropertyFilter ( oDataPropertyFilters.filter);
				
				var dataPropertyConjunctionFilters = oDataPropertyFilters.conjunctionFilters.length;
				var filterControls = self.getAggregation("_dataPropertyConjunctionFilters");
				//TODO should we destroy the existing aggregation
				for (var i = 0; i < dataPropertyConjunctionFilters; i++) {
					var filterControl = null;
					if (filterControls != null) {
						filterControl = filterControls[i];
					}
					if (filterControl != null) {
						filterControl.setDataPropertyConjunctionFilter(oDataPropertyFilters.conjunctionFilters[i]);
						filterControl.setFilterIndex(i);
					} else {
						self.addAggregation("_dataPropertyConjunctionFilters", new sparqlish.control.dataPropertyConjunctionFilterControl({
							dataPropertyConjunctionFilter : oDataPropertyFilters.conjunctionFilters[i],
							filterIndex : i
						}));
					}
				}
			}
//		}
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