jQuery.sap.require("control.propertyClause");
jQuery.sap.require("control.conjunctionPropertyClause");

sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.clauses", {
		metadata : {
			properties : {},
			events : {
				changedClause : {
					enablePreventDefault : true
				}
			},
			aggregations : {
				_propertyClause : {
					type : "control.propertyClause",
					multiple : false
				},
				_conjunctionPropertyClauses : {
					type : "control.conjunctionPropertyClause",
					multiple : true
				}
			}
		},
		getCurrentQueryContext : function() {
			return this.getModel("queryModel").getProperty("", this.getBindingContext("queryModel"));
		},
		init : function() {
			var self = this;
			self.setAggregation("_propertyClause", new control.propertyClause({}).bindElement("queryModel>clause")
					 .attachPropertyClauseChanged(function(oEvent) {	oEvent.getSource().getParent().fireChangedClause();	})
			);
			// TODO using factory function as this ensures context is bound correctly
			self.bindAggregation("_conjunctionPropertyClauses", "queryModel>conjunctionClauses", function(sId, oContext) {
				return new control.conjunctionPropertyClause(sId).setBindingContext(oContext)
				 .attachConjunctionPropertyClauseChanged(function(oEvent) {	oEvent.getSource().getParent().fireChangedClause();})
				;
			});
			// self.setAggregation("_conjunctionPropertyClauses", new
			// control.conjunctionPropertyClause().bindElement( "queryModel>conjunctionClauses/0"));
		},
		renderer : function(oRm, oControl) {
			oRm.addClass("clauses");
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");
			if (!jQuery.isEmptyObject(oControl.getAggregation("_propertyClause"))) {
				oRm.renderControl(oControl.getAggregation("_propertyClause"));
				oRm.write("&nbsp;");
			}
			var oConjunctionClauses = oControl.getAggregation("_conjunctionPropertyClauses");
			if (!jQuery.isEmptyObject(oConjunctionClauses)) {
				for (var i = 0; i < oConjunctionClauses.length; i++) {
					oRm.renderControl(oConjunctionClauses[i]);
				}
			}
			oRm.write("</div>");
		}
	});
});