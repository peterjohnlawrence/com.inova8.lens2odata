jQuery.sap.require("control.conceptOperationParameter");
jQuery.sap.require("sap.ui.commons.ListBox");
jQuery.sap.require("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.core.IconPool");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.conceptOperationParameters", {
		metadata : {
			aggregations : {
				_conceptOperationParameters : {
					type : "control.conceptOperationParameter",
					multiple : true
				}
			},
			events : {
				deleted : {
					enablePreventDefault : true
				}
			}
		},
		init : function() {
			var self = this;
			self.bindAggregation("_conceptOperationParameters", "queryModel>", new control.conceptOperationParameter());
		},
		renderer : function(oRm, oControl) {
			var oConceptOperationParameters = oControl.getAggregation("_conceptOperationParameters");
			if (!jQuery.isEmptyObject(oConceptOperationParameters)) {
				for (var i = 0; i < oConceptOperationParameters.length; i++) {
					if (i > 0) {
						oRm.renderControl(new sap.m.Label().setText(sap.ui.getCore().getModel("i18nModel").getProperty("conceptOperationParameters.conjunction")).addStyleClass(
								"conjunctionMenuLink"));
					} else {
						oRm.write("&nbsp;");
						oRm.renderControl(new sap.m.Label().setText(sap.ui.getCore().getModel("i18nModel").getProperty("conceptOperationParameters.with")).addStyleClass(
								"conjunctionMenuLink"));
					}
					oRm.write("&nbsp;");
					oRm.renderControl(oConceptOperationParameters[i]);
				}
			}

		}
	});
});