jQuery.sap.require("sap.ui.core.IconPool");
sap.ui.commons.Link.extend("sparqlish.control.addClause", {
	metadata : {
		properties : {
		},
		aggregations : {
			_icon : {
				type : "sap.ui.core.Icon",
				multiple : false
			}
		},
		events : {
			pressed : {
				enablePreventDefault : true
			}
		}
	},
	init : function() {
		var self = this;
		var oLink = new sap.ui.core.Icon({
			src : sap.ui.core.IconPool.getIconURI("add-process"),
			tooltip : "{i18nModel>addClauseTooltip}"
		}).setColor(sap.ui.core.IconColor.Neutral );
		oLink.attachPress(function(oEvent) {
			self.firePressed();
		});
		self.setAggregation("_icon", oLink);
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_icon"));
	}
});