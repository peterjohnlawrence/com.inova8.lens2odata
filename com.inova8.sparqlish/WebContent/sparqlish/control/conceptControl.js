sap.ui.core.Control.extend("sparqlish.control.conceptControl", {
	metadata : {
		properties : {
			query : "object"
		},
		aggregations : {
			_concept : {
				type : "sap.ui.commons.Link",
				multiple : false,
				visibility : "hidden"
			}
		}
	},
	init : function() {
		var self = this;
		this.setAggregation("_concept", new sap.ui.commons.Link({
			text : "[select concept]",
			tooltip : "Select a concept to find",
			press : function(oEvent) {
				var oSource = oEvent.getSource();
				var eDock = sap.ui.core.Popup.Dock;
				var oConceptListMenu = new sap.ui.unified.Menu({
					items : [ new sap.ui.unified.MenuItem({
						text : '*DELETE*'
					}),  new sap.ui.unified.MenuItem({
						text : 'Order'
					}), new sap.ui.unified.MenuItem({
						text : 'Customer'
					}), new sap.ui.unified.MenuItem({
						text : 'Territory'
					}), new sap.ui.unified.MenuItem({
						text : 'Product'
					}) ]
				});
				oConceptListMenu.attachItemSelect(function(oEvent) {
					self.getAggregation("_concept").setText(oEvent.getParameter("item").getText());
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}));
	},
	setQuery : function(oQuery) {
		this.setProperty("query", oQuery, true);
		if (oQuery.concept == null) {
			this.getAggregation("_concept").setText("[select concept]");
		} else {
			this.getAggregation("_concept").setText(oQuery.concept);
		}
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_concept"));
	}
});