jQuery.sap.require("sap.m.P13nDialog");
jQuery.sap.require("sap.m.P13nColumnsPanel");
jQuery.sap.require("sap.m.P13nItem");

sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.parameterEdit", {
		metadata : {
			properties : {},
			aggregations : {},
			events : {}
		},
		open : function() {
			this.oDialog.open();
		},

		init : function(queryContext) {
			var self = this;
			self.oParameterForm = new sap.ui.layout.form.Form({
				layout : new sap.ui.layout.form.GridLayout({
					singleColumn : false
				}),
				formContainers : [ new sap.ui.layout.form.FormContainer({
					expandable : true,
					formElements : [ new sap.ui.layout.form.FormElement({
						label:"{i18nModel>parameterEdit.parameterName}",
						fields : [ new sap.m.Input({
							value : "{queryModel>name}",
							tooltip : "{i18nModel>parameterEdit.parameterNamePrompt}",
							width : "auto",
							placeholder : "{i18nModel>parameterEdit.parameterNamePlaceholder}",
							description : "",
							editable : true,
							showValueHelp : false,
							valueHelpRequest : ""
						}) ],
						layoutData : new sap.ui.layout.form.GridElementData({
							hCells : "2"
						})
					}), new sap.ui.layout.form.FormElement({
						label : "{i18nModel>parameterEdit.parameterPrompt}",
						fields : [ new sap.m.Input({
							value : "{queryModel>prompt}",
							tooltip : "{i18nModel>parameterEdit.parameterPromptPrompt}",
							width : "auto",
							placeholder : "{i18nModel>parameterEdit.parameterPromptPlaceholder}",
							description : "",
							editable : true,
							showValueHelp : false,
							valueHelpRequest : ""
						}) ],
						layoutData : new sap.ui.layout.form.GridElementData({
							hCells : "2"
						})
					}), new sap.ui.layout.form.FormElement({
						label : "{i18nModel>parameterEdit.parameterType}",
						fields : [ new sap.m.Select({
							selectedKey : "{queryModel>type}",
							tooltip : "{i18nModel>parameterEdit.parameterTypePrompt}",
							width : "auto",
							placeholder : "{i18nModel>parameterEdit.parameterTypePlaceholder}",
							description : "",
							editable : true,
							showValueHelp : false,
							valueHelpRequest : "",
							items : [ new sap.ui.core.Item({
								key : "Edm.String",
								text : "Edm.String"
							}), new sap.ui.core.Item({
								key : "Edm.Decimal",
								text : "Edm.Decimal"
							}), new sap.ui.core.Item({
								key : "Edm.Boolean",
								text : "Edm.Boolean"
							}), new sap.ui.core.Item({
								key : "Edm.DateTime",
								text : "Edm.DateTime"
							}), new sap.ui.core.Item({
								key : "Edm.Time",
								text : "Edm.Time"
							}), new sap.ui.core.Item({
								key : "Edm.DateTimeOffset",
								text : "Edm.DateTimeOffset"
							}), new sap.ui.core.Item({
								key : "Edm.Double",
								text : "Edm.Double"
							}), new sap.ui.core.Item({
								key : "Edm.Float",
								text : "Edm.Float"
							}), new sap.ui.core.Item({
								key : "Edm.Binary",
								text : "Edm.Binary"
							}), new sap.ui.core.Item({
								key : "Edm.Guid",
								text : "Edm.Guid"
							}), new sap.ui.core.Item({
								key : "Edm.Byte",
								text : "Edm.Byte"
							}), new sap.ui.core.Item({
								key : "Edm.Int16",
								text : "Edm.Int16"
							}), new sap.ui.core.Item({
								key : "Edm.Int32",
								text : "Edm.Int32"
							}), new sap.ui.core.Item({
								key : "Edm.Int64",
								text : "Edm.Int64"
							}), new sap.ui.core.Item({
								key : "Edm.SByte",
								text : "Edm.SByte"
							}) ]
						}) ],
						layoutData : new sap.ui.layout.form.GridElementData({
							hCells : "2"
						})
					}) ]
				}) ]
			});
			self.oDialog = new sap.m.Dialog({
				title : "{i18nModel>parameterEdit.title}",
				buttons : [ new sap.m.Button({
					text : '{i18nModel>parameterEdit.saveChanges}',
					press : function() {
						sap.ui.getCore().getModel("queryModel").refresh();
						self.oDialog.close();
					}
				}), new sap.m.Button({
					text : '{i18nModel>parameterEdit.cancel}',
					press : function(oEvent) {
						sap.ui.getCore().getModel("queryModel").refresh();
						var sPath = self.oParameterForm.getBindingContext("queryModel").getPath().split("/");
						var element = sPath.pop();
						sap.ui.getCore().getModel("queryModel").getObject(sPath.join("/")).splice(element, 1);
						sap.ui.getCore().getModel("queryModel").refresh();
						self.oDialog.close();
					}
				}) ]
			});
			self.oParameterPanel = new sap.m.Panel();
			self.oParameterPanel.addContent(self.oParameterForm);
			self.oDialog.addContent(self.oParameterPanel);

		},
		renderer : function(oRm, oControl) {
		}
	});
});