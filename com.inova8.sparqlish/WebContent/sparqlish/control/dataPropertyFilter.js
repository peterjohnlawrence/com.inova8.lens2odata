jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("sap.m.Input");
jQuery.sap.require("sap.m.P13nDialog");
jQuery.sap.require("sap.m.P13nFilterPanel");
sap.ui.core.Control.extend("sparqlish.control.dataPropertyFilter", {
	metadata : {
		properties : {
			conjunction : {
				type : "boolean",
				defaultValue : false
			}
		},
		aggregations : {
			_condition : {
				type : "sap.m.Link",
				multiple : false
			},
			_value : {
				type : "sap.m.Input",
				multiple : false
			}
		},
		events : {
			dataPropertyFilterDeleted : {
				enablePreventDefault : true
			}
		}
	},
	init : function() {
		var self = this;
		self.setAggregation("_condition", new sap.m.Link({
			text : "{queryModel>condition}",
			tooltip : "Select a condition",
			press : function(oEvent) {
				var me = oEvent.getSource().getParent();
				var oClauseContext = self._clauseContext(me);
				this.oDataPropertyType = oClauseContext.getDataProperty().type;

				// ***Start of P13n definition
				self.oFilterPanel = new sap.m.P13nFilterPanel({
					filterItems : {
						path : "datatypesModel>/datatypes/" + this.oDataPropertyType + "/conditions",
						template : new sap.m.P13nFilterItem({
							columnKey : "{entityTypeModel>name}",
							operation : "{datatypesModel>condition}",
							value1 : "",
							value2 : "",
							text : "{entityTypeModel>name}"
						})
					}
				});
				self.oDialog = new sap.m.P13nDialog({
					title : "{i18nModel>editDataPropertyFilterTitle}",
					cancel : function() {
						self.oDialog.close();
					},
					ok : function(oEvent) {
						// TODO is this the correct order?
						self.oDialog.close();
						switch (self.oDialog.indexOfPanel(self.oDialog.getVisiblePanel())) {
						}
					}
				});
				self.oDialog.addPanel(self.oFilterPanel);
				if (self.oDialog.isOpen()) {
					self.oDialog.close();
				} else {
					self.oDialog.open();
				}
				// self.oDialog.setModel(self.oEntityTypeModel, "datatypesModel");

				// ***After this is a 'traditional' menu
				var eDock = sap.ui.core.Popup.Dock;
				var oConditionMenu = new sap.ui.unified.Menu({
					items : {
						path : "datatypesModel>/datatypes/" + this.oDataPropertyType + "/conditions",
						template : new sap.ui.unified.MenuItem({
							text : "{datatypesModel>condition}"
						})
					}
				});
				if (!me.getConjunction()) {
					oConditionMenu.addItem(new sap.ui.unified.MenuItem({
						text : '{i18nModel>dataPropertyFilterDELETE}',
						icon : sap.ui.core.IconPool.getIconURI("delete")
					}));
				}
				oConditionMenu.attachItemSelect(function(oEvent) {
					var selectedItem = oEvent.getParameter("item").getText();
					if (selectedItem == 'DELETE') {
						me.fireDataPropertyFilterDeleted();
					} else {
						me.getAggregation("_condition").setText(selectedItem);
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
				// ***Until here
			}
		}).addStyleClass("menuLink"));
		self.setAggregation("_value", new sap.m.Input({
			value : "{queryModel>value}",
			tooltip : "Enter value for condition",
			width : "auto",
			placeholder : "Enter value for condition",
			description : "",
			editable : true
		}).addStyleClass("dataPropertyValue")
		// .attachChange(function(oEvent) {
		// oEvent.getSource().setWidth(oEvent.getSource().getValue().length*15 + "px");
		// })
		);
	},
	_clauseContext : function(me) {
		var oClauseContext = me.getParent().getParent();
		if (oClauseContext.getMetadata()._sClassName != "sparqlish.control.propertyClause") {
			oClauseContext = oClauseContext.getParent();
		}
		return oClauseContext;
	},
	renderer : function(oRm, oControl) {

		var oDataPropertyFilter = oControl.getModel("queryModel").getProperty("", oControl.getBindingContext("queryModel"));
		if (!jQuery.isEmptyObject(oDataPropertyFilter)) {
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

			oRm.addClass("sapUiSizeCompact");
			oRm.addClass("dataPropertyValue");
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_value"));
			oRm.write("</div>");
		}
	}
});