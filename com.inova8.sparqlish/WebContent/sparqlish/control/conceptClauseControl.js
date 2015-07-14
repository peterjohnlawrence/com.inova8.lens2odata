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
			_conceptFilters : {
				type : "sparqlish.control.conceptFiltersControl",
				multiple : false,
				visibility : "hidden"
			}
		}
	},
	init : function() {
		var self = this;
		this.setAggregation("_concept", new sparqlish.control.conceptControl({
			selected : function(oEvent) {
				self.getAggregation("_conceptFilters").getAggregation("_extendFilter").setVisible(true);
			},
			changed : function(oEvent) {
				var currentModel = this.getModel();
				var currentModelData = currentModel.getData();
				currentModelData.query.conceptFilters = [];
				currentModel.setData(currentModelData);
				currentModel.refresh();
				self.rerender();
			}
		}).bindElement( "/query")
		);
		this.setAggregation("_conceptFilters", new sparqlish.control.conceptFiltersControl().bindElement("/query")
				);
	},
	setConceptClause : function(oConceptClause) {
		if (oConceptClause.concept == null){
				var currentModel = this.getModel();
				var currentModelData = currentModel.getData();
				currentModelData.query.concept = "[select concept]";
				currentModel.setData(currentModelData);
				currentModel.refresh();
		}
	},
	renderer : function(oRm, oControl) {
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.write("class=\"conceptClause\"> Find ");
		oRm.renderControl(oControl.getAggregation("_concept"));
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_conceptFilters"));
		oRm.write("</div>");
	}
});