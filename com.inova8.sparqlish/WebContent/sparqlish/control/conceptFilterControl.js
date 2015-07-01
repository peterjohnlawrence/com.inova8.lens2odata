sap.ui.core.Control.extend("sparqlish.control.conceptFilterControl", {
	metadata : {
		properties : {
			conceptFilter : "object"
		},
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
					if (selectedItem == '*DELETE*') {
						self.destroyAggregation("_conceptFilter");
						delete self.getProperty("conceptFilter");
						self.fireDeleted();
					} else {
						self.getAggregation("_conceptFilter").setText(selectedItem);
						self.getProperty("conceptFilter").Id = selectedItem;
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}));
	},
	setConceptFilter : function(oConceptFilter) {
		this.setProperty("conceptFilter", oConceptFilter, false);
		this.getAggregation("_conceptFilter").setText(oConceptFilter.Id);
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_conceptFilter"));
	}
});