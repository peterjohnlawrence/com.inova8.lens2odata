jQuery.sap.require("sap.m.P13nDialog");
jQuery.sap.require("sap.m.P13nColumnsPanel");
jQuery.sap.require("sap.m.P13nItem");
jQuery.sap.require("control.addPageDialog");
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
			self.oAssociationSetsModel = new sap.ui.model.json.JSONModel(self.getModel("metaModel").getODataAssociationSetsForToEnd(
					self.getQueryContext().getProperty("concept")));
			self.setModel(self.oAssociationSetsModel, "associationSetsModel");
			sap.ui.getCore().setModel(self.oAssociationSetsModel, "associationSetsModel");

			self.oPositionsModel = new sap.ui.model.json.JSONModel(utils.getTemplatePositions(self.getModel("lensesModel").getProperty("/templates/1R2C-1R")));
			self.setModel(self.oPositionsModel, "positionsModel");
			sap.ui.getCore().setModel(self.oPositionsModel, "positionsModel");

			self.pinQueryContextElement.getFields()[0].setValue(self.getQueryContext().getPath());
			self.pinConceptElement.getFields()[0].setValue(self.getQueryContext().getProperty("concept"));
			self.onConceptChange(null, self);

			self.pinNavigationPropertyElement.getFields()[0].bindAggregation("items", "associationSetsModel>/", self.pinNavigationPropertyItemTemplate);
			var set = self.pinSetElement.getFields()[0].getSelectedKey();
			self.pinPageElement.getFields()[0]
					.bindAggregation("items", "lensesModel>/lenses/" + self.getEntitySet().entityType + "/" + set, self.pinPageItemTemplate)
			// self.pinTemplateElement.getFields()[0].bindAggregation("items", "lensesModel>/templates",
			// self.pinTemplateItemTemplate);

			self.pinPositionElement.getFields()[0].bindAggregation("items", "positionsModel>/", self.pinPositionItemTemplate);
			self.oDialog.open();

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
					.setSelectedKey().fireEvent("change");
		},
		onPageChange : function(oEvent, self) {
			var oEntitySet = self.getEntitySet();
			var set = self.pinSetElement.getFields()[0].getSelectedKey();
			var page = self.pinPageElement.getFields()[0].getSelectedKey();
			if (!jQuery.isEmptyObject(page)) {
				self.pinPageTitleElement.getFields()[0].setValue(self.getModel("lensesModel").getProperty(
						"/lenses/" + oEntitySet.entityType + "/" + set + "/" + page + "/title"));
				self.pinTemplateElement.getFields()[0].setValue(self.getModel("lensesModel").getProperty(
						"/lenses/" + oEntitySet.entityType + "/" + set + "/" + page + "/template"));

				self.onTemplateChange(oEvent, self);
			}
		},
		onTemplateChange : function(oEvent, self) {
			var template = self.pinTemplateElement.getFields()[0].getValue();
			if (!jQuery.isEmptyObject(template)) {
				var positions = utils.getTemplatePositions(self.getModel("lensesModel").getProperty("/templates/" + template));
				self.getModel("positionsModel").setData(positions);
				self.pinPositionElement.getFields()[0].bindAggregation("items", "positionsModel>/", self.pinPositionItemTemplate).setSelectedKey("");
			}
		},
		onPositionChange : function(oEvent, self) {

		},
		init : function(queryContext) {
			var self = this;
			self.pinQueryContextElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>pinDialog.queryContext}",
				fields : [ new sap.m.Input({
					tooltip : "{i18nModel>pinDialog.queryContextPrompt}",
					width : "auto",
					placeholder : "{i18nModel>pinDialog.queryContextPlaceholder}",
					description : "",
					editable : false,
					showValueHelp : false,
					valueHelpRequest : ""
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});			
			self.pinConceptElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>pinDialog.concept}",
				fields : [ new sap.m.Input({
					tooltip : "{i18nModel>pinDialog.conceptPrompt}",
					width : "auto",
					placeholder : "{i18nModel>pinDialog.conceptPlaceholder}",
					description : "",
					editable : false,
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
					icon : sap.ui.core.IconPool.getIconURI("add"),
					press : function(oEvent) {
						var addPageDialog = new control.addPageDialog();
						addPageDialog.setModel(sap.ui.getCore().getModel("lensesModel"),"lensesModel");
						addPageDialog.open();
					}
				}))
				// .addButton(new sap.m.Button({
				// text : "{i18nModel>pinDialog.pageDelete}",
				// icon : sap.ui.core.IconPool.getIconURI("delete")
				// }))
				],
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
					editable : false,
					showValueHelp : false,
					valueHelpRequest : ""
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});

			self.pinTemplateElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>pinDialog.template}",
				fields : [ new sap.m.Input({
					tooltip : "{i18nModel>pinDialog.templatePrompt}",
					width : "auto",
					placeholder : "{i18nModel>pinDialog.templatePlaceholder}",
					description : "",
					editable : false,
					showValueHelp : false,
					valueHelpRequest : ""
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});

			self.pinPositionItemTemplate = new sap.ui.core.Item({
				key : '{positionsModel>}',
				text : '{positionsModel>}'
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
						self.onPositionChange(oEvent, self);
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
					title : "What",
					expandable : false,
					formElements : [self.pinQueryContextElement,  self.pinConceptElement, self.pinNavigationPropertyElement, self.pinSetElement ]
				}), new sap.ui.layout.form.FormContainer({
					title : "Where",
					expandable : false,
					formElements : [ self.pinPageElement, self.pinPageTitleElement, self.pinTemplateElement, self.pinPositionElement ]
				}), new sap.ui.layout.form.FormContainer({
					title : "How",
					expandable : false,
					formElements : [ self.pinFragmentTypeElement, self.pinFragmentTitleElement ]
				}),

				]
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