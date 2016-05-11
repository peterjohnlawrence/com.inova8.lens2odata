jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("sap.m.Input");
jQuery.sap.require("sap.m.P13nDialog");
jQuery.sap.require("sap.m.P13nFilterPanel");
jQuery.sap.require("control.parameterMenu");
jQuery.sap.require("control.datePicker");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.dataPropertyFilter", {
		metadata : {
			properties : {
				conjunction : {
					type : "boolean",
					defaultValue : false
				}
			},
			aggregations : {
				_operator : {
					type : "sap.m.Link",
					multiple : false
				},
				_parameterValueHelp : {
					type : "control.parameterMenu",
					multiple : false
				},
				_value : {
					type : "sap.ui.base.Object",
					multiple : false,
					bindable : true
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
			self.setAggregation("_parameterValueHelp", new control.parameterMenu());
			self.setAggregation("_operator", new sap.m.Link({
				tooltip : "{i18nModel>dataPropertyFilter.operatorTooltip}",
				press : function(oEvent) {
					var me = oEvent.getSource().getParent();
					var oClauseContext = self._clauseContext(me);
					this.oDataPropertyType = oClauseContext.getDataProperty().type;
					var eDock = sap.ui.core.Popup.Dock;
					var oOperatorMenu = new sap.ui.unified.Menu({
						items : {
							path : "datatypesModel>/datatypes/" + this.oDataPropertyType + "/operators",
							template : new sap.ui.unified.MenuItem({
								text : "{datatypesModel>condition}"
								//TODO No key for a menuItem
								//,		key : "{datatypesModel>operator}"
							})
						}
					});
					// TODO need to add ability to delete filter to drop menu
					// if (!me.getConjunction()) {
					// oConditionMenu.addItem(new sap.ui.unified.MenuItem({
					// text : '{i18nModel>dataPropertyFilterDELETE}',
					// icon : sap.ui.core.IconPool.getIconURI("delete")
					// }));
					// }
					oOperatorMenu.attachItemSelect(function(oEvent) {
						var selectedItem = oEvent.getParameter("item").getText();
						if (selectedItem == 'DELETE') {
							me.fireDataPropertyFilterDeleted();
						} else {
							var oOperators = sap.ui.getCore().getModel("datatypesModel").getProperty("/datatypes/" + me.oDataPropertyType + "/operators/");
							var iIndex = utils.lookupIndex(oOperators, "condition", selectedItem);

							me.getModel("queryModel").setProperty(me.getBindingContext("queryModel").getPath() + "/operator", oOperators[iIndex].operator);
							me.getAggregation("_operator").setText(selectedItem);
						}
					}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
				}
			}).addStyleClass("menuLink"));

		},
		_clauseContext : function(me) {
			var oClauseContext = me.getParent().getParent();
			if (oClauseContext.getMetadata()._sClassName != "control.propertyClause") {
				oClauseContext = oClauseContext.getParent();
			}
			return oClauseContext;
		},
		_initValueInput : function(oDataPropertyFilter) {
			var self = this;
			var oInputValue = null
			var sPathPattern = /{(.*)}/;

			switch (oDataPropertyFilter.type) {
			case "Edm.Date":
				oInputValue = (new control.datePicker({
					valueFormat : 'yyyy-MM-ddThh:mm:ssXX',
					tooltip : "{i18n>dataFilterTooltip}",
					width : "150px",
					placeholder : "Enter date",
					editable : true,
					valueHelpRequest : function(oEvent) {
						self.getAggregation("_parameterValueHelp").open();
					}
				})).addStyleClass("dataPropertyValue");
				break;
			case "Edm.DateTime":
				oInputValue = (new control.datePicker({
					valueFormat : 'yyyy-MM-ddThh:mm:ssXX',
					tooltip : "Enter date/time",
					width : "150px",
					placeholder : "Enter date/time",
					editable : true,
					valueHelpRequest : function(oEvent) {
						self.getAggregation("_parameterValueHelp").open();
					}
				})).addStyleClass("dataPropertyValue");
				break;
			case "Edm.Time":
				oInputValue = (new sap.m.TimePicker({
					valueFormat : 'yyyy-MM-ddThh:mm:ssXX',
					tooltip : "{i18n>dataFilterTooltip}",
					width : "150px",
					placeholder : "Enter time",
					description : "",
					editable : true,
					showValueHelp : true,
					valueHelpRequest : ""
				})).addStyleClass("dataPropertyValue");
				break;
			case "Edm.Decimal":
			case "Edm.Double":
			case "Edm.Single":
			case "Edm.Int16":
			case "Edm.Int32":
			case "Edm.Int64":
				oInputValue = (new sap.m.Input({
					type : sap.m.InputType.Number,
					tooltip : "{i18n>dataFilterTooltip}",
					width : "150px",
					description : "",
					editable : true,
					showValueHelp : true,
					valueHelpRequest : function(oEvent) {
						self.getAggregation("_parameterValueHelp").open();
					}
				})).addStyleClass("dataPropertyValue");
				break;
			default:
				oInputValue = (new sap.m.Input({
					tooltip : "{i18n>dataFilterTooltip}",
					width : "150px",
					placeholder : "Enter value for operator",
					description : "",
					editable : true,
					showValueHelp : true,
					valueHelpRequest : function(oEvent) {
						self.getAggregation("_parameterValueHelp").oParameterPanel.bindElement("queryModel>" + self.getBindingContext("queryModel").getPath());
						self.getAggregation("_parameterValueHelp").open();
					}
				})).addStyleClass("dataPropertyValue");

			}
			// Check if a value or a parameter path
			if (sPathPattern.test(oDataPropertyFilter.value)) {
				var sParam = sPathPattern.exec(oDataPropertyFilter.value)[1];
				var oParameters = this.getModel("queryModel").getData().parameters;
				for (var i = 0; oParameters.length; i++) {
					if ((oParameters[i].name == sParam)) {
						oInputValue.bindProperty("value", "queryModel>/parameters/" + i + "/defaultValue")
						return oInputValue;
					}
				}
			} else {
				oInputValue.bindProperty("value", "queryModel>value")
				return oInputValue;
			}
		},
		renderer : function(oRm, oControl) {
			var oDataPropertyFilter = oControl.getBindingContext("queryModel").getProperty("");
			// var oDataPropertyFilter = oControl.getModel("queryModel").getProperty("",
			// oControl.getBindingContext("queryModel"));
			if (!jQuery.isEmptyObject(oDataPropertyFilter)) {
				var oClauseContext = oControl._clauseContext(oControl);
				oControl.oDataPropertyType = oClauseContext.getDataProperty().type;
				if (oDataPropertyFilter.operator == "[enter operator]") {
					// not yet defined so lets bind to the first concept in collection
					// TODO DELETE is the first operator
					oControl.getAggregation("_operator").setText(
							sap.ui.getCore().getModel("datatypesModel").getProperty("/datatypes/" + oControl.oDataPropertyType + "/operators/1/condition"));
				} else {
					var oOperators = sap.ui.getCore().getModel("datatypesModel").getProperty("/datatypes/" + oControl.oDataPropertyType + "/operators/");
					var iIndex = utils.lookupIndex(oOperators, "operator", oDataPropertyFilter.operator);
					oControl.getAggregation("_operator").setText(oOperators[iIndex].condition);
				}
				oRm.write("&nbsp;");
				oRm.renderControl(oControl.getAggregation("_operator"));
				oRm.write("&nbsp;")
				oRm.addClass("sapUiSizeCompact");
				oRm.addClass("dataPropertyValue");
				oRm.write("<div ");
				oRm.writeControlData(oControl);
				oRm.writeClasses();
				oRm.write(">");
				oControl.setAggregation("_value", oControl._initValueInput(oDataPropertyFilter));
				oRm.renderControl(oControl.getAggregation("_value"));
				oRm.write("</div>");
			}
		}
	});
});