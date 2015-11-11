jQuery.sap.require("sap.ui.core.IconPool");
sap.ui.commons.Link.extend("sparqlish.control.includeOptionalIgnore", {
	metadata : {
		properties : {
			state : {
				type : "string",
				defaultValue : "include"
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
			src : sap.ui.core.IconPool.getIconURI("sys-enter"),
			tooltip : "{i18nModel>sparqlishInclude}"
		});
		oLink.attachPress(function(oEvent) {
			var me = oEvent.getSource().getParent();
			var currentState = me.getProperty("state");
			if (currentState == "include") {
				me.setState("optional");
			} else if (currentState == "optional") {
				me.setState("ignore");
			} else if (currentState == "ignore") {
				me.setState( "include");
			}
			me.firePress({
				"state" : me.getProperty("state")
			});
		});
		self.setAggregation("_icon", oLink);
	},
	setState : function(sState) {                                                                                  
		this.setProperty("state", sState);
		var sIcon="sys-enter";
		var sTooltip = "i18nModel>Error";
		switch (sState) {
		case "include":
			sIcon = "sys-enter";
			sTooltip = "i18nModel>sparqlishInclude";
			break;
		case "optional":
			sIcon = "sys-help";
			sTooltip = "i18nModel>sparqlishOptional";
			break;
		case "ignore":
			sIcon = "sys-cancel";
			sTooltip = "i18nModel>sparqlishIgnore";
			break;
		case "default":
			sIcon = "sys-enter";
			sTooltip = "i18nModel>Error";
			break;
		}
		this.getAggregation("_icon").setSrc(sap.ui.core.IconPool.getIconURI(sIcon));
		this.getAggregation("_icon").bindProperty("tooltip",sTooltip);
		this.rerender();
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_icon"));
	}
});