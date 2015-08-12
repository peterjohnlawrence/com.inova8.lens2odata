jQuery.sap.require("sap.ui.core.IconPool");
sap.ui.core.Control.extend("sparqlish.control.conceptFilterControl", {
	metadata : {
		aggregations : {
			_conceptFilter : {
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
		self.setAggregation("_conceptFilter", new sap.ui.commons.Link({
			//TODO Only allows for a single valued primary key
		//	text : '{= "{queryModel>" + ${entityTypeModel>/key/propertyRef/0/name}+"}"}',
		//	text :{ path : "='queryModel>'+${entityTypeModel>/key/propertyRef/0/name}" },
		//text :{ path : '="queryModel>" + ${entityTypeModel>/key/propertyRef/0/name}' },
		//text :"{='{queryModel>' + ${entityTypeModel>/key/propertyRef/0/name} +'}'}",
		//	text : "{queryModel>OrderID}",
		text :{ path : 'queryModel>OrderID' },
			tooltip : "Select a value",
			press : function(oEvent) {
				var me = oEvent.getSource().getParent();
				var eDock = sap.ui.core.Popup.Dock;
				var oConceptMenu = new sap.ui.unified.Menu({
					items : [ new sap.ui.unified.MenuItem({
						text : 'DELETE',
						icon : sap.ui.core.IconPool.getIconURI("delete")
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
					if (selectedItem == 'DELETE') {
						me.fireDeleted();
					} else {
						me.getAggregation("_conceptFilter").setText(selectedItem);
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}));
	},
	renderer : function(oRm, oControl) {
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_conceptFilter"));
	}
});