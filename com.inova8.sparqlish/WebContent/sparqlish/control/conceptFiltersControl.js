sap.ui.core.Control.extend("sparqlish.control.conceptFiltersControl", {
	metadata : {
		properties : {
			conceptFilters : "object"
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
			visible : false,
			press : function(oEvent) {
				var oConceptFilters = self.getProperty("conceptFilters");
				oConceptFilters.push({
					Id : "[enter new value]"
				});
				self.addAggregation("_conceptFilters", new sparqlish.control.conceptFilterControl({
					conceptFilter : oConceptFilters[oConceptFilters.length - 1]
				}));
				self.getParent().rerender();
			}
		}));
	},
	setConceptFilters : function(oConceptFilters) {
		var self = this;
		self.setProperty("conceptFilters", oConceptFilters, true);
		if (oConceptFilters != null) {
			var conceptFilters = oConceptFilters.length;
			for (var i = 0; i < conceptFilters; i++) {
				var filterControls = self.getAggregation("_conceptFilters");
				var filterControl = null;
				if (filterControls != null) {
					filterControl = filterControls[i];
				}
				if (filterControl != null) {
					filterControl.setConceptFilter(oConceptFilters[i]);
				} else {
					var newI = i;
					var newControl = new sparqlish.control.conceptFilterControl({
						conceptFilter : oConceptFilters[i],
						deleted : function() {
							delete oConceptFilters[newI];
							//newControl.destroy();
							//self.getParent().rerender();
						}
					});
					self.addAggregation("_conceptFilters", newControl);
				}
			}
		}
		if (conceptFilters>0) self.getAggregation("_extendFilter").setVisible(true);
	},
	renderer : function(oRm, oControl) {
		var conceptFilters = oControl.getAggregation("_conceptFilters");
		if (conceptFilters != null) {
			// oRm.write("&nbsp;");
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