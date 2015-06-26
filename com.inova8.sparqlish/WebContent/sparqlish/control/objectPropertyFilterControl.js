sap.ui.core.Control.extend("sparqlish.control.objectPropertyFilterControl", {
	metadata : {
		properties : {
			objectPropertyClause : "object",
			filterIndex : "int"
		},
		aggregations : {
			_objectPropertyFilter : {
				type : "sap.ui.commons.Link",
				multiple : false,
				visibility : "hidden"
			}
		}
	},
	init : function() {
		var self = this;
		this.setAggregation("_objectPropertyFilter", new sap.ui.commons.Link({
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
						self.destroyAggregation("_objectPropertyFilter");
						self.getParent().removeAggregation("_objectPropertyFilters", iFilterIndex);
					} else {
						self.getAggregation("_objectPropertyFilter").setText(selectedItem);
						self.getProperty("objectPropertyClause").objectPropertyFilters.push({"Id":selectedItem});
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}));
	},
	setObjectPropertyClause : function(oObjectPropertyClause) {
		this.setProperty("objectPropertyClause", oObjectPropertyClause, false);
	},
	setFilterIndex : function(iFilterIndex) {
		this.setProperty("filterIndex", iFilterIndex, false);
		if (iFilterIndex > this.getProperty("objectPropertyClause").objectPropertyFilters.length) {
			this.getAggregation("_objectPropertyFilter").setText("[enter value]");
		} else {
			this.getAggregation("_objectPropertyFilter").setText(this.getProperty("objectPropertyClause").objectPropertyFilters[iFilterIndex].Id);
		}
	},
	renderer : function(oRm, oControl) {
		if (oControl.getProperty("filterIndex") > 0) {
			oRm.write(", ");
		}else{
			oRm.write(" in ");
		}
		oRm.renderControl(oControl.getAggregation("_objectPropertyFilter"));
	}
});