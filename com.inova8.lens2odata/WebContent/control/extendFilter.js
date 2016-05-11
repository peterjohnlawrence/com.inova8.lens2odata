jQuery.sap.require("sap.ui.core.IconPool");
	"use strict";
sap.ui.commons.Link.extend("control.extendFilter", {
	metadata : {
		properties : {
			icon : {
				type : "string",
				defaultValue : "delete"
			},
			tooltip : {
				type : "string",
				defaultValue : "Select a dataproperty to find"
			}
		},
		aggregations : {
			_icon : {
				type : "sap.ui.core.Icon",
				multiple : false
			}
		},
		events : {
			press : {
				enablePreventDefault : true
			}
		}
	},
	init : function() {
		var self = this;
		var oLink = new sap.ui.core.Icon({
			src : sap.ui.core.IconPool.getIconURI(self.getProperty("icon")),
			tooltip : self.getProperty("tooltip")
		}).setColor(sap.ui.core.IconColor.Neutral).addStyleClass("menuLink");
		oLink.attachPress(function(oEvent) {
			self.firePress();
		});
		self.setAggregation("_icon", oLink);
	},
	setIcon : function(sIcon) {
		this.setProperty("icon", sIcon);
		this.getAggregation("_icon").setSrc(sap.ui.core.IconPool.getIconURI(sIcon));
	},
	setTooltip : function(sTooltip) {
		this.setProperty("tooltip", sTooltip);
		this.getAggregation("_icon").setTooltip(sTooltip);
	},
	renderer : function(oRm, oControl) {
		//oRm.writeControlData(oControl);
		oRm.renderControl(oControl.getAggregation("_icon"));
	}
});