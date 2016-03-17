sap.ui.define([ "sap/ui/core/Control", "sap/m/Link", "sap/m/Text" ], function(Control) {
	"use strict";
	return Control.extend("control.textLink", {
		metadata : {
			properties : {
				value : {
					type : "string",
					defaultValue : ""
				},
				linkText : {
					type : "string",
					defaultValue : "LINK"
				},
				wrapping : {
					type : "boolean",
					defaultValue : true
				},
				tooltip : {
					type : "string",
					defaultValue : ""
				},
				inNewTab : {
					type : "boolean",
					defaultValue : true
				}
			},
			aggregations : {
				_text : {
					type : "sap.m.Text",
					multiple : false,
					visibility : "hidden"
				},
				_link : {
					type : "sap.m.Link",
					multiple : false,
					visibility : "hidden"
				}
			}
		},
		init : function() {
			this.setAggregation("_text", new sap.m.Text({}).addStyleClass("resultValue"));
			this.setAggregation("_link", new sap.m.Link({}).addStyleClass("resultValue").attachPress(function(oEvent) {
				if (oEvent.getSource().getParent().getInNewTab()) {
					oEvent.cancelBubble();
					oEvent.preventDefault();
					sap.m.URLHelper.redirect(oEvent.getSource().getHref(), true);
				} 
			}));
		},
		renderer : function(oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.writeClasses();
			oRM.write(">");
			var sValue = oControl.getValue();
			// Test
//			 oRM.renderControl(oControl.getAggregation("_link").setText(oControl.getLinkText()).setHref("http://www.inova8.com"));
			if (!utils.validateUrl(sValue)) {
				oRM.renderControl(oControl.getAggregation("_text").setText(sValue));
			} else {
				oRM.renderControl(oControl.getAggregation("_link").setText(oControl.getLinkText()).setHref(sValue));
			}
			oRM.write("</div>")
		}
	});
});
