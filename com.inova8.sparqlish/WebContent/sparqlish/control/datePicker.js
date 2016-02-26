	"use strict";
	sap.m.DatePicker.extend("sparqlish.control.datePicker", {
	metadata : {
		events : {
			"valueHelpRequest" : {}
		}
	},
	init : function() {
		var self = this;
		self._bInitialLoading = true;
		sap.m.DatePicker.prototype.init.apply(self, arguments);
		self.valueHelp=new sap.ui.core.Icon({
			src : sap.ui.core.IconPool.getIconURI("value-help"),
			press : function(oEvent) {
				self.fireValueHelpRequest(oEvent,arguments);
			}
		}).addStyleClass("sapUiIcon");

	},
	onBeforeRendering : function() {
		sap.m.DatePicker.prototype.onBeforeRendering.apply(this, arguments);
	},

	renderer : {
		render : function(oRm, oControl) {
			oRm.write("<div>");
			sap.m.DatePickerRenderer.render(oRm, oControl);
			oRm.renderControl(oControl.valueHelp);
			oRm.write("</div>");
		}
	}
});
