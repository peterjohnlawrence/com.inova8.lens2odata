jQuery.sap.require("sap.m.ActionSelect");
jQuery.sap.require("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.core.IconPool");
sap.m.Toolbar.extend("sparqlish.control.serviceQueryMenu", {
	metadata : {
		properties : {
			serviceUrl : {
				type : "string",
				defaultValue : "Select a service"
			},
			query : {
				type : "string",
				defaultValue : "Select a query"
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
			saveAs : {
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
					key : "{serviceQueriesModel>serviceUrl}",
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
						key : "{serviceQueriesModel>name}",
						text : "{serviceQueriesModel>name}"
					})
				});
				self.oQuerySelect.setSelectedItem( self.oQuerySelect.getFirstItem());
				self.fireQueryChanged({
					query : self.getModel("serviceQueriesModel").getProperty(self.oQuerySelect.getSelectedItem().getBindingContext("serviceQueriesModel").getPath())
				})
			}
		}).addStyleClass("menuText").attachChange(function(oEvent){
					self.fireServiceChanged({
					service : self.getModel("serviceQueriesModel").getProperty(self.oServiceSelect.getSelectedItem().getBindingContext("serviceQueriesModel").getPath()),
					query : self.getModel("serviceQueriesModel").getProperty(self.oQuerySelect.getSelectedItem().getBindingContext("serviceQueriesModel").getPath())
				})			
		});

		self.oServiceSelect.addButton(new sap.m.Button({
			text : "{i18nModel>serviceDelete}",
			icon : sap.ui.core.IconPool.getIconURI("delete"),
			press : function(oEvent) {
				sap.m.MessageToast.show("serviceDelete")
			}
		}));
		self.oServiceSelect.addButton(new sap.m.Button({
			text : "{i18nModel>serviceAdd}",
			icon : sap.ui.core.IconPool.getIconURI("add"),
			press : function(oEvent) {
				sap.m.MessageToast.show("serviceAdd")
			}
		}));
		self.oServiceSelect.addButton(new sap.m.Button({
			text : "{i18nModel>serviceEdit}",
			icon : sap.ui.core.IconPool.getIconURI("edit"),
			press : function(oEvent) {
				sap.m.MessageToast.show("serviceEdit")
			}
		}));
		self.oQuerySelect = new sap.m.ActionSelect({
			tooltip : "{i18nModel>querySelectTooltip}",
			items : {
				path : "serviceQueriesModel>/services/0/queries",
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
				sap.m.MessageToast.show("queryDelete")
			}
		}));
		self.oQuerySelect.addButton(new sap.m.Button({
			text : "{i18nModel>queryAdd}",
			icon : sap.ui.core.IconPool.getIconURI("add"),
			press : function(oEvent) {
				sap.m.MessageToast.show("queryAdd")
			}
		}));
		self.oQuerySelect.addButton(new sap.m.Button({
			text : "{i18nModel>queryClear}",
			icon : sap.ui.core.IconPool.getIconURI("restart"),
			press : function(oEvent) {
				sap.m.MessageToast.show("queryClear")
			}
		}));
		self.oPreview = new sap.m.Button({
			text : "{i18nModel>preview}",
			icon : sap.ui.core.IconPool.getIconURI("search"),
			press : function(oEvent) {
				self.firePreview({})
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
		self.oSaveAs = new sap.m.Button({
			text : "{i18nModel>saveAs}",
			tooltip : "{i18nModel>saveAsTooltip}",
			icon : sap.ui.core.IconPool.getIconURI("duplicate"),
			press : function(oEvent) {
				self.fireSaveAs(oEvent);
			}
		});
		self.oSettings = new sap.m.Button({
			icon : sap.ui.core.IconPool.getIconURI("settings"),
			press : function(oEvent) {
				sap.m.MessageToast.show("settings")
			}
		});
		self.oInova8 = new sap.m.Button({
			icon : "../resources/inova8.png",
			press : function(oEvent) {
				window.open("http://www.inova8.com");
			}
		});
		self.oToolbar = new sap.m.Toolbar();
		self.oToolbar.addContent(self.oInova8).addContent(self.oServiceSelect).addContent(self.oQuerySelect).addContent(self.oUndo).addContent(self.oRedo)
				.addContent(self.oSave).addContent(self.oSaveAs).addContent(new sap.m.ToolbarSpacer()).addContent(self.oPreview).addContent(new sap.m.ToolbarSpacer())
				.addContent(self.oSettings);
		self.setAggregation("_toolbar", self.oToolbar);
	},
	addContent:function(oControl){
		this.oToolbar.addContent(oControl);
		return this;
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_toolbar"));
	}
});
