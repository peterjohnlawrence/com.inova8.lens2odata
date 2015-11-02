jQuery.sap.require("sparqlish.control.conceptClause");
jQuery.sap.require("sparqlish.control.propertyClause");
jQuery.sap.require("sparqlish.control.conjunctionPropertyClause");
sap.ui.core.Control.extend("sparqlish.control.queryClause", {
	metadata : {
		properties : {
			clausePath : {
				type : "string"
			}
		},
		events : {
			changedClause : {
				enablePreventDefault : true
			}
		},
		aggregations : {
			_conceptClause : {
				type : "sparqlish.control.conceptClause",
				multiple : false
			},
			_propertyClause : {
				type : "sparqlish.control.propertyClause",
				multiple : false
			},
			_conjunctionPropertyClause : {
				type : "sparqlish.control.conjunctionPropertyClause",
				multiple : false
			}
		}
	},
	init : function() {
		var self = this;
		self.setAggregation("_conceptClause", new sparqlish.control.conceptClause());
		self.setAggregation("_propertyClause", new sparqlish.control.propertyClause());
		self.setAggregation("_conjunctionPropertyClause", new sparqlish.control.conjunctionPropertyClause());
	},
	renderer : function(oRm, oControl) {
		var self =this;
		if (oControl.getClausePath() != undefined) {
			// TODO no point if path not yet defined
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");
			var currentModel = oControl.getModel("queryModel");
			// Set binding context, rather than just the binding path etc, as this seems essential for satisfactory binding of
			// aggregations
			oControl.setBindingContext(new sap.ui.model.Context(oQueryModel, oControl.getClausePath()), "queryModel")
			var currentCtx = oControl.getBindingContext("queryModel");
			var currentContext = oControl.getModel("queryModel").getProperty("", currentCtx);
			if (currentContext != undefined) {
				var sClass = currentContext._class;
				if (sClass == "Query") {
					oControl.setAggregation("_conceptClause", new sparqlish.control.conceptClause().setBindingContext(oControl.getBindingContext("queryModel"))
							.attachChangedClause(function(oEvent) {
								oControl.fireChangedClause();//oEvent.getSource().getParent().fireChangedClause();
							}));
					oRm.renderControl(oControl.getAggregation("_conceptClause"));
				} else if (sClass == "Clause") {
					oControl.setAggregation("_propertyClause", new sparqlish.control.propertyClause().setBindingContext(oControl.getBindingContext("queryModel"))
							.attachChangedClause(function(oEvent) {
							oControl.fireChangedClause();//oEvent.getSource().getParent().fireChangedClause();
							}));
					oRm.renderControl(oControl.getAggregation("_propertyClause"));
				} else if (sClass == "ConjunctionClause") {
					oControl.setAggregation("_conjunctionPropertyClause", new sparqlish.control.conjunctionPropertyClause().setBindingContext(
							oControl.getBindingContext("queryModel")).attachChangedClause(function(oEvent) {
						oControl.fireChangedClause();//oEvent.getSource().getParent().fireChangedClause();
					}));
					oRm.renderControl(oControl.getAggregation("_conjunctionPropertyClause"));
				} else {
					jQuery.sap.log.fatal("Incorrect class of provided query clause");
				}
			}
			oRm.write("</div>");
		} else {
			jQuery.sap.log.fatal("clausePath not defined");
		}
	}
});