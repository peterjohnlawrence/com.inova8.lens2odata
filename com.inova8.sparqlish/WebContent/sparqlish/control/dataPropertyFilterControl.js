sap.ui.core.Control.extend("sparqlish.control.dataPropertyFilterControl", {
	metadata : {
		properties : {
			dataPropertyFilter : "object"
		},
		aggregations : {
			_condition : {
				type : "sap.ui.commons.Link",
				multiple : false,
				visibility : "hidden"
			},
			_value : {
				type : "sap.ui.commons.InPlaceEdit",
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
					}), new sap.ui.unified.MenuItem({
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
					if (selectedItem == '*DELETE*') {
						self.destroyAggregation("_dataPropertyFilter");
						self.getParent().removeAggregation("_dataPropertyFilter");
					} else {
						self.getAggregation("_condition").setText(selectedItem);
						self.getProperty("dataPropertyFilter").condition = selectedItem;
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}));
		this.setAggregation("_value", new sap.ui.commons.InPlaceEdit({
			content : new sap.ui.commons.TextField({
				value : "[enter value]",
				tooltip : "Enter value for condition",
				width:"auto"
			})
		}));
	},
	setDataPropertyFilter : function(oDataPropertyFilter) {
		this.setProperty("dataPropertyFilter", oDataPropertyFilter, false);
		this.getAggregation("_condition").setText(oDataPropertyFilter.condition);
		this.getAggregation("_value").getContent().setValue(oDataPropertyFilter.value);
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_condition"));
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_value"));
	}
});