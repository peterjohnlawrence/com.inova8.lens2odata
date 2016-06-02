jQuery.sap.require("sap.m.P13nDialog");
jQuery.sap.require("sap.m.P13nColumnsPanel");
jQuery.sap.require("sap.m.P13nItem");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.addServiceDialog", {
		metadata : {
			properties : {
				entitySet : "object",
				set : "string",
			},
			aggregations : {},
			events : {
				serviceAdded : {
					parameters : {
						service : {
							type : "object"
						},
						query : {
							type : "object"
						}
					}
				}
			}
		},
		open : function() {
			var self = this;
			self.oDialog.open();

		},
		validateReadyToSave : function(self) {
			if (jQuery.isEmptyObject(self.serviceIdElement.getFields()[0].getValue()) || jQuery.isEmptyObject(self.serviceNameElement.getFields()[0].getValue())
					|| jQuery.isEmptyObject(self.serviceUrlElement.getFields()[0].getValue())) {
				self.oDialog.getButtons()[0].setEnabled(false);
			} else {
				self.oDialog.getButtons()[0].setEnabled(true);
			}
		},
		saveService : function(oEvent, self) {
			var serviceId = self.serviceIdElement.getFields()[0].getValue();
			var serviceName = self.serviceNameElement.getFields()[0].getValue();
			var serviceUrl = self.serviceUrlElement.getFields()[0].getValue();
			var lastChar = serviceUrl[serviceUrl.length - 1];
			if ((lastChar != "\\") && (lastChar != "/"))
				serviceUrl += "/";
			var serviceProxy = self.serviceProxyElement.getFields()[0].getSelected();
			var oQueryModelData = sap.ui.getCore().getModel("queryModel").getData();
			var oService = {
				"code" : serviceId,
				"name" : serviceName,
				"version" : "V2",
				"serviceUrl" : serviceUrl,
				"useProxy" : serviceProxy,
				"queries" : []
			};
			// oQueryModelData["services"][serviceId] = oService;
			self.validateService(oService, self);

			return oService;
		},
		validateService : function(service, self) {
			utils.getCachedOdataModel(service, function() {
				sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty('queryForm.serviceInvalid'));
			}, function(oDataModel) {
				oDataModel.getMetaModel().loaded().then(function() {
					var newQueryCode = utils.generateUUID();
					service.queries = {};
					service.queries[newQueryCode] = {
						_class : "Query",
						code : newQueryCode,
						name : "New Query",
						concept : oDataModel.getMetaModel().getODataEntityContainer().entitySet[0].name
					};
					sap.ui.getCore().getModel("queryModel").getData().services[service.code] = service;
					sap.ui.getCore().getModel("queryModel").refresh();
					sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty('queryForm.serviceValid'));
					self.oDialog.close();
					self.fireServiceAdded({
						service : service,
						query : service.queries[newQueryCode]
					});
				});
			})
		},

		init : function(queryContext) {
			var self = this;
			self.serviceIdElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>addServiceDialog.serviceId}",
				fields : [ new sap.m.Input({
					tooltip : "{i18nModel>addServiceDialog.serviceIdPrompt}",
					width : "auto",
					placeholder : "{i18nModel>addServiceDialog.serviceIdPlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : "",
					change : function(oEvent) {
						self.validateReadyToSave(self);
					}
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.serviceNameElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>addServiceDialog.serviceName}",
				fields : [ new sap.m.Input({
					tooltip : "{i18nModel>addServiceDialog.serviceNamePrompt}",
					width : "auto",
					placeholder : "{i18nModel>addServiceDialog.serviceNamePlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : "",
					change : function(oEvent) {
						self.validateReadyToSave(self);
					}
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.serviceUrlElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>addServiceDialog.serviceUrl}",
				fields : [ new sap.m.Input({
					tooltip : "{i18nModel>addServiceDialog.serviceUrlPrompt}",
					type : "Url",
					width : "auto",
					placeholder : "{i18nModel>addServiceDialog.serviceUrlPlaceholder}",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : "",
					change : function(oEvent) {
						self.validateReadyToSave(self);
					}
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			self.serviceProxyElement = new sap.ui.layout.form.FormElement({
				label : "{i18nModel>addServiceDialog.serviceProxy}",
				fields : [ new sap.m.CheckBox({
					tooltip : "{i18nModel>addServiceDialog.serviceProxyPrompt}",
					type : sap.m.InputType.Url,
					width : "auto",
					description : "",
					editable : true,
					showValueHelp : false,
					valueHelpRequest : ""
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
					formElements : [ self.serviceIdElement, self.serviceNameElement, self.serviceUrlElement, self.serviceProxyElement ]
				})

				]
			});
			self.oDialog = new sap.m.Dialog({
				title : "{i18nModel>addServiceDialog.title}",
				buttons : [ new sap.m.Button({
					text : '{i18nModel>addServiceDialog.save}',
					enabled : false,
					press : function(oEvent) {
						var oService = self.saveService(oEvent, self);
						// self.fireEvent("serviceAdded", {
						// service : oService
						// });
					}
				}), new sap.m.Button({
					text : '{i18nModel>addServiceDialog.cancel}',
					press : function(oEvent) {
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