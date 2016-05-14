jQuery.sap.require("sap.m.P13nDialog");
jQuery.sap.require("sap.m.P13nColumnsPanel");
jQuery.sap.require("sap.m.P13nItem");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.pinDialog", {
		metadata : {
			properties : {
				queryContext : {
					type : "object"
				}
			},
			aggregations : {},
			events : {}
		},
		open : function() {
			var self = this;
			self.pinConceptElement.getFields()[0].setText(self.getQueryContext().getProperty("concept"));
			self.onConceptChange(null, self);
			self.oAssociationSetsModel = new sap.ui.model.json.JSONModel(self.getModel("metaModel").getODataAssociationSetsForToEnd(
					self.getQueryContext().getProperty("concept")));
			self.setModel(self.oAssociationSetsModel, "associationSetsModel");
			sap.ui.getCore().setModel(self.oAssociationSetsModel, "associationSetsModel");
			self.pinNavigationPropertyElement.getFields()[0].bindAggregation("items", "associationSetsModel>/", self.pinNavigationPropertyItemTemplate);
			self.oDialog.open();
			// var oLensModelData = sap.ui.getCore().getModel("lensesModel").getData();
			// var concept = oQueryContext.getProperty("concept");
			// var assocationSets = self.getModel("odataModel").getMetaModel().getODataAssociationSetsForToEnd(concept);
		},
		setQueryContext : function(oQueryContext) {
			var self = this;
			self.setProperty("queryContext", oQueryContext);
		},
		getEntitySet : function() {
			return this.getModel("metaModel").getODataEntitySet(this.getQueryContext().getProperty("concept"));
		},
		getLensPages : function(entityType) {
			var self = this;
			var oLensModelData = sap.ui.getCore().getModel("lensesModel").getData();
			return oLensModelData["lenses"][entityType]["entity"];
		},
		onConceptChange : function(oEvent, self) {
			self.pinSetElement.getFields()[0].setSelectedKey("").fireEvent("change");
		},
		onNavigationPropertyChange : function(oEvent, self) {
			self.pinSetElement.getFields()[0].setSelectedKey("").fireEvent("change");
		},
		onSetChange : function(oEvent, self) {
			var oEntitySet = self.getEntitySet();
			var set = self.pinSetElement.getFields()[0].getSelectedKey();
			self.pinPageElement.getFields()[0].bindAggregation("items", "lensesModel>/lenses/" + oEntitySet.entityType + "/" + set, self.pinPageItemTemplate)
					.setSelectedKey("").fireEvent("change");
		},
		onPageChange : function(oEvent, self) {
			var oEntitySet = self.getEntitySet();
			var set = self.pinSetElement.getFields()[0].getSelectedKey();
			var page = self.pinPageElement.getFields()[0].getSelectedKey();
			self.pinPageTitleElement.getFields()[0].bindElement("value","lensesModel>/lenses/" + oEntitySet.entityType + "/" + set + "/" + page +"/title" );
			self.pinPositionElement.getFields()[0].bindAggregation("items", "lensesModel>/lenses/" + oEntitySet.entityType + "/" + set + "/" + page + "/fragments",
					self.pinPositionItemTemplate).setSelectedKey("");
		},
		init : function(queryContext) {
			var self = this;
			self.pinConceptElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>pinDialog.concept}",
				fields : [ new sap.m.Label({
					tooltip : "{i18nModel>pinDialog.conceptPrompt}",
					width : "auto",
					placeholder : "{i18nModel>pinDialog.conceptPlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : "",
					change : function(oEvent) {
						self.onConceptChange(oEvent, self)
					}
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.pinNavigationPropertyItemTemplate = new sap.ui.core.Item({
				key : '{associationSetsModel>association}',
				text : '{= ${associationSetsModel>end/0/entitySet} +"/"+ ${associationSetsModel>association}}'
			});
			self.pinNavigationPropertyElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>pinDialog.navigationProperty}",
				fields : [ new sap.m.ActionSelect({
					tooltip : "{i18nModel>pinDialog.navigationPropertyPrompt}",
					width : "auto",
					placeholder : "{i18nModel>pinDialog.navigationPropertyPlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : "",
					change : function(oEvent) {
						self.onNavigationPropertyChange(oEvent, self)
					}
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.pinSetElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>pinDialog.set}",
				fields : [ new sap.m.ActionSelect({
					tooltip : "{i18nModel>pinDialog.setPrompt}",
					width : "auto",
					placeholder : "{i18nModel>pinDialog.setPlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : "",
					forceSelection : true,
					items : [ new sap.ui.core.Item({
						key : "entity",
						text : "entity"
					}), new sap.ui.core.Item({
						key : "entitySet",
						text : "entitySet"
					}) ],
					change : function(oEvent) {
						self.onSetChange(oEvent, self)
					}
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.pinPageItemTemplate = new sap.ui.core.Item({
				key : '{lensesModel>page}',
				text : '{lensesModel>page}'
			});
			self.pinPageElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>pinDialog.page}",
				fields : [ new sap.m.ActionSelect({
					tooltip : "{i18nModel>pinDialog.pagePrompt}",
					width : "auto",
					placeholder : "{i18nModel>pinDialog.pagePlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : "",
					forceSelection : true,
					change : function(oEvent) {
						self.onPageChange(oEvent, self);
					}
				}).addButton(new sap.m.Button({
					text : "{i18nModel>pinDialog.pageAdd}",
					icon : sap.ui.core.IconPool.getIconURI("add")
				})).addButton(new sap.m.Button({
					text : "{i18nModel>pinDialog.pageDelete}",
					icon : sap.ui.core.IconPool.getIconURI("delete")
				})) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.pinPageTitleElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>pinDialog.pageTitle}",
				fields : [ new sap.m.Input({
					tooltip : "{i18nModel>pinDialog.pageTitlePrompt}",
					width : "auto",
					placeholder : "{i18nModel>pinDialog.pageTitlePlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : ""
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.pinPositionItemTemplate = new sap.ui.core.Item({
				key : '{lensesModel>position}',
				text : '{lensesModel>position}'
			});
			self.pinPositionElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>pinDialog.position}",
				fields : [ new sap.m.ActionSelect({
					tooltip : "{i18nModel>pinDialog.positionPrompt}",
					width : "auto",
					placeholder : "{i18nModel>pinDialog.positionPlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : "",
					forceSelection : true,
					change : function(oEvent) {
						// self.onPositionChange(oEvent, self);
					}
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.pinFragmentTypeElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>pinDialog.fragmentType}",
				fields : [ new sap.m.Select({
					tooltip : "{i18nModel>pinDialog.fragmentTypePrompt}",
					width : "auto",
					placeholder : "{i18nModel>pinDialog.fragmentTypePlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : "",
					items : [ new sap.ui.core.Item({
						key : "Components.lensResultsForm",
						text : "Form"
					}), new sap.ui.core.Item({
						key : "Components.lensResultsTable",
						text : "Table"
					}) ]
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});

			self.pinFragmentTitleElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>pinDialog.fragmentTitle}",
				fields : [ new sap.m.Input({
					tooltip : "{i18nModel>pinDialog.fragmentTitlePrompt}",
					width : "auto",
					placeholder : "{i18nModel>pinDialog.fragmentTitlePlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : ""
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.oPinForm = new sap.ui.layout.form.Form({
				layout : new sap.ui.layout.form.GridLayout({
					singleColumn : false
				}),
				formContainers : [ new sap.ui.layout.form.FormContainer({
					expandable : true,
					formElements : [ self.pinConceptElement, self.pinNavigationPropertyElement, self.pinSetElement, self.pinPageElement, self.pinPageTitleElement,self.pinPositionElement,
							self.pinFragmentTypeElement, self.pinFragmentTitleElement ]
				}) ]
			});
			self.oDialog = new sap.m.Dialog({
				title : "{i18nModel>pinDialog.title}",
				buttons : [ new sap.m.Button({
					text : '{i18nModel>pinDialog.pinFragment}',
					press : function() {
					}
				}), new sap.m.Button({
					text : '{i18nModel>pinDialog.cancel}',
					press : function() {
						self.oDialog.close();
					}
				}) ]
			});
			self.oPinPanel = new sap.m.Panel();
			self.oPinPanel.addContent(self.oPinForm);
			self.oDialog.addContent(self.oPinPanel);

		},
		renderer : function(oRm, oControl) {
		}
	});
});