sap.ui.core.Control.extend("sparqlish.control.conceptClauseControl", {
	metadata : {
		properties : {
			conceptClause : "object"
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
		this.setAggregation("_concept", new sparqlish.control.conceptControl({
			selected : function(oEvent) {
				self.getAggregation("_conceptfilters").getAggregation("_extendFilter").setVisible(true);
			},
			changed : function(oEvent) {
				alert("delete filters");
			}
		}));
		this.setAggregation("_conceptfilters", new sparqlish.control.conceptFiltersControl());
	},
	setConceptClause : function(oConceptClause) {
		this.setProperty("conceptClause", oConceptClause, true);
		this.getAggregation("_concept").setConcept(oConceptClause);
		if (oConceptClause.conceptFilters == null) {
			oConceptClause.conceptFilters=[];
		}
		this.getAggregation("_conceptfilters").setConceptFilters(oConceptClause.conceptFilters);
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