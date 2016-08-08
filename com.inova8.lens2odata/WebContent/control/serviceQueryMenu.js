jQuery.sap.require("sap.m.ActionSelect");
jQuery.sap.require("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("control.parameterDialog");
jQuery.sap.require("control.pinDialog");
jQuery.sap.require("control.addServiceDialog");
"use strict";
sap.m.OverflowToolbar.extend("control.serviceQueryMenu", {
	metadata : {
		properties : {
			serviceUrl : {
				type : "string",
				defaultValue : "{i18nModel>queryForm.selectService}"
			},
			query : {
				type : "string",
				defaultValue : "{i18nModel>queryForm.selectQuery}"
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
			},
			moveUp : {
				enablePreventDefault : true
			},
			moveDown : {
				enablePreventDefault : true
			}
		}
	},
	init : function() {
		var self = this;
		self.oServiceSelect = new sap.m.ActionSelect({
			tooltip : "{i18nModel>queryForm.serviceSelectTooltip}",
			items : {
				path : "queryModel>/services",
				sorter : {
					path : "queryModel>name"
				},
				template : new sap.ui.core.ListItem({
					key : "{queryModel>code}",
					text : "{queryModel>name}"
				})
			},
			change : function(oEvent) {
				self.oQuerySelect.bindItems({
					path : "queryModel>" + oEvent.getParameter("selectedItem").getBindingContext("queryModel") + "/queries",
					sorter : {
						path : "queryModel>name"
					},
					template : new sap.ui.core.ListItem({
						key : "{queryModel>code}",
						text : "{queryModel>name}"
					})
				});
				self.oQuerySelect.setSelectedItem(self.oQuerySelect.getFirstItem());
			}
		}).addStyleClass("menuText").attachChange(
				function(oEvent) {
					var service = self.getModel("queryModel").getProperty(self.oServiceSelect.getSelectedItem().getBindingContext("queryModel").getPath());
					var query = jQuery.isEmptyObject(self.oQuerySelect.getSelectedItem()) ? service.queries[Object.keys(service.queries)[0]] : self
							.getModel("queryModel").getProperty(self.oQuerySelect.getSelectedItem().getBindingContext("queryModel").getPath());
					self.fireServiceChanged({
						service : service,
						query : query
					})
				});

		self.oServiceSelect.addButton(new sap.m.Button({
			text : "{i18nModel>queryForm.serviceDelete}",
			icon : sap.ui.core.IconPool.getIconURI("delete"),
			press : function(oEvent) {
				var oServiceDeleteDialog = new sap.m.Dialog({
					title : '{i18nModel>queryForm.serviceDelete}',
					type : 'Message',
					content : [ new sap.m.Label({
						text : "{i18nModel>queryForm.serviceId}"
					}), new sap.m.Input({
						placeholder : self.oServiceSelect.getSelectedItem().getText()
					}) ],
					beginButton : new sap.m.Button({
						text : 'Confirm',
						press : function() {
							delete self.getModel("queryModel").getData().services[self.oServiceSelect.getSelectedKey()];
							self.getModel("queryModel").refresh();
							sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryForm.serviceDeleted"));
							oServiceDeleteDialog.close();
							var services = self.getModel("queryModel").getData().services;
							var service = jQuery.isEmptyObject(self.oServiceSelect.getSelectedItem()) ? services[Object.keys(services)[0]] : self.getModel("queryModel")
									.getProperty(self.oServiceSelect.getSelectedItem().getBindingContext("queryModel").getPath());
							var query = jQuery.isEmptyObject(self.oQuerySelect.getSelectedItem()) ? service.queries[Object.keys(service.queries)[0]] : self.getModel(
									"queryModel").getProperty(self.oQuerySelect.getSelectedItem().getBindingContext("queryModel").getPath());
							self.fireServiceChanged({
								service : service,
								query : query
							})
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
				var oServiceAddDialog = new control.addServiceDialog();
				oServiceAddDialog.open();
			}
		}));
		self.oServiceSelect.addButton(new sap.m.Button({
			text : "{i18nModel>queryForm.serviceEdit}",
			icon : sap.ui.core.IconPool.getIconURI("edit"),
			press : function(oEvent) {
				var oServiceEditDialog = new sap.m.Dialog({
					title : '{i18nModel>queryForm.serviceEdit}',
					type : 'Message',
					content : [ new sap.m.Label({
						text : "{i18nModel>queryForm.serviceName}"
					}), new sap.m.Input({
						value : {
							path : "queryModel>/services/" + self.oServiceSelect.getSelectedKey() + "/name"
						}
					}), new sap.m.Label({
						text : "{i18nModel>queryForm.serviceUrl}"
					}), new sap.m.Input({
						value : {
							path : "queryModel>/services/" + self.oServiceSelect.getSelectedKey() + "/serviceUrl"
						}
					}), new sap.m.Label({
						text : "{i18nModel>queryForm.useProxy}"
					}), new sap.m.CheckBox({
						selected : {
							path : "queryModel>/services/" + self.oServiceSelect.getSelectedKey() + "/useProxy"
						}
					}), new sap.m.Label({
						text : "{i18nModel>queryForm.useJson}"
					}), new sap.m.CheckBox({
						selected : {
							path : "queryModel>/services/" + self.oServiceSelect.getSelectedKey() + "/json"
						}
					}), new sap.m.Label({
						text : "{i18nModel>queryForm.serviceVersion}"
					}), new sap.m.Select({
						tooltip : "{i18nModel>addServiceDialog.serviceVersionPrompt}",
						text : "{i18nModel>addServiceDialog.serviceVersion}",
						selectedKey : {
							path : "queryModel>/services/" + self.oServiceSelect.getSelectedKey() + "/version"
						},
						width : "auto",
						description : "",
						editable : true,
						items : [ new sap.ui.core.Item({
							key : "{i18nModel>addServiceDialog.serviceV2Key}",
							text : "{i18nModel>addServiceDialog.serviceV2}"
						}), new sap.ui.core.Item({
						key: "{i18nModel>addServiceDialog.serviceV3Key}",
						text : "{i18nModel>addServiceDialog.serviceV3}"
					}), new sap.ui.core.Item({
							key : "{i18nModel>addServiceDialog.serviceV4Key}",
							text : "{i18nModel>addServiceDialog.serviceV4}"
						}) ]
					}) ],
					beginButton : new sap.m.Button({
						text : 'Confirm',
						press : function() {
							sap.ui.getCore().setModel(null,
									constants.ODATACACHE + sap.ui.getCore().getModel("queryModel").getProperty("/services/" + self.oServiceSelect.getSelectedKey() + "/code"));
							self.getModel("queryModel").refresh();
							oServiceEditDialog.close();
						}
					}),
					endButton : new sap.m.Button({
						text : 'Cancel',
						press : function() {
							oServiceEditDialog.close();
						}
					}),
					afterClose : function() {
						oServiceEditDialog.destroy();
					}
				});
				oServiceEditDialog.open();
			}
		}));
		self.oQuerySelect = new sap.m.ActionSelect({
			tooltip : "{i18nModel>queryForm.serviceQueryTooltip}",
			items : {
				// path : "queryModel>/services/LNW2/queries",
				sorter : {
					path : "queryModel>name"
				},
				template : new sap.ui.core.ListItem({
					key : "{queryModel>serviceUrl}",
					text : "{queryModel>name}"
				})
			},
			change : function(oEvent) {
				self.fireQueryChanged({
					service : self.getModel("queryModel").getProperty(self.oServiceSelect.getSelectedItem().getBindingContext("queryModel").getPath()),
					query : self.getModel("queryModel").getProperty(oEvent.getParameter("selectedItem").getBindingContext("queryModel").getPath())
				})
			}
		});
		self.oQuerySelect.addButton(new sap.m.Button({
			text : "{i18nModel>queryForm.queryDelete}",
			icon : sap.ui.core.IconPool.getIconURI("delete"),
			press : function(oEvent) {
				var oQueryDeleteDialog = new sap.m.Dialog({
					title : '{i18nModel>queryForm.queryDelete}',
					type : 'Message',
					content : [ new sap.m.Label({
						text : "{i18nModel>queryForm.queryName}"
					}), new sap.m.Input({
						placeholder : self.oQuerySelect.getSelectedItem().getText() || "New query"
					}) ],
					beginButton : new sap.m.Button({
						text : 'Confirm',
						press : function() {
							delete self.getModel("queryModel").getData().services[self.oServiceSelect.getSelectedKey()].queries[self.oQuerySelect.getSelectedKey()];
							self.getModel("queryModel").refresh();
							sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryForm.queryDeleted"));
							oQueryDeleteDialog.close();
						}
					}),
					endButton : new sap.m.Button({
						text : 'Cancel',
						press : function() {
							oQueryDeleteDialog.close();
						}
					}),
					afterClose : function() {
						oQueryDeleteDialog.destroy();
					}
				});
				oQueryDeleteDialog.open();
			}
		}));

		self.oQuerySelect.addButton(new sap.m.Button({
			text : "{i18nModel>queryForm.queryAdd}",
			icon : sap.ui.core.IconPool.getIconURI("add"),
			press : function(oEvent) {
				var oQueryAddDialog = new sap.m.Dialog({
					title : '{i18nModel>queryForm.queryAdd}',
					type : 'Message',
					content : [ new sap.m.Label({
						text : "{i18nModel>queryForm.queryNewName}"
					}), new sap.m.Input({
						placeholder : self.oQuerySelect.getSelectedItem().getText(),
					}) ],
					beginButton : new sap.m.Button({
						text : 'Confirm',
						press : function() {
							var queries = self.getModel("queryModel").getData().services[self.oServiceSelect.getSelectedKey()].queries;
							var newQueryCode = utils.generateUUID();
							queries[newQueryCode] = {
								_class : "Query",
								code : newQueryCode,
								name : oQueryAddDialog.getContent()[1].getValue(),
								concept : self.getModel("entityContainer").getData().collections[0].name
							};
							self.getModel("queryModel").refresh();
							sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryForm.queryAdded"));
							oQueryAddDialog.close();
							self.fireQueryChanged({
								service : self.getModel("queryModel").getProperty(self.oServiceSelect.getSelectedItem().getBindingContext("queryModel").getPath()),
								query : queries[newQueryCode]
							});
						}
					}),
					endButton : new sap.m.Button({
						text : 'Cancel',
						press : function() {
							oQueryAddDialog.close();
						}
					}),
					afterClose : function() {
						oQueryAddDialog.destroy();
					}
				});
				oQueryAddDialog.open();
			}
		}));
		self.oQuerySelect.addButton(new sap.m.Button({
			text : "{i18nModel>queryForm.queryCopy}",
			icon : sap.ui.core.IconPool.getIconURI("duplicate"),
			press : function(oEvent) {
				var oQueryCopyDialog = new sap.m.Dialog({
					title : '{i18nModel>queryForm.queryCopy}',
					type : 'Message',
					content : [ new sap.m.Label({
						text : "{i18nModel>queryForm.queryNewName}"
					}), new sap.m.Input({
						value : self.oQuerySelect.getSelectedItem().getText()
					}) ],
					beginButton : new sap.m.Button({
						text : 'Confirm',
						press : function() {
							var queries = self.getModel("queryModel").getData().services[self.oServiceSelect.getSelectedKey()].queries;
							var newQueryCode = utils.generateUUID();
							var newQuery = jQuery.extend(true, {}, queries[self.oQuerySelect.getSelectedKey()]);
							newQuery.code = newQueryCode;
							newQuery.name = oQueryCopyDialog.getContent()[1].getValue();
							queries[newQueryCode] = newQuery;
							self.getModel("queryModel").refresh();
							sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryForm.queryCopied"));
							oQueryCopyDialog.close();
						}
					}),
					endButton : new sap.m.Button({
						text : 'Cancel',
						press : function() {
							oQueryCopyDialog.close();
						}
					}),
					afterClose : function() {
						oQueryCopyDialog.destroy();
					}
				});
				oQueryCopyDialog.open();
			}
		}));
		self.oQuerySelect.addButton(new sap.m.Button({
			text : "{i18nModel>queryForm.queryReset}",
			icon : sap.ui.core.IconPool.getIconURI("restart"),
			press : function(oEvent) {
				sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryClear"))
				var oQueryResetDialog = new sap.m.Dialog({
					title : '{i18nModel>queryForm.queryReset}',
					type : 'Message',
					content : [ new sap.m.Label({
						text : "{i18nModel>queryForm.queryName}"
					}), new sap.m.Input({
						placeholder : self.oQuerySelect.getSelectedItem().getText()
					}) ],
					beginButton : new sap.m.Button({
						text : 'Confirm',
						press : function() {
							var query = self.getModel("queryModel").getData().services[self.oServiceSelect.getSelectedKey()].queries[self.oQuerySelect.getSelectedKey()];
							delete query.clauses;
							delete query.parameters;
							self.getModel("queryModel").refresh();
							sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryForm.queryReset"));
							self.fireQueryChanged({
								service : self.getModel("queryModel").getData().services[self.oServiceSelect.getSelectedKey()],
								query : query
							})
							oQueryResetDialog.close();
						}
					}),
					endButton : new sap.m.Button({
						text : 'Cancel',
						press : function() {
							oQueryResetDialog.close();
						}
					}),
					afterClose : function() {
						oQueryResetDialog.destroy();
					}
				});
				oQueryResetDialog.open();
			}
		}));
		self.oQuerySelect.addButton(new sap.m.Button({
			text : "{i18nModel>queryForm.queryEdit}",
			icon : sap.ui.core.IconPool.getIconURI("edit"),
			press : function(oEvent) {
				var oQueryEditDialog = new sap.m.Dialog({
					title : '{i18nModel>queryForm.queryEdit}',
					type : 'Message',
					content : [ new sap.m.Label({
						text : "{i18nModel>queryForm.queryName}"
					}), new sap.m.Input({
						value : {
							path : "queryModel>/services/" + self.oServiceSelect.getSelectedKey() + "/queries/" + self.oQuerySelect.getSelectedKey() + "/name"
						}
					}) ],
					beginButton : new sap.m.Button({
						text : 'Confirm',
						press : function() {
							oQueryEditDialog.close();
						}
					}),
					endButton : new sap.m.Button({
						text : 'Cancel',
						press : function() {
							oQueryEditDialog.close();
						}
					}),
					afterClose : function() {
						oQueryEditDialog.destroy();
					}
				});
				oQueryEditDialog.open();
			}
		}));
		self.oPreview = new sap.m.Button({
			text : "{i18nModel>queryForm.preview}",
			icon : sap.ui.core.IconPool.getIconURI("search"),
			press : function(oEvent) {
				self.firePreview({})
			}
		});
		self.oEnterQueryParameters = new sap.m.Button({
			text : "{i18nModel>queryForm.parameterEdit}",
			tooltip : "{i18nModel>queryForm.parameterEditTooltip}",
			icon : sap.ui.core.IconPool.getIconURI("form"),
			press : function(oEvent) {
				var oQueryContext = self.oQuerySelect.getSelectedItem().getBindingContext("queryModel");
				var oParameters = oQueryContext.getProperty("parameters");
				// if (!jQuery.isEmptyObject(oParameters) && (oParameters.length > 0)) {
				var enterQueryParametersDialog = new control.parameterDialog();
				enterQueryParametersDialog.setQueryContext(oQueryContext);
				enterQueryParametersDialog.open();
				// } else {
				// sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryForm.noParameters"))
				// }
			}
		});
		self.oUndo = new sap.m.Button({
			text : "{i18nModel>queryForm.undo}",
			tooltip : "{i18nModel>queryForm.undoTooltip}",
			icon : sap.ui.core.IconPool.getIconURI("undo"),
			press : function(oEvent) {
				self.fireUndo(oEvent);
			}
		});
		self.oSave = new sap.m.Button({
			text : "{i18nModel>queryForm.save}",
			tooltip : "{i18nModel>queryForm.saveTooltip}",
			icon : sap.ui.core.IconPool.getIconURI("save"),
			press : function(oEvent) {

				self.fireSave({
					queryCode : self.oQuerySelect.getSelectedKey()
				});
			}
		});
		self.oPin = new sap.m.Button({
			text : "{i18nModel>queryForm.pinToLens}",
			tooltip : "{i18nModel>queryForm.pinToLensTooltip}",
			icon : sap.ui.core.IconPool.getIconURI("pushpin-off"),
			press : function(oEvent) {
				var oQueryContext = self.oQuerySelect.getSelectedItem().getBindingContext("queryModel");
				var queryModel = self.getModel("queryModel").getProperty(self.oQuerySelect.getSelectedItem().getBindingContext("queryModel").getPath());
				var query = new Query(oEvent.getSource().getModel("metaModel"), queryModel);

				var pinDialog = new control.pinDialog();
				pinDialog.setModel(sap.ui.getCore().getModel("lensesModel"), "lensesModel");
				pinDialog.setModel(oEvent.getSource().getModel("metaModel"), "metaModel");
				pinDialog.setQueryContext(oQueryContext);
				pinDialog.setOdataQuery(query.odataQuery());
				pinDialog.open();
				self.fireSave({
					queryCode : self.oQuerySelect.getSelectedKey()
				});
			}
		});
		self.oMoveUp = new sap.m.Button({
			text : "{i18nModel>queryForm.moveUp}",
			tooltip : "{i18nModel>queryForm.moveUpTooltip}",
			icon : sap.ui.core.IconPool.getIconURI("up"),
			visible : false,
			press : function(oEvent) {
				self.fireMoveUp();
			}
		});
		self.oMoveDown = new sap.m.Button({
			text : "{i18nModel>queryForm.moveDown}",
			tooltip : "{i18nModel>queryForm.moveDownTooltip}",
			icon : sap.ui.core.IconPool.getIconURI("down"),
			visible : false,
			press : function(oEvent) {
				self.fireMoveDown();
			}
		});
		self.oLogo = new sap.m.Button({
			icon : "resources/lens2odata.png",
			press : function(oEvent) {
				window.open("http://www.inova8.com/");
			}
		});
		self.oToolbar = new sap.m.Toolbar();
		self.oToolbar.addContent(self.oLogo).addContent(self.oServiceSelect).addContent(self.oQuerySelect).addContent(self.oEnterQueryParameters).addContent(
				self.oUndo).addContent(self.oRedo).addContent(self.oSave).addContent(self.oSaveAs).addContent(self.oPin).addContent(self.oMoveUp).addContent(
				self.oMoveDown).addContent(new sap.m.ToolbarSpacer()).addContent(self.oPreview).addContent(new sap.m.ToolbarSpacer());// .addContent(self.oSettings);
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
