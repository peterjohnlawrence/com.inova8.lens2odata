sap.ui.core.Control.extend("sparqlish.control.objectPropertyClauseControl", {
	metadata : {
		properties : {
			objectPropertyClause : "object"
		},
		events : {},
		aggregations : {
			_objectProperty : {
				type : "sparqlish.control.objectPropertyControl",
				multiple : false,
				visibility : "hidden"
			},
			_objectPropertyFilters : {
				type : "sparqlish.control.objectPropertyFiltersControl",
				multiple : false,
				visibility : "hidden"
			}
		}
	},
	// set up the inner controls
	init : function() {
		var self = this;
		this.setAggregation("_objectProperty", new sparqlish.control.objectPropertyControl({
			selected : function(oEvent) {
				self.getAggregation("_objectPropertyFilters").getAggregation("_extendFilter").setVisible(true);
			},
			changed : function(oEvent) {
				alert("delete filters");
			}
		}));
		this.setAggregation("_objectPropertyFilters", new sparqlish.control.objectPropertyFiltersControl());
	},
	setObjectPropertyClause : function(oObjectPropertyClause) {
		this.setProperty("objectPropertyClause", oObjectPropertyClause, true);
		this.getAggregation("_objectProperty").setObjectPropertyClause(oObjectPropertyClause);
		this.getAggregation("_objectPropertyFilters").setObjectPropertyClause(oObjectPropertyClause);
	},
	renderer : function(oRm, oControl) {
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.write("class=\"objectPropertyClause\"> with ");
		oRm.renderControl(oControl.getAggregation("_objectProperty"));
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_objectPropertyFilters"));
		oRm.write("</div>");
	}
});