sap.ui.core.Control.extend("sparqlish.control.dataPropertyFilterControl", {
	metadata : {
		aggregations : {
			_condition : {
				type : "sap.ui.commons.Link",
				multiple : false
			},
			_value : {
				type : "sap.ui.commons.InPlaceEdit",
				multiple : false
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
		self.setAggregation("_condition", new sap.ui.commons.Link({
			text : "{condition}",
			tooltip : "Select a condition",
			press : function(oEvent) {
				//var oSource = oEvent.getSource();
				//TODO Need to explicitly find 'this' instead of using self in the case of a aggregation with multiple=true
				var me =  oEvent.getSource().getParent();
				var eDock = sap.ui.core.Popup.Dock;
				var oConditiontMenu = new sap.ui.unified.Menu({
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
				oConditiontMenu.attachItemSelect(function(oEvent) {
					var selectedItem = oEvent.getParameter("item").getText();
					if (selectedItem == '*DELETE*') {
						me.fireDeleted();
					} else {
						me.getAggregation("_condition").setText(selectedItem);
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}));
		self.setAggregation("_value", new sap.ui.commons.InPlaceEdit({
			content : new sap.ui.commons.TextField({
				value : "{value}",
				tooltip : "Enter value for condition",
				width:"auto"
			})
		}));
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_condition"));
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_value"));
	}
});