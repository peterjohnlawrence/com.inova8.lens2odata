sap.ui.core.Control.extend("sparqlish.control.objectPropertyControl", {
	metadata : {
		properties : {
			objectPropertyClause : "object"
		},
		aggregations : {
			_objectProperty : {
				type : "sap.ui.commons.Link",
				multiple : false,
				visibility : "hidden"
			}
		}
	},
	init : function() {
		var self = this;
		this.setAggregation("_objectProperty", new sap.ui.commons.Link({
			text : "[select object property]",
			tooltip : "Select an object property",
			press : function(oEvent) {
				var oSource = oEvent.getSource();
				var eDock = sap.ui.core.Popup.Dock;
				var oConceptListMenu = new sap.ui.unified.Menu({
					items : [  new sap.ui.unified.MenuItem({
					text : '*DELETE*'
				}),new sap.ui.unified.MenuItem({
					text : 'has order'
				}), new sap.ui.unified.MenuItem({
					text : 'has customer'
				}), new sap.ui.unified.MenuItem({
					text : 'has territory'
				}), new sap.ui.unified.MenuItem({
					text : 'has product'
				}) ]
				});
				oConceptListMenu.attachItemSelect(function(oEvent) {
					self.getAggregation("_objectProperty").setText(oEvent.getParameter("item").getText());
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}));
	},
	setObjectPropertyClause : function(oObjectPropertyClause) {
		this.setProperty("objectPropertyClause", oObjectPropertyClause, true);
		if (oObjectPropertyClause.objectProperty == null) {
			this.getAggregation("_objectProperty").setText("[select object property]");
		} else {
			this.getAggregation("_objectProperty").setText(oObjectPropertyClause.objectProperty);
		}
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_objectProperty"));
	}
});