jQuery.sap.require("sap.m.P13nDialog");
jQuery.sap.require("sap.m.P13nColumnsPanel");
jQuery.sap.require("sap.m.P13nItem");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.addPageDialog", {
		metadata : {
			properties : {},
			aggregations : {},
			events : {}
		},
		open : function() {
			var self = this;
			self.pageElement.getFields()[0].bindAggregation("items", "lensesModel>/pages/", self.pageItemTemplate);
			self.templateElement.getFields()[0].bindAggregation("items", "lensesModel>/templates/", self.templateItemTemplate);
			self.oDialog.open();

		},

		init : function(queryContext) {
			var self = this;
			self.pageItemTemplate = new sap.ui.core.Item({
				key : '{lensesModel>title}',
				text : '{lensesModel>title}'
			});
			self.pageElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>addPageDialog.page}",
				fields : [ new sap.m.ActionSelect({
					tooltip : "{i18nModel>addPageDialog.pagePrompt}",
					width : "auto",
					placeholder : "{i18nModel>addPageDialog.pagePlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : "",
					forceSelection : true,
					change : function(oEvent) {
						// self.onPageChange(oEvent, self);
					}
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.pageTitleElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>addPageDialog.pageTitle}",
				fields : [ new sap.m.Input({
					tooltip : "{i18nModel>addPageDialog.pageTitlePrompt}",
					width : "auto",
					placeholder : "{i18nModel>addPageDialog.pageTitlePlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : ""
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.templateItemTemplate = new sap.ui.core.Item({
				key : '{lensesModel>template}',
				text : '{lensesModel>template}'
			});
			self.templateElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>addPageDialog.template}",
				fields : [ new sap.m.ActionSelect({
					tooltip : "{i18nModel>addPageDialog.templatePrompt}",
					width : "auto",
					placeholder : "{i18nModel>addPageDialog.templatePlaceholder}",
					description : "",
					editable : false,
					showValueHelp : false,
					valueHelpRequest : "",
					forceSelection : true
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});

			self.oForm = new sap.ui.layout.form.Form({
				layout : new sap.ui.layout.form.GridLayout({
					singleColumn : false
				}),
				formContainers : [ new sap.ui.layout.form.FormContainer({
					expandable : false,
					formElements : [ self.pageElement, self.pageTitleElement, self.templateElement ]
				})

				]
			});
			self.oDialog = new sap.m.Dialog({
				title : "{i18nModel>addPageDialog.title}",
				buttons : [ new sap.m.Button({
					text : '{i18nModel>addPageDialog.save}',
					press : function() {
					}
				}), new sap.m.Button({
					text : '{i18nModel>addPageDialog.cancel}',
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