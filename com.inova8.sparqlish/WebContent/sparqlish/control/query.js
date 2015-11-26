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
	checkClass : function(oControl, oRm, sModel, _class) {
		if (oControl.getModel(sModel).getProperty("_class", oControl.getBindingContext(sModel)) != _class) {
			oRm.addClass("error");
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("Not referencing a " + _class + " class");
			oRm.write("</div>");
			return false;
		} else {
			return true;
		}
	},
	renderer : function(oRm, oControl) {
		if (oControl.checkClass(oControl, oRm, "queryModel", "Query")) {
			// oControl.getAggregation("_queryControl").bindElement(oControl.getClausePath());
			oRm.addClass("clauses");
			oRm.addClass("clauseContainer");
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_conceptClause"));
			oRm.write("</div>");
			var currentModel = oControl.getModel("queryModel");
			var currentContext = oControl.getBindingContext("queryModel");
			var currentModelData = currentModel.getProperty("", currentContext);
			// No point rendering clauses if empty
			if (!jQuery.isEmptyObject(currentModelData.clauses)) {
				oRm.addClass("clauses");
				oRm.write("<div ");
				oRm.writeControlData(oControl);
				oRm.writeClasses();
				oRm.write(">");
				oRm.renderControl(oControl.getAggregation("_clauses"));
				oRm.write("<div ");
			}

		} else {
			jQuery.sap.log.fatal("Incorrect query clause");
		}
	}
});