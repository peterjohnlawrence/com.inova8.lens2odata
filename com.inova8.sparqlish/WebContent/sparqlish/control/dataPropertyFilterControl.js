sap.ui.core.Control.extend("sparqlish.control.dataPropertyFilterControl", {
	metadata : {
		properties : {
			dataPropertyClause : "object"
		},
		aggregations : {
			_condition : {
				type : "sap.ui.commons.Link",
				multiple : false,
				visibility : "hidden"
			},
			_value : {
				type : "sap.ui.commons.Link",
				multiple : false,
				visibility : "hidden"
			}
		}
	},
	init : function() {
		var self = this;
		this.setAggregation("_condition", new sap.ui.commons.Link({
			text : "[enter condition]",
			tooltip : "Select a condition",
			press : function(oEvent) {
				var oSource = oEvent.getSource();
				var eDock = sap.ui.core.Popup.Dock;
				var oConceptListMenu = new sap.ui.unified.Menu({
					items : [ new sap.ui.unified.MenuItem({
					text : '*DELETE*'
				}),new sap.ui.unified.MenuItem({
					text : 'containing'
				}), new sap.ui.unified.MenuItem({
					text : 'less than'
				}), new sap.ui.unified.MenuItem({
					text : 'greater than'
				}), new sap.ui.unified.MenuItem({
					text : 'equals'
				}) ]
				});
				oConceptListMenu.attachItemSelect(function(oEvent) {
					var selectedItem = oEvent.getParameter("item").getText();
					var iFilterIndex = self.getProperty("filterIndex");
					if (selectedItem == '*DELETE*') {
						self.destroyAggregation("_dataPropertyFilter");
						self.getParent().removeAggregation("_dataPropertyFilters", iFilterIndex);
					} else {
						self.getAggregation("_dataPropertyFilter").setText(selectedItem);
						self.getProperty("dataPropertyClause").dataPropertyFilters.push({
							"Id" : selectedItem
						});
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}));
	},
	setDataPropertyClause : function(oDataPropertyClause) {
		this.setProperty("dataPropertyClause", oDataPropertyClause, false);
	},
	renderer : function(oRm, oControl) {
		if (oControl.getProperty("filterIndex") > 0) {
			oRm.write(", ");
		} else {
			oRm.write(" in ");
		}
		oRm.renderControl(oControl.getAggregation("_dataPropertyFilter"));
	}
});