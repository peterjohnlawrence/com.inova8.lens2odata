sap.ui.define([ "sap/ui/core/Control", "sap/m/Link", "sap/m/Text" ], function(Control) {
	"use strict";
	return Control.extend("sparqlish.control.textLink", {
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
			this.setAggregation("_link", new sap.m.Link({}).addStyleClass("resultValue"));
		},
		renderer : function(oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.writeClasses();
			oRM.write(">");
			var sValue = oControl.getProperty("value");
			if (!utils.validateUrl(sValue)) {
				oRM.renderControl(oControl.getAggregation("_text").setText(sValue));
			} else {
				oRM.renderControl(oControl.getAggregation("_link").setText(oControl.getProperty("linkText")).setHref(sValue));
			}
			oRM.write("</div>")
		}
	});
});
