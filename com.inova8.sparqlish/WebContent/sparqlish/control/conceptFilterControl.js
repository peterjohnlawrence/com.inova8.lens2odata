sap.ui.core.Control.extend("sparqlish.control.conceptFilterControl", {
	metadata : {
		properties : {
			query : "object",
			filterIndex : "int"
		},
		aggregations : {
			_conceptFilter : {
				type : "sap.ui.commons.Link",
				multiple : false,
				visibility : "hidden"
			}
		}
	},
	init : function() {
		var self = this;
		this.setAggregation("_conceptFilter", new sap.ui.commons.Link({
			text : "[enter value]",
			tooltip : "Select a value",
			press : function(oEvent) {
				var oSource = oEvent.getSource();
				var eDock = sap.ui.core.Popup.Dock;
				var oConceptListMenu = new sap.ui.unified.Menu({
					items : [ new sap.ui.unified.MenuItem({
						text : '*DELETE*'
					}), new sap.ui.unified.MenuItem({
						text : 'northwind:Order-0'
					}), new sap.ui.unified.MenuItem({
						text : 'northwind:Order-1'
					}), new sap.ui.unified.MenuItem({
						text : 'northwind:Order-2'
					}), new sap.ui.unified.MenuItem({
						text : 'northwind:Order-3'
					}) ]
				});
				oConceptListMenu.attachItemSelect(function(oEvent) {
					var selectedItem = oEvent.getParameter("item").getText();
					var iFilterIndex = self.getProperty("filterIndex");
					if (selectedItem == '*DELETE*') {
						self.destroyAggregation("_conceptFilter");
						self.getParent().removeAggregation("_conceptFilters", iFilterIndex);
					} else {
						self.getAggregation("_conceptFilter").setText(selectedItem);
						self.getProperty("query").conceptFilters.push({"Id":selectedItem});
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}));
	},
	setQuery : function(oQuery) {
		this.setProperty("query", oQuery, false);
	},
	setFilterIndex : function(iFilterIndex) {
		this.setProperty("filterIndex", iFilterIndex, false);
		if (iFilterIndex > this.getProperty("query").conceptFilters.length) {
			this.getAggregation("_conceptFilter").setText("[enter value]");
		} else {
			this.getAggregation("_conceptFilter").setText(this.getProperty("query").conceptFilters[iFilterIndex].Id);
		}
	},
	renderer : function(oRm, oControl) {
		if (oControl.getProperty("filterIndex") > 0) {
			oRm.write(", ");
		}else{
			oRm.write(" in ");
		}
		oRm.renderControl(oControl.getAggregation("_conceptFilter"));
	}
});