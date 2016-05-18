jQuery.sap.require("sap.m.P13nDialog");
jQuery.sap.require("sap.m.P13nColumnsPanel");
jQuery.sap.require("sap.m.P13nItem");
jQuery.sap.require("sap.m.MessageBox");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.fragmentDialog", {
		metadata : {
			properties : {
				template : "string",
				fragment : "object"
			},
			aggregations : {},
			events : {}
		},
		open : function() {
			var self = this;
			self.oPositionsModel = new sap.ui.model.json.JSONModel(utils.getTemplatePositions(self.getModel("lensesModel").getProperty(
					"/templates/" + self.getProperty("template"))));
			self.setModel(self.oPositionsModel, "positionsModel");
			sap.ui.getCore().setModel(self.oPositionsModel, "positionsModel");
			self.fragmentPositionElement.getFields()[0].bindProperty("value", "lensesModel>" + self.getBindingContext("lensesModel").getPath() + "/position");
			self.fragmentPositionElement.getFields()[0].bindAggregation("items", "positionsModel>/", self.fragmentPositionItemTemplate);
			self.fragmentTypeElement.getFields()[0].bindProperty("value", "lensesModel>" + self.getBindingContext("lensesModel").getPath() + "/type");
			self.fragmentTitleElement.getFields()[0].bindProperty("value", "lensesModel>" + self.getBindingContext("lensesModel").getPath() + "/title");
			self.fragmentQueryElement.getFields()[0].bindProperty("value", "lensesModel>" + self.getBindingContext("lensesModel").getPath() + "/query");
			self.fragmentQueryContextElement.getFields()[0].bindProperty("text", "lensesModel>" + self.getBindingContext("lensesModel").getPath() + "/queryContext");
			self.oDialog.open();
		},
		init : function(queryContext) {
			var self = this;
			self.fragmentPositionItemTemplate = new sap.ui.core.Item({
				key : '{positionsModel>}',
				text : '{positionsModel>}'
			});
			self.fragmentPositionElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>fragmentDialog.position}",
				fields : [ new sap.m.ComboBox({
					tooltip : "{i18nModel>fragmentDialog.positionPrompt}",
					width : "auto",
					placeholder : "{i18nModel>fragmentDialog.positionPlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : "",
					forceSelection : true,
					change : function(oEvent) {
						self.onPositionChange(oEvent, self);
					}
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.fragmentTypeElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>fragmentDialog.fragmentType}",
				fields : [ new sap.m.ComboBox({
					tooltip : "{i18nModel>fragmentDialog.fragmentTypePrompt}",
					width : "auto",
					placeholder : "{i18nModel>fragmentDialog.fragmentTypePlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : "",
					items : [ new sap.ui.core.Item({
						key : "Components.lensResultsForm",
						text : "Components.lensResultsForm"
					}), new sap.ui.core.Item({
						key : "Components.lensResultsTable",
						text : "Components.lensResultsTable"
					}) ]
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});

			self.fragmentTitleElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>fragmentDialog.fragmentTitle}",
				fields : [ new sap.m.Input({
					tooltip : "{i18nModel>fragmentDialog.fragmentTitlePrompt}",
					width : "auto",
					placeholder : "{i18nModel>fragmentDialog.fragmentTitlePlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : ""
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.fragmentQueryElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>fragmentDialog.fragmentQuery}",
				fields : [ new sap.m.Input({
					tooltip : "{i18nModel>fragmentDialog.fragmentQueryPrompt}",
					width : "auto",
					placeholder : "{i18nModel>fragmentDialog.fragmentQueryPlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : ""
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.fragmentQueryContextElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>fragmentDialog.fragmentQueryContext}",
				fields : [ new sap.m.Link({
					tooltip : "{i18nModel>fragmentDialog.fragmentQueryContextPrompt}",
					width : "auto",
					description : "",
					editable : false,
					showValueHelp : false,
					valueHelpRequest : "",
					press : function(oEvent) {
						sap.m.URLHelper.redirect((oEvent.getSource().getText()).replace("/services/", ".."+ document.location.pathname +"#/").replace("/queries/", "/query/"));
					}
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.oForm = new sap.ui.layout.form.Form({
				layout : new sap.ui.layout.form.GridLayout({
					singleColumn : false
				}),
				formContainers : [
						new sap.ui.layout.form.FormContainer({
							expandable : false,
							formElements : [ self.fragmentPositionElement, self.fragmentTypeElement, self.fragmentTitleElement, self.fragmentQueryElement,
									self.fragmentQueryContextElement ]
						}), ]
			});
			self.oDialog = new sap.m.Dialog({
				title : "{i18nModel>fragmentDialog.title}",
				buttons : [ new sap.m.Button({
					text : '{i18nModel>fragmentDialog.delete}',
					press : function() {
						sap.m.MessageBox.confirm("Remove fragment", {
							onClose : function(oAction) {
								if (oAction === sap.m.MessageBox.Action.OK) {
									//This seems very complex to remove an element of the array
									var path = self.getBindingContext("lensesModel").getPath().split("/");
									var index = path.pop();
									var newpath = path.join("/");
									var fragments = self.getBindingContext("lensesModel").getModel().getProperty(newpath);
									fragments.splice(index, 1);
									self.getBindingContext("lensesModel").getModel().setProperty(newpath, fragments);
								}
								self.oDialog.close();
							}
						});
					}
				}), new sap.m.Button({
					text : '{i18nModel>fragmentDialog.close}',
					press : function() {
						self.oDialog.close();
					}
				}) ]
			});
			self.oPanel = new sap.m.Panel();
			self.oPanel.addContent(self.oForm);
			self.oDialog.addContent(self.oPanel);

		},
		renderer : function(oRm, oControl) {
		}
	});
});