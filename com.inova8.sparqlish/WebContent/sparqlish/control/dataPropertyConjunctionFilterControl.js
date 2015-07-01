sap.ui.core.Control.extend("sparqlish.control.dataPropertyConjunctionFilterControl", {
	metadata : {
		properties : {
			dataPropertyConjunctionFilter : "object",
			filterIndex : "int"
		},
		aggregations : {
			_conjunction : {
				type : "sap.ui.commons.Link",
				multiple : false,
				visibility : "hidden"
			},
			_dataPropertyFilter : {
				type : "sparqlish.control.dataPropertyFilterControl",
				multiple : false,
				visibility : "hidden"
			}
		}
	},
	init : function() {
		var self = this;
		this.setAggregation("_conjunction", new sap.ui.commons.Link({
			text : "[enter conjunction]",
			tooltip : "Select a conjunction",
			press : function(oEvent) {
				var oSource = oEvent.getSource();
				var eDock = sap.ui.core.Popup.Dock;
				var oConceptListMenu = new sap.ui.unified.Menu({
					items : [ new sap.ui.unified.MenuItem({
						text : '*DELETE*'
					}), new sap.ui.unified.MenuItem({
						text : 'and'
					}), new sap.ui.unified.MenuItem({
						text : 'or'
					}) ]
				});
				oConceptListMenu.attachItemSelect(function(oEvent) {
					var selectedItem = oEvent.getParameter("item").getText();
					var iFilterIndex = self.getProperty("filterIndex");
					if (selectedItem == '*DELETE*') {
						self.destroyAggregation("_conjunction");
						self.destroyAggregation("_dataPropertyFilter");
						self.getParent().removeAggregation("_dataPropertyFilters", iFilterIndex);
					} else {
						self.getAggregation("_conjunction").setText(selectedItem);
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}));
		self.setAggregation("_dataPropertyFilter", new sparqlish.control.dataPropertyFilterControl({
//			dataPropertyFilter : self.getProperty("dataPropertyConjunctionFilter").filter
		}));
	},
	setDataPropertyConjunctionFilter : function(oDataPropertyConjunctionFilter) {
		this.setProperty("dataPropertyConjunctionFilter", oDataPropertyConjunctionFilter, false);
		this.getAggregation("_conjunction").setText(oDataPropertyConjunctionFilter.filterConjunction);
		this.getAggregation("_dataPropertyFilter").setDataPropertyFilter(oDataPropertyConjunctionFilter.filter);
	},
	setFilterIndex : function(iFilterIndex) {
		this.setProperty("filterIndex", iFilterIndex, false);
		//if (iFilterIndex > this.getProperty("dataPropertyConjunctionFilter").filters.conjunctionFilters.length) {
			// this.getAggregation("_dataPropertyFilter").setText("[enter value]");
		//} else {
			// this.getAggregation("_dataPropertyFilter").setText(this.getProperty("dataPropertyClause").dataPropertyFilters[iFilterIndex].Id);
		//}
	},
	renderer : function(oRm, oControl) {
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_conjunction"));
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_dataPropertyFilter"));
	}
});