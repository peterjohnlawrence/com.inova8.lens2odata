sap.ui.core.Control.extend("sparqlish.control.conceptClauseControl", {
	metadata : {
		properties : {
			query : "object"
		},
		events : {},
		aggregations : {
			_concept : {
				type : "sparqlish.control.conceptControl",
				multiple : false,
				visibility : "hidden"
			},
			_conceptfilters : {
				type : "sparqlish.control.conceptFiltersControl",
				multiple : false,
				visibility : "hidden"
			}
		}
	},
	// set up the inner controls
	init : function() {
		var self = this;
		this.setAggregation("_concept", new sparqlish.control.conceptControl());
		this.setAggregation("_conceptfilters", new sparqlish.control.conceptFiltersControl());
	},
	setQuery : function(oQuery ) {
		this.setProperty("query", oQuery , true);
		this.getAggregation("_concept").setQuery(oQuery );
		this.getAggregation("_conceptfilters").setQuery(oQuery);
	},
	renderer : function(oRm, oControl) {
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.write("class=\"conceptClause\"> Find ");
		oRm.renderControl(oControl.getAggregation("_concept"));
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_conceptfilters"));
		oRm.write("</div>");
	}
});