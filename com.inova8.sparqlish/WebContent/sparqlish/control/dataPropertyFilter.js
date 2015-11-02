jQuery.sap.require("sap.ui.core.IconPool");
sap.ui.core.Control.extend("sparqlish.control.dataPropertyFilter", {
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
			text : "{queryModel>condition}",
			tooltip : "Select a condition",
			press : function(oEvent) {
				var me = oEvent.getSource().getParent();
				var oClauseContext = self._clauseContext(me);

				this.oDataPropertyType = oClauseContext.getDataProperty().type;
				//
				var eDock = sap.ui.core.Popup.Dock;

				var oConditionMenu = new sap.ui.unified.Menu({
					items : {
						path : "datatypesModel>/datatypes/" + this.oDataPropertyType + "/conditions",
						template : new sap.ui.unified.MenuItem({
							text : "{datatypesModel>condition}"
						})
					}
				});
				// TODO Really need to add a delete menu item 
				oConditionMenu.addItem(new sap.ui.unified.MenuItem({
					text : '{i18nModel>dataPropertyFilterDELETE}',
					icon : sap.ui.core.IconPool.getIconURI("delete")
				}));

				oConditionMenu.attachItemSelect(function(oEvent) {
					// var me = oEvent.getSource().getParent();
					var selectedItem = oEvent.getParameter("item").getText();
					if (selectedItem == 'DELETE') {
						me.fireDeleted();
					} else {
						me.getAggregation("_condition").setText(selectedItem);
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}).addStyleClass("menuLink"));
		self.setAggregation("_value", new sap.ui.commons.InPlaceEdit({
			content : new sap.ui.commons.TextField({
				value : "{queryModel>value}",
				tooltip : "Enter value for condition",
				width : "auto"
			}).addStyleClass("dataPropertyValue")
		}));
	},
	_clauseContext : function(me) {
		var oClauseContext = me.getParent().getParent();
		if (oClauseContext.getMetadata()._sClassName != "sparqlish.control.propertyClause") {
			oClauseContext = oClauseContext.getParent();
		}
		return oClauseContext;
	},
	renderer : function(oRm, oControl) {

		if (oControl.getAggregation("_condition").getText() == "[enter condition]") {
			// not yet defined so lets bind to the first concept in collection
			// TODO DELETE is the first condition
			var oClauseContext = oControl._clauseContext(oControl);
			oControl.oDataPropertyType = oClauseContext.getDataProperty().type;
			oControl.getAggregation("_condition").setText(
					oControl.getModel("datatypesModel").getProperty("/datatypes/" + oControl.oDataPropertyType + "/conditions/1/condition"));
		}
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_condition"));
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_value"));
	}
});