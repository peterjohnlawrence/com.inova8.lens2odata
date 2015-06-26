sap.ui.core.Control.extend("sparqlish.control.dataPropertyConjunctionFilterControl", {
	metadata : {
		properties : {
			dataPropertyClause : "object",
			filterIndex : "int"
		},
		aggregations : {
			_dataPropertyFilter : {
				type : "sap.ui.commons.Link",
				multiple : false,
				visibility : "hidden"
			}
		}
	},
	init : function() {
		var self = this;
		this.setAggregation("_dataPropertyFilter", new sap.ui.commons.Link({
			text : "[enter value]",
			tooltip : "Select a value",
			press : function(oEvent) {
				var oSource = oEvent.getSource();
				var eDock = sap.ui.core.Popup.Dock;
				var oConceptListMenu = new sap.ui.unified.Menu({
					items : [  new sap.ui.unified.MenuItem({
						text : '*DELETE*'
					}), new sap.ui.unified.MenuItem({
					text : 'northwind:Customer-0' 
				}), new sap.ui.unified.MenuItem({
					text : 'northwind:Customer-1' 
				}), new sap.ui.unified.MenuItem({
					text : 'northwind:Customer-2'
				}), new sap.ui.unified.MenuItem({
					text : 'northwind:Customer-3' 
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
						self.getProperty("dataPropertyClause").dataPropertyFilters.push({"Id":selectedItem});
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}));
	},
	setDataPropertyClause : function(oDataPropertyClause) {
		this.setProperty("dataPropertyClause", oDataPropertyClause, false);
	},
	setFilterIndex : function(iFilterIndex) {
		this.setProperty("filterIndex", iFilterIndex, false);
		if (iFilterIndex > this.getProperty("dataPropertyClause").dataPropertyFilters.length) {
			this.getAggregation("_dataPropertyFilter").setText("[enter value]");
		} else {
			this.getAggregation("_dataPropertyFilter").setText(this.getProperty("dataPropertyClause").dataPropertyFilters[iFilterIndex].Id);
		}
	},
	renderer : function(oRm, oControl) {
		if (oControl.getProperty("filterIndex") > 0) {
			oRm.write(", ");
		}else{
			oRm.write(" in ");
		}
		oRm.renderControl(oControl.getAggregation("_dataPropertyFilter"));
	}
});