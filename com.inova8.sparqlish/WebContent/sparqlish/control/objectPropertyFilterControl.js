sap.ui.core.Control.extend("sparqlish.control.objectPropertyFilterControl", {
	metadata : {
		properties : {
			objectPropertyFilter : "object"
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
					items : [ new sap.ui.unified.MenuItem({
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
					if (selectedItem == '*DELETE*') {
						self.destroyAggregation("_objectPropertyFilter");
					} else {
						self.getAggregation("_objectPropertyFilter").setText(selectedItem);
						self.getProperty("objectPropertyFilter").Id = selectedItem;
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}));
		self.setObjectPropertyFilter({
			Id : "[enter value]"
		});
	},
	setObjectPropertyFilter : function(oObjectPropertyFilter) {
		this.setProperty("objectPropertyFilter", oObjectPropertyFilter, false);
		this.getAggregation("_objectPropertyFilter").setText(oObjectPropertyFilter.Id);
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_objectPropertyFilter"));
	}
});