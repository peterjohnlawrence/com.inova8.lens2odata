sap.ui.core.Control.extend("sparqlish.control.dataPropertyControl", {
	metadata : {
		properties : {
			dataPropertyClause : "object"
		},
		aggregations : {
			_dataProperty : {
				type : "sap.ui.commons.Link",
				multiple : false,
				visibility : "hidden"
			}
		}
	},
	init : function() {
		var self = this;
		this.setAggregation("_dataProperty", new sap.ui.commons.Link({
			text : "[select data property]",
			tooltip : "Select an data property",
			press : function(oEvent) {
				var oSource = oEvent.getSource();
				var eDock = sap.ui.core.Popup.Dock;
				var oConceptListMenu = new sap.ui.unified.Menu({
					items : [new sap.ui.unified.MenuItem({
					text : '*DELETE*'
				}), new sap.ui.unified.MenuItem({
					text : 'shipCountry'
				}), new sap.ui.unified.MenuItem({
					text : 'shipDate'
				}), new sap.ui.unified.MenuItem({
					text : 'companyName'
				}), new sap.ui.unified.MenuItem({
					text : 'contactName'
				}) ]
				});
				oConceptListMenu.attachItemSelect(function(oEvent) {
					self.getAggregation("_dataProperty").setText(oEvent.getParameter("item").getText());
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}));
	},
	setDataPropertyClause : function(oDataPropertyClause) {
		this.setProperty("dataPropertyClause", oDataPropertyClause, true);
		if (oDataPropertyClause.dataProperty == null) {
			this.getAggregation("_dataProperty").setText("[select data property]");
		} else {
			this.getAggregation("_dataProperty").setText(oDataPropertyClause.dataProperty);
		}
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_dataProperty"));
	}
});