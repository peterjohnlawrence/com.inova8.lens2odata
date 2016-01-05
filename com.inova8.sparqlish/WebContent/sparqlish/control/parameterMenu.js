jQuery.sap.require("sap.m.P13nDialog");
jQuery.sap.require("sap.m.P13nColumnsPanel");
jQuery.sap.require("sap.m.P13nItem");
jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("sparqlish.utilities");
sap.ui.core.Control.extend("sparqlish.control.parameterMenu", {
	metadata : {
		properties : {},
		aggregations : {},
		events : {}
	},
	open : function() {
		var self = this;
		self.oParameterPanel.setModel(self.getModel("queryModel"), "queryModel");
		self.oDialog.open();
	},
	init : function() {
		var self = this;
		self.oValueSuggestionPanel = new sap.m.P13nPanel({
			title : "{i18nModel>valueSuggestions}"
		});
		self.oParameterPanel = new sap.m.P13nColumnsPanel({
			title : "{i18nModel>valueParameters}",
			items : {
				path : "queryModel>/parameters",
				template : new sap.m.P13nItem({
					columnKey : "{queryModel>name}",
					text : "{queryModel>type}",
				//	visible : '{= ((${queryModel>type}==="Edm.String") ? true : false) }' 
				})
			}
		});
		// TODO Undocumented hack to make P13nColumnsPanel to be single select
		self.oParameterPanel._oTable.setMode(sap.m.ListMode.SingleSelect);

		self.oDialog = new sap.m.P13nDialog({
			title : "{i18nModel>editParameterTitle}",
			cancel : function() {
				self.oDialog.close();
			},
			ok : function(oEvent) {
				// TODO is this the correct order?
				self.oDialog.close();
				switch (self.oDialog.indexOfPanel(self.oDialog.getVisiblePanel())) {
				case 0:
					if (!jQuery.isEmptyObject(self.oValueSuggestionPanel.getOkPayload().selectedItems[0]))
						objectPropertySelect(self.oValueSuggestionPanel.getOkPayload().selectedItems[0].columnKey);
					break;
				case 1:
					if (!jQuery.isEmptyObject(self.oParameterPanel.getOkPayload().selectedItems[0]))
						dataPropertySelect(self.oParameterPanel.getOkPayload().selectedItems[0].columnKey);
					break;
				default:
				}
			}
		});
		self.oDialog.addPanel(self.oValueSuggestionPanel);
		self.oDialog.addPanel(self.oParameterPanel);
	},
	parameterValueFactory : function(sId, oContext) {
		var oParameterValue = new sap.m.P13nItem({
			columnKey : "{queryModel>name}",
			text : "{queryModel>name}"
		});
		return oParameterValue;
	},
	renderer : function(oRm, oControl) {

	}
});