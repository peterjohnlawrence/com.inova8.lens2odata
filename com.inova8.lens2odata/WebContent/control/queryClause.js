jQuery.sap.require("control.conceptClause");
jQuery.sap.require("control.propertyClause");
jQuery.sap.require("control.conjunctionPropertyClause");

sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.queryClause", {
		metadata : {
			properties : {
				clausePath : {
					type : "string"
				}
			},
			events : {
				queryChanged : {
					enablePreventDefault : true
				}
			},
			aggregations : {
				_conceptClause : {
					type : "control.conceptClause",
					multiple : false
				},
				_propertyClause : {
					type : "control.propertyClause",
					multiple : false
				},
				_conjunctionPropertyClause : {
					type : "control.conjunctionPropertyClause",
					multiple : false
				}
			}
		},
		init : function() {
		},
		renderer : function(oRm, oControl) {
			if (oControl.getClausePath() != undefined) {
				oRm.write("<div ");
				oRm.writeControlData(oControl);
				oRm.writeClasses();
				oRm.write(">");
				var currentModel = oControl.getModel("queryModel");
				if (!jQuery.isEmptyObject(currentModel)) {
					oControl.setBindingContext(new sap.ui.model.Context(currentModel, oControl.getClausePath()), "queryModel")
					var currentCtx = oControl.getBindingContext("queryModel");
					var currentContext = currentModel.getProperty("", currentCtx);
					if (!jQuery.isEmptyObject(currentContext)) {
						var sClass = currentContext._class;
						if (sClass == "Query") {
							oControl.setAggregation("_conceptClause", new control.conceptClause().setBindingContext(oControl.getBindingContext("queryModel"))
									.attachConceptClauseChanged(function(oEvent) {
										oControl.fireQueryChanged(oEvent);
									}));
							oRm.renderControl(oControl.getAggregation("_conceptClause"));
						} else if (sClass == "Clause") {
							oControl.setAggregation("_propertyClause", new control.propertyClause().setBindingContext(oControl.getBindingContext("queryModel"))
									.attachPropertyClauseChanged(function(oEvent) {
										oEvent.getSource().rerender();
										oControl.fireQueryChanged();
									}));
							oRm.renderControl(oControl.getAggregation("_propertyClause"));
						} else if (sClass == "ConjunctionClause") {
							oControl.setAggregation("_conjunctionPropertyClause", new control.conjunctionPropertyClause().setBindingContext(
									oControl.getBindingContext("queryModel")).attachConjunctionPropertyClauseChanged(function(oEvent) {
								oEvent.getSource().rerender();
								oControl.fireQueryChanged();
							}));
							oRm.renderControl(oControl.getAggregation("_conjunctionPropertyClause"));
						} else {
							jQuery.sap.log.fatal("Incorrect class of provided query clause");
						}
					}
					oRm.write("</div>");
				} else {
					// TODO Not really an error jQuery.sap.log.fatal("clausePath not defined");
				}
			}
		}
	});
});