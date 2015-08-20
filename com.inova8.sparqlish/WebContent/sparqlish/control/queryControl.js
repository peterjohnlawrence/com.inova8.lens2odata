jQuery.sap.require("sparqlish.control.conceptClauseControl");
jQuery.sap.require("sparqlish.control.propertyClauseControl");
jQuery.sap.require("sparqlish.control.conjunctionClauseControl");
sap.ui.core.Control.extend("sparqlish.control.queryControl", {
	metadata : {
		properties : {},
		events : {},
		aggregations : {
			_conceptClause : {
				type : "sparqlish.control.conceptClauseControl",
				multiple : false
			},
			_propertyClause : {
				type : "sparqlish.control.propertyClauseControl",
				multiple : false
			},
			_conjunctionClause : {
				type : "sparqlish.control.conjunctionClauseControl",
				multiple : false
			}
		}
	},
	init : function() {
		var self = this;
		self.setAggregation("_conceptClause", new sparqlish.control.conceptClauseControl().bindElement("queryModel>"));
		self.setAggregation("_propertyClause", new sparqlish.control.propertyClauseControl().bindElement("queryModel>"));
		self.setAggregation("_conjunctionClause", new sparqlish.control.conjunctionClauseControl().bindElement("queryModel>"));
	},
	renderer : function(oRm, oControl) {

		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.write(">");
	
		var currentModel = oControl.getModel("queryModel");
		var currentContext = oControl.getBindingContext("queryModel");
		if (currentContext != undefined) {
			var sClass = currentModel.getProperty("", currentContext)._class;
			if (sClass == "Query") {
				oControl.getAggregation("_conceptClause").setBindingContext(currentContext);
				oRm.renderControl(oControl.getAggregation("_conceptClause"));
			} else if (sClass == "Clause") {
				oControl.getAggregation("_propertyClause").setBindingContext(currentContext);
				oRm.renderControl(oControl.getAggregation("_propertyClause"));
			}else if (sClass == "ConjunctionClause") {
				oControl.getAggregation("_conjunctionClause").setBindingContext(currentContext);
				oRm.renderControl(oControl.getAggregation("_conjunctionClause"));
			}else{
				console.log("Incorrect query clause")
			}
		}
		oRm.write("</div>");
	}
});