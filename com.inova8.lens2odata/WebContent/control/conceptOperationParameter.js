jQuery.sap.require("sap.ui.commons.ListBox");
jQuery.sap.require("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.ux3.ToolPopup");
jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("control.extendFilter");
jQuery.sap.require("control.operationParameterMenu");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.conceptOperationParameter", {
		metadata : {
			aggregations : {
				_conceptOperationParameterLabel : {
					type : "sap.m.Label",
					multiple : false
				},
				_conceptOperationParameterHelp : {
					type : "control.operationParameterMenu",
					multiple : false
				},
				_conceptOperationParameter : {
					type : "sap.ui.base.Object",
					multiple : false,
					bindable : true
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
			self.setAggregation("_conceptOperationParameterHelp", new control.operationParameterMenu());
			self.oConceptOperationParameterLabel = new sap.m.Label({
				text : '{queryModel>name}'

			});
			self.setAggregation("_conceptOperationParameterLabel", self.oConceptOperationParameterLabel)
			self.oConceptOperationParameterLink = new sap.m.Link({
				text : '{queryModel>value}'
			});
			self.oConceptOperationParameterLink.addStyleClass("menuLink");

			self.setAggregation("_conceptOperationParameter", self.oConceptOperationParameterLink)
		},
		_initOperationParameter : function(oOperationParameter) {
			var self = this;
			var oInputValue = null
			var sPathPattern = /{(.*)}/;

			switch (oOperationParameter.type) {
			case "Edm.Date":
				oInputValue = (new control.datePicker({
					valueFormat : 'yyyy-MM-ddThh:mm:ssXX',
					tooltip : "{i18n>dataFilterTooltip}",
					width : "150px",
					placeholder : "Enter date",
					editable : true,
					valueHelpRequest : function(oEvent) {
						self.getAggregation("_conceptOperationParameterHelp").open();
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
						self.getAggregation("_conceptOperationParameterHelp").open();
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
						self.getAggregation("_conceptOperationParameterHelp").open();
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
						self.getAggregation("_conceptOperationParameterHelp").oParameterPanel.bindElement("queryModel>" + self.getBindingContext("queryModel").getPath());
						self.getAggregation("_conceptOperationParameterHelp").open();
					}
				})).addStyleClass("dataPropertyValue");

			}
			// Check if a value or a parameter path
			if (sPathPattern.test(oOperationParameter.value)) {
				var sParam = sPathPattern.exec(oOperationParameter.value)[1];
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
			var oOperationParameter = oControl.getBindingContext("queryModel").getProperty("");
			oRm.renderControl(oControl.getAggregation("_conceptOperationParameterLabel"));
			oRm.write("&nbsp;");
			oRm.write(sap.ui.getCore().getModel("i18nModel").getProperty("conceptOperationParameters.equals"));
			oRm.write("&nbsp;");
			oRm.addClass("sapUiSizeCompact");
			oRm.addClass("dataPropertyValue");
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");
			oControl.setAggregation("_conceptOperationParameter", oControl._initOperationParameter(oOperationParameter));
			oRm.renderControl(oControl.getAggregation("_conceptOperationParameter"));
			oRm.write("</div>");
		}
	});
});