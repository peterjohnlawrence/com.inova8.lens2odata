sap.ui.core.Control.extend("sparqlish.control.dataPropertyClauseControl", {
	metadata : {
		properties : {
			dataPropertyClause : "object"
		},
		events : {},
		aggregations : {
			_dataProperty : {
				type : "sparqlish.control.dataPropertyControl",
				multiple : false,
				visibility : "hidden"
			},
			_dataPropertyFilters : {
				type : "sparqlish.control.dataPropertyFiltersControl",
				multiple : false,
				visibility : "hidden"
			}
		}
	},
	// set up the inner controls
	init : function() {
		var self = this;
		this.setAggregation("_dataProperty", new sparqlish.control.dataPropertyControl());
		this.setAggregation("_dataPropertyFilters", new sparqlish.control.dataPropertyFiltersControl());
	},
	setDataPropertyClause : function(oDataPropertyClause ) {
		this.setProperty("dataPropertyClause", oDataPropertyClause, true);
		this.getAggregation("_dataProperty").setDataPropertyClause(oDataPropertyClause );
		this.getAggregation("_dataPropertyFilters").setDataPropertyFilters(oDataPropertyClause.filters);
	},
	renderer : function(oRm, oControl) {
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.write("class=\"dataPropertyClause\"> with ");
		oRm.renderControl(oControl.getAggregation("_dataProperty"));
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_dataPropertyFilters"));
		oRm.write("</div>");
	}
});