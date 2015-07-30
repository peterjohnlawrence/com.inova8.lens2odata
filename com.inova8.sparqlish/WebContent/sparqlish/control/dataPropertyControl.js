sap.ui.core.Control.extend("sparqlish.control.dataPropertyControl", {
	metadata : {
		properties : {
			dataProperty : "object"
		},
		aggregations : {
			_dataProperty : {
				type : "sap.ui.commons.Link",
				multiple : false
			}
		},
		events : {
			selected : {
				enablePreventDefault : true
			},
			unselected : {
				enablePreventDefault : true
			},
			changed : {
				enablePreventDefault : true
			}
		}
	},
	init : function() {
		var self = this;
		this.setAggregation("_dataProperty", new sap.ui.commons.Link({
			text : "[select data property]",
			tooltip : "Select an data property",
			press : function(oEvent) {
				var oSource = oEvent.getSource();
				var eDock = sap.ui.core.Popup.Dock;
				var oDataPropertyMenu = new sap.ui.unified.Menu({
					items : [new sap.ui.unified.MenuItem({
					text : '*DELETE*'
				}), new sap.ui.unified.MenuItem({
					text : 'shipCountry'
				}), new sap.ui.unified.MenuItem({
					text : 'shipDate'
				}), new sap.ui.unified.MenuItem({
					text : 'companyName'
				}), new sap.ui.unified.MenuItem({
					text : 'contactName'
				}) ]
				});
				oDataPropertyMenu.attachItemSelect(function(oEvent) {
					if(self.getAggregation("_dataProperty").getText()!=oEvent.getParameter("item").getText()){
						self.fireChanged({dataProperty:oEvent.getParameter("item").getText()});
					}
					self.getAggregation("_dataProperty").setText(oEvent.getParameter("item").getText());
					self.fireSelected({dataProperty:oEvent.getParameter("item").getText()});
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}).bindProperty("text","queryModel>dataProperty"));
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_dataProperty"));
	}
});