jQuery.sap.require("sap.ui.core.IconPool");
sap.ui.core.Control.extend("sparqlish.control.objectPropertyFilterControl", {
	metadata : {
		aggregations : {
			_objectPropertyFilter : {
				type : "sap.ui.commons.Link",
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
		this.setAggregation("_objectPropertyFilter", new sap.ui.commons.Link({
			//text : '{="queryModel>" + ${entityTypeModel>/Key/PropertyRef/name}}', //entityTypeModel/Key/PropertyRef/name
			text : '{queryModel>CustomerID}',
			tooltip : "Select a value",
			press : function(oEvent) {
				var me = oEvent.getSource().getParent();
				var eDock = sap.ui.core.Popup.Dock;
				var oConceptMenu = new sap.ui.unified.Menu({
					items : [ new sap.ui.unified.MenuItem({
						text : 'DELETE',
						icon : sap.ui.core.IconPool.getIconURI("delete")
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
				oConceptMenu.attachItemSelect(function(oEvent) {
					// TODO self not safe
					var selectedItem = oEvent.getParameter("item").getText();
					if (selectedItem == 'DELETE') {
						me.fireDeleted();
					} else {
						me.getAggregation("_objectPropertyFilter").setText(selectedItem);
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}).addStyleClass("menuLink") );
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_objectPropertyFilter"));
	}
});