sap.ui.core.Control.extend("sparqlish.control.objectPropertyFiltersControl", {
	metadata : {
		properties : {
			objectPropertyFilters : "object"
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
			visible : false,
			press : function(oEvent) {
				self.addAggregation("_objectPropertyFilters", new sparqlish.control.objectPropertyFilterControl({}));
				self.getParent().rerender();
			}
		}));
	},
	setObjectPropertyClause : function(oObjectPropertyFilters) {
		var self = this;
		self.setProperty("objectPropertyFilters", oObjectPropertyFilters, true);
		if (oObjectPropertyFilters != null) {
			var objectPropertyFilters = oObjectPropertyFilters.length;
			for (var i = 0; i < objectPropertyFilters; i++) {
				var filterControls = self.getAggregation("_objectPropertyFilters");
				var filterControl = null;
				if (filterControls != null) {
					filterControl = filterControls[i];
				}
				if (filterControl != null) {
					filterControl.setObjectPropertyFilter(oObjectPropertyFilters[i]);
				} else {
					self.addAggregation("_objectPropertyFilters", new sparqlish.control.objectPropertyFilterControl({
						objectPropertyFilter : oObjectPropertyFilters[i]
					}));
				}
			}
		}
	},
	renderer : function(oRm, oControl) {
		var objectPropertyFilters = oControl.getAggregation("_objectPropertyFilters");
		if (objectPropertyFilters != null) {
			//oRm.write("&nbsp;");
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