jQuery.sap.require("sap.m.ActionSelect");
jQuery.sap.require("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("sparqlish.control.parameterDialog");
sap.m.OverflowToolbar.extend("sparqlish.control.serviceQueryMenu", {
	metadata : {
		properties : {
			serviceUrl : {
				type : "string",
				defaultValue : "{i18nModel>selectService}"
			},
			query : {
				type : "string",
				defaultValue : "{i18nModel>selectQuery}"
			},
		},
		aggregations : {
			_toolbar : {
				type : "sap.m.Toolbar",
				multiple : false
			}
		},
		events : {
			serviceChanged : {
				enablePreventDefault : true
			},
			queryChanged : {
				enablePreventDefault : true
			},
			preview : {
				enablePreventDefault : true
			},
			undo : {
				enablePreventDefault : true
			},
			save : {
				enablePreventDefault : true
			}
		}
	},
	init : function() {
		var self = this;
		self.oServiceSelect = new sap.m.ActionSelect({
			tooltip : "{i18nModel>serviceSelectTooltip}",
			items : {
				path : "serviceQueriesModel>/services",
				sorter : {
					path : "serviceQueriesModel>name"
				},
				template : new sap.ui.core.ListItem({
					key : "{serviceQueriesModel>code}",
					text : "{serviceQueriesModel>name}"
				})
			},
			change : function(oEvent) {
				self.oQuerySelect.bindItems({
					path : "serviceQueriesModel>" + oEvent.getParameter("selectedItem").getBindingContext("serviceQueriesModel") + "/queries",
					sorter : {
						path : "serviceQueriesModel>name"
					},
					template : new sap.ui.core.ListItem({
						key : "{serviceQueriesModel>code}",
						text : "{serviceQueriesModel>name}"
					})
				});
				self.oQuerySelect.setSelectedItem(self.oQuerySelect.getFirstItem());
			}
		}).addStyleClass("menuText").attachChange(function(oEvent) {
			self.fireServiceChanged({
				service : self.getModel("serviceQueriesModel").getProperty(self.oServiceSelect.getSelectedItem().getBindingContext("serviceQueriesModel").getPath()),
				query : self.getModel("serviceQueriesModel").getProperty(self.oQuerySelect.getSelectedItem().getBindingContext("serviceQueriesModel").getPath())
			})
		});

		self.oServiceSelect.addButton(new sap.m.Button({
			text : "{i18nModel>queryForm.serviceDelete}",
			icon : sap.ui.core.IconPool.getIconURI("delete"),
			press : function(oEvent) {
				var oServiceDeleteDialog = new sap.m.Dialog({
					title : '{i18nModel>queryForm.serviceDelete}',
					type : 'Message',
					beginButton : new sap.m.Button({
						text : 'Confirm',
						press : function() {
							delete self.getModel("serviceQueriesModel").getData().services[self.oServiceSelect.getSelectedKey()];
							// utils.removeValue(self.getModel("serviceQueriesModel").getData().services,"name",
							// self.oServiceSelect.getSelectedItem().getText());
							self.getModel("serviceQueriesModel").refresh();
							sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("serviceQueriesRemoved"));
							oServiceDeleteDialog.close();
						}
					}),
					endButton : new sap.m.Button({
						text : 'Cancel',
						press : function() {
							oServiceDeleteDialog.close();
						}
					}),
					afterClose : function() {
						oServiceDeleteDialog.destroy();
					}
				});
				oServiceDeleteDialog.open();
			}
		}));
		self.oServiceSelect.addButton(new sap.m.Button({
			text : "{i18nModel>queryForm.serviceAdd}",
			icon : sap.ui.core.IconPool.getIconURI("add"),
			press : function(oEvent) {
				var oServiceAddDialog = new sap.m.Dialog({
					title : '{i18nModel>queryForm.serviceAdd}',
					type : 'Message',
					content : [   new sap.m.Label({text:"{i18nModel>queryForm.serviceId}"}), new sap.m.Input({
						class : "sapUiSmallMarginBottom",
						type : "Text",
						placeholder : "{i18nModel>queryForm.serviceIdPrompt}",
						valueStateText : "{i18nModel>Entry must be a valid name}"
					}), new sap.m.Label({text:"{i18nModel>queryForm.serviceUrl}"}), new sap.m.Input({
						class : "sapUiSmallMarginBottom",
						type : "Url",
						placeholder : "{i18nModel>queryForm.serviceUrlPrompt}",
						valueStateText : "{i18nModel>queryForm.serviceUrlState}"
					}) ],
					beginButton : new sap.m.Button({
						text : 'Add',
						press : function() {
							var validateService = function(service) {
								utils.getCachedOdataModel(service, this.onFailure, this.onSuccess)
								this.onFailure = function() {
									return false;
								};
								this.onSuccess = function() {
									return true;
								};
							};
							var service = {
								"code" : "T1",
								"name" : oServiceAddDialog.getContent()[0].getValue(),
								"serviceUrl" : oServiceAddDialog.getContent()[1].getValue(),
								"version" : "V2",
								"queries" : []
							};
							if (validateService(service)) {
								self.getModel("serviceQueriesModel").getData().services.push(service);
								self.getModel("serviceQueriesModel").refresh();
								sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty('validOdataService'));
								oServiceAddDialog.close();
							} else {
								sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty('invalidOdataService'));
							}
						}
					}),
					endButton : new sap.m.Button({
						text : 'Cancel',
						press : function() {
							oServiceAddDialog.close();
						}
					}),
					afterClose : function() {
						oServiceAddDialog.destroy();
					}
				});
				oServiceAddDialog.open();
			}
		}));
		self.oServiceSelect.addButton(new sap.m.Button({
			text : "{i18nModel>queryForm.serviceEdit}",
			icon : sap.ui.core.IconPool.getIconURI("edit"),
			press : function(oEvent) {
				sap.m.MessageToast.show("serviceEdit")
			}
		}));
		self.oQuerySelect = new sap.m.ActionSelect({
			tooltip : "{i18nModel>querySelectTooltip}",
			items : {
				path : "serviceQueriesModel>/services/LNW2/queries",
				sorter : {
					path : "serviceQueriesModel>name"
				},
				template : new sap.ui.core.ListItem({
					key : "{serviceQueriesModel>serviceUrl}",
					text : "{serviceQueriesModel>name}"
				})
			},
			change : function(oEvent) {
				self.fireQueryChanged({
					service : self.getModel("serviceQueriesModel").getProperty(self.oServiceSelect.getSelectedItem().getBindingContext("serviceQueriesModel").getPath()),
					query : self.getModel("serviceQueriesModel").getProperty(oEvent.getParameter("selectedItem").getBindingContext("serviceQueriesModel").getPath())
				})
			}
		});
		self.oQuerySelect.addButton(new sap.m.Button({
			text : "{i18nModel>queryDelete}",
			icon : sap.ui.core.IconPool.getIconURI("add"),
			press : function(oEvent) {
				sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryDelete"))
			}
		}));
		self.oQuerySelect.addButton(new sap.m.Button({
			text : "{i18nModel>queryAdd}",
			icon : sap.ui.core.IconPool.getIconURI("add"),
			press : function(oEvent) {
				sap.m.MessageToast.show(utils.generateUUID())
			}
		}));
		self.oQuerySelect.addButton(new sap.m.Button({
			text : "{i18nModel>queryClear}",
			icon : sap.ui.core.IconPool.getIconURI("restart"),
			press : function(oEvent) {
				sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryClear"))
			}
		}));
		self.oPreview = new sap.m.Button({
			text : "{i18nModel>preview}",
			icon : sap.ui.core.IconPool.getIconURI("search"),
			press : function(oEvent) {
				self.firePreview({})
			}
		});
		self.oEnterQueryParameters = new sap.m.Button({
			text : "{i18nModel>enterQueryParameters}",
			tooltip : "{i18nModel>enterQueryParametersTooltip}",
			icon : sap.ui.core.IconPool.getIconURI("form"),
			press : function(oEvent) {
				var oQueryContext = self.oQuerySelect.getSelectedItem().getBindingContext("serviceQueriesModel");
				var oParameters = oQueryContext.getProperty("parameters");
				if (!jQuery.isEmptyObject(oParameters) && (oParameters.length > 0)) {
					var enterQueryParametersDialog = new sparqlish.control.parameterDialog();
					enterQueryParametersDialog.setQueryContext(oQueryContext);
					enterQueryParametersDialog.open();
				} else {
					sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("noQueryParams"))
				}
			}
		});
		self.oUndo = new sap.m.Button({
			text : "{i18nModel>undo}",
			tooltip : "{i18nModel>undoTooltip}",
			icon : sap.ui.core.IconPool.getIconURI("undo"),
			press : function(oEvent) {
				self.fireUndo(oEvent);
			}
		});
		self.oSave = new sap.m.Button({
			text : "{i18nModel>save}",
			tooltip : "{i18nModel>saveTooltip}",
			icon : sap.ui.core.IconPool.getIconURI("save"),
			press : function(oEvent) {
				self.fireSave(oEvent);
			}
		});
		self.oSettings = new sap.m.Button({
			icon : sap.ui.core.IconPool.getIconURI("settings"),
			press : function(oEvent) {
				sap.m.MessageToast.show("settings")
			}
		});
		self.oInova8 = new sap.m.Button({
			icon : "resources/inova8.png",
			press : function(oEvent) {
				window.open("http://www.inova8.com");
			}
		});
		self.oToolbar = new sap.m.Toolbar();
		self.oToolbar.addContent(self.oInova8).addContent(self.oServiceSelect).addContent(self.oQuerySelect).addContent(self.oEnterQueryParameters).addContent(
				self.oUndo).addContent(self.oRedo).addContent(self.oSave).addContent(self.oSaveAs).addContent(new sap.m.ToolbarSpacer()).addContent(self.oPreview)
				.addContent(new sap.m.ToolbarSpacer()).addContent(self.oSettings);
		// self.oToolbar.addContent(self.oServiceSelect).addContent(self.oQuerySelect)
		// .addContent(self.oPreview);
		self.setAggregation("_toolbar", self.oToolbar);
	},
	addContent : function(oControl) {
		this.oToolbar.addContent(oControl);
		return this;
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_toolbar"));
	}
});
