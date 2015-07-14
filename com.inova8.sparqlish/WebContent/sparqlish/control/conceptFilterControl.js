sap.ui.core.Control.extend("sparqlish.control.conceptFilterControl", {
	metadata : {
		aggregations : {
			_conceptFilter : {
				type : "sap.ui.commons.Link",
				multiple : false,
				visibility : "hidden"
			}
		},
		events : {
			deleted : {
				enablePreventDefault : true
			}
		}
	},
	init : function() {
		var self = this;
		self.setAggregation("_conceptFilter", new sap.ui.commons.Link({
			text : "{Id}",
			tooltip : "Select a value",
			press : function(oEvent) {
				var oSource = oEvent.getSource();
				var eDock = sap.ui.core.Popup.Dock;
				var oConceptMenu = new sap.ui.unified.Menu({
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
				oConceptMenu.attachItemSelect(function(oEvent) {
					var selectedItem = oEvent.getParameter("item").getText();
					if (selectedItem == '*DELETE*') {
						self.fireDeleted();
					} else {
						self.getAggregation("_conceptFilter").setText(selectedItem);
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}));
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_conceptFilter"));
	}
});