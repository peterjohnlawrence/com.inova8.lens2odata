jQuery.sap.require("sparqlish.control.conceptClause");
jQuery.sap.require("sparqlish.control.clauses");
sap.ui.core.Control.extend("sparqlish.control.query", {
	metadata : {
		properties : {

		},
		events : {},
		aggregations : {
			_conceptClause : {
				type : "sparqlish.control.conceptClause",
				multiple : false
			},
			_clauses : {
				type : "sparqlish.control.clauses",
				multiple : false
			}
		}
	},
	init : function() {
		var self = this;
		self.setAggregation("_conceptClause", new sparqlish.control.conceptClause().bindElement("queryModel>"));
		self.setAggregation("_clauses", new sparqlish.control.clauses().bindElement("queryModel>clauses"));
	},
	renderer : function(oRm, oControl) {
		if (checkClass(oControl, oRm, "queryModel", "Query")) {
			// oControl.getAggregation("_queryControl").bindElement(oControl.getClausePath());
			oRm.addClass("query");
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_conceptClause"));
			var currentModel = oControl.getModel("queryModel");
			var currentContext = oControl.getBindingContext("queryModel");
			var currentModelData = currentModel.getProperty("", currentContext);
			// No point rendering clauses if empty
			if (!jQuery.isEmptyObject(currentModelData.clauses)) {
				oRm.renderControl(oControl.getAggregation("_clauses"));
			}
			oRm.write("</div>");
		} else {
			jQuery.sap.log.fatal("Incorrect query clause");
		}
	}
});