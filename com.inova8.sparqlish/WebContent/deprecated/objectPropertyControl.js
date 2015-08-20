sap.ui.core.Control.extend("sparqlish.control.objectPropertyControl", {
	metadata : {
		aggregations : {
			_objectProperty : {
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
		self.setAggregation("_objectProperty", new sap.ui.commons.Link({
			text : "{queryModel>objectProperty}",
			tooltip : "Select an object property",
			press : function(oEvent) {
				var me = oEvent.getSource();
				var eDock = sap.ui.core.Popup.Dock;
				var oObjectPropertyMenu = new sap.ui.unified.Menu({
					items : [  new sap.ui.unified.MenuItem({
					text : '*DELETE*'
				}),new sap.ui.unified.MenuItem({
					text : 'has order'
				}), new sap.ui.unified.MenuItem({
					text : 'has customer'
				}), new sap.ui.unified.MenuItem({
					text : 'has territory'
				}), new sap.ui.unified.MenuItem({
					text : 'has product'
				}) ]
				});
				oObjectPropertyMenu.attachItemSelect(function(oEvent) {
					// TODO self not safe
					if(self.getAggregation("_objectProperty").getText()!=oEvent.getParameter("item").getText()){
						self.fireChanged({objectProperty:oEvent.getParameter("item").getText()});
					}
					self.getAggregation("_objectProperty").setText(oEvent.getParameter("item").getText());
					self.fireSelected({objectProperty:oEvent.getParameter("item").getText()});
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}).addStyleClass("menuLink") );
	},

	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_objectProperty"));
	}
});