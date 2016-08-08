jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("lib.sparqlish")
jQuery.sap.require("control.queryClause");
jQuery.sap.require("control.queryClausePreview");
jQuery.sap.require("control.serviceQueryMenu");
jQuery.sap.require("control.addServiceDialog");
jQuery.sap.require("sap.ui.table.TreeTable");
jQuery.sap.require("sap.m.Toolbar");
jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("lib.ODataMetaModel.v4")

jQuery.sap.declare("Components.queryForm.Component");
"use strict";
sap.ui.core.UIComponent.extend("Components.queryForm.Component", {
	metadata : {
		// manifest : "json",
		properties : {
			title : "string",
			// serviceQueriesModel : "object",
			odataModel : "object",
			queryModel : "object",
			service : "object",
			query : "object",
			queryCode : "string",
			params : {
				type : "object"
			},
			i18nModel : "object", // TODO or specific one for this component?
			datatypesModel : "object"
		}
	}
});
Components.queryForm.Component.prototype.setQueryModel = function(queryModel) {
	this.setProperty("queryModel", queryModel);
};

Components.queryForm.Component.prototype.onAfterRendering = function() {
	if (jQuery.isEmptyObject(this.getProperty("service"))) {
		if (jQuery.isEmptyObject(sap.ui.getCore().getModel("queryModel").getData().services)) {
			var oServiceAddDialog = new control.addServiceDialog();
			oServiceAddDialog.attachServiceAdded(function(oEvent) {
				sap.ui.core.routing.Router.getRouter("lensRouter").navTo("query", {
					service : oEvent.getParameter("service").code,
					querycode : oEvent.getParameter("query").code,
				});
			});
			oServiceAddDialog.open();
		} else {
			var services = sap.ui.getCore().getModel("queryModel").getData().services;
			var queries = services[Object.keys(services)[0]].queries;
			sap.ui.core.routing.Router.getRouter("lensRouter").navTo("query", {
				service : services[Object.keys(services)[0]].code,
				querycode : queries[Object.keys(queries)[0]].code
			});

		}
	}
};
Components.queryForm.Component.prototype.createContent = function() {
	var self = this;
	this.oTable = new sap.ui.table.TreeTable({
		columns : [ new sap.ui.table.Column("queryColumn", {
			label : "{i18nModel>queryForm.query}",
			template : new control.queryClause({
				clausePath : {
					path : "viewModel>path"
				},
				queryChanged : function() {
					self.getQuery().pushQuery();
					self.refreshQuery(self);
				}
			}),
			visible : true,
			flexible : true,
			resizable : true,
			autoResizable : true
		}), new sap.ui.table.Column("resultsColumn", {
			label : "{i18nModel>queryForm.resultsPreview}",
			template : new control.queryClausePreview({
				viewContext : {
					path : "viewModel>",
				},
				serviceCode : "LNW2"
			}),
			flexible : true,
			resizable : false, // true
			autoResizable : false
		}), new sap.ui.table.Column("path", {
			label : "Path",
			template : new sap.m.Text({
				text : "{viewModel>path}"
			}),
			flexible : true,
			resizable : true,
			autoResizable : true,
			visible : false
		}) ],
		// width : "100%",
		// height : "100%",
		visibleRowCount : 1,
		selectionMode : sap.ui.table.SelectionMode.Single,
		enableColumnReordering : false,
		enableSelectAll : false,
		selectionBehavior : sap.ui.table.SelectionBehavior.RowSelector,
		// Only Odata.v2 expandTolevel : 3,
		toolbar : new control.serviceQueryMenu().setModel(sap.ui.getCore().getModel("queryModel"), "queryModel").attachPreview(function(oEvent) {
			self.previewResults(self);
		}).attachQueryChanged(function(oEvent) {
			self.clearResults(self);
			self.oTable.setModel(null, "queryModel");
			sap.ui.core.routing.Router.getRouter("lensRouter").navTo("query", {
				service : oEvent.getParameter("service").code,
				querycode : oEvent.getParameter("query").code,
			});
		}).attachServiceChanged(function(oEvent) {
			self.clearResults(self);
			self.oTable.setModel(null, "queryModel");
			sap.ui.core.routing.Router.getRouter("lensRouter").navTo("query", {
				service : oEvent.getParameter("service").code,
				querycode : oEvent.getParameter("query").code,
			});
		}).attachUndo(function(oEvent) {
			self.getQuery().undo();
			self.refreshQuery(self);
		}).attachSave(function(oEvent) {
			document.location.pathname
			utils.saveToLocalStorage("queries", "queryModel");
			utils.saveToLocalStorage("lenses", "lensesModel");
		}).attachMoveUp(function(oEvent) {
			self.moveClauseUp();
		}).attachMoveDown(function(oEvent) {
			self.moveClauseDown();
		})
	}).setModel(sap.ui.getCore().getModel("i18nModel"), "i18nModel").setModel(sap.ui.getCore().getModel("datatypesModel"), "datatypesModel");
	// TODO add ability to move row up or down
	this.oTable.attachRowSelectionChange(function(oEvent) {
		self.checkMoveUpDown(oEvent);
	});
	// TODO add debug menu
	if (jQuery.sap.log.getLevel() === jQuery.sap.log.Level.ERROR) {
		this.oDebug = new sap.m.Button({
			text : "{i18nModel>debug}",
			icon : sap.ui.core.IconPool.getIconURI("settings"),
			press : function(oEvent) {
				self.debugSheet.openBy(oEvent.getSource());
			}
		});
		this.oTable.getToolbar().addContent(this.oDebug);

		this.debugSheet = this.createDebugActionSheet(this);
	}
	return this.oTable;
};
Components.queryForm.Component.prototype.clearResults = function(self) {
	// Sledgehammer, but it seems to work by starting again with the preview column of the table
	self.oTable.getColumns()[1].setTemplate(new control.queryClausePreview({
		viewContext : {
			path : "viewModel>",
		},
		serviceCode : this.getProperty("service").code
	}));
	//
	self.oResultsModel = new sap.ui.model.json.JSONModel({});
	self.oTable.setModel(self.oResultsModel, "resultsModel");
};
Components.queryForm.Component.prototype.resetQuery = function(self) {
	this.clearResults(this);
	this.setQuery({
		"_class" : "Query",
		"name" : "",
		"concept" : "Orders"
	});
};
Components.queryForm.Component.prototype.refreshQuery = function(self) {
	self.clearResults(self);
	var query = this.getProperty("query").init();
	this.setProperty("query", query);
	this.oTable.getModel("queryModel").setData(query.oAST);
	this.oViewModel.setData(query.oViewModel);
	if (!jQuery.isEmptyObject(this.oViewModel.getData())) {
		this.oTable.setVisibleRowCount(this.oViewModel.getData().root.branchLength);
	} else {
		this.oTable.setVisibleRowCount(1);
	}
	self.oTable.getModel("viewModel").refresh();
};
Components.queryForm.Component.prototype.setService = function(service, query, params) {
	var self = this;
	self.setProperty("params", params);
	if (jQuery.isEmptyObject(self.getQuery()) || (self.getQuery().oAST !== query) || (self.getProperty("service") !== service)) {
		if (jQuery.isEmptyObject(service)) {
			// self.setService(null);
			// prompt for service after rendering queryform
		} else {
			self.setProperty("service", service);
			var odataModel = utils.getCachedOdataModel(service, function() {
				self.oTable.setBusy(false);
			}, function(odataModel) {
				// self.setProperty("service", service);
				self.setOdataModel(odataModel);
				self.oTable.setModel(odataModel, "odataModel");
				// Setup service list
				self.oTable.getToolbar().oServiceSelect.setSelectedKey(service.code);
				// Setup query list
				self.oTable.getToolbar().oQuerySelect.bindItems({
					path : "queryModel>/services/" + service.code + "/queries",
					sorter : {
						path : "queryModel>name"
					},
					template : new sap.ui.core.ListItem({
						key : "{queryModel>code}",
						text : "{queryModel>name}"
					})
				});
				// Delay this
				// self.oTable.getToolbar().oQuerySelect.setSelectedItem(self.oTable.getToolbar().oQuerySelect.getFirstItem());
				// Setup metamodel to drive the query composition before setting the query
				var oDataMetaModel = odataModel.getMetaModel();
				self.oTable.setBusy(true).setBusyIndicatorDelay(0);
				oDataMetaModel.loaded().then(function() {
					var oMetaModelCollections;
					var oCollectionsModel = new sap.ui.model.json.JSONModel();
					self.oTable.setModel(oDataMetaModel, "metaModel");
					self.oTable.getToolbar().setModel(oDataMetaModel, "metaModel");
					oMetaModelCollections = oDataMetaModel.getODataCollections();
					self.oTable.setModel(self.getDatatypesModel(), "datatypesModel");
					self.oTable.getColumns()[1].setTemplate(new control.queryClausePreview({
						viewContext : {
							path : "viewModel>",
						},
						serviceCode : service.code
					}));
					oCollectionsModel.setData(oMetaModelCollections);
					// TODO this does not work so need to set Core
					self.oTable.setModel(oCollectionsModel, "entityContainer");
					sap.ui.getCore().setModel(oCollectionsModel, "entityContainer");
					self.oTable.setBusy(false);
					if (jQuery.isEmptyObject(query)) {
						query = service.queries[Object.keys(service.queries)[0]]
					}
					self.oTable.getToolbar().oQuerySelect.setSelectedKey(query.code);
					self.setQuery(query);
					self.setProperty("queryCode", query.code);
					// TODO can we calculate the max level?
					self.oTable.expandToLevel(10);

				}, function() {
					self.oTable.setBusy(false);
					throw ("metamodel error");
				});
			});
		}
	}
};

Components.queryForm.Component.prototype.setQuery = function(queryModel) {
	var self = this;
	try {
		this.oTable.unbindColumns();
		var query = new Query(this.oTable.getModel("metaModel"), queryModel);
		// var query = new Query(this.getOdataModel(), queryModel);
		this.setProperty("query", query);

		var oQueryModel = new sap.ui.model.json.JSONModel();
		oQueryModel.setData(query.oAST);
		// this.oTable.setModel(oQueryModel, "queryModel");

		this.oViewModel = new sap.ui.model.json.JSONModel();
		this.oViewModel.setData(query.oViewModel);
		this.oTable.setMinAutoRowCount(1);
		if (!jQuery.isEmptyObject(this.oViewModel.getData())) {
			this.oTable.setVisibleRowCount(this.oViewModel.getData().root.branchLength);
		} else {
			this.oTable.setVisibleRowCount(1);
		}
		// this.oTable.setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Interactive);
		this.oTable.setModel(this.oViewModel, "viewModel");
		this.oTable.bindRows("viewModel>/");

		this.oResultsModel = new sap.ui.model.json.JSONModel({});
		this.oResultsModel.setData({});
		this.oTable.setModel(this.oResultsModel, "resultsModel");
		try {
			this.oTable.setModel(oQueryModel, "queryModel");
		} catch (e) {
			// Terrible hack to ignore this error when switching as residual controls seem not to be dropped in correct order
		}
	} catch (e) {
		sap.m.MessageToast.show(e);
	}
};
Components.queryForm.Component.prototype.previewResults = function(self) {
	try {
		utils.queryModel(this.getProperty("odataModel"), this.getProperty("query").init(this.getProperty("query").oAST), function(oEvent) {
			var oData = oEvent.getParameters.data;
		});

		var query = this.getProperty("query").init(this.getProperty("query").oAST);

		var serviceURL = utils.proxyUrl(this.getProperty("service").serviceUrl, this.getProperty("service").useProxy);
		var odataURL = serviceURL + query.odataURI() + "&$top=10";
		self.clearResults(self);
		self.oResultsModel = new sap.ui.model.json.JSONModel({});
		if (!jQuery.isEmptyObject(odataURL)) {
			self.oTable.setBusy(true);// .setBusyIndicatorDelay(0);
			self.oResultsModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var nResults = 0;
					self.oResultsModel.sBindPath = null;
					var oData = self.oResultsModel.getData();
					// if (jQuery.isEmptyObject(oData.d.results)) {
					if (oData.d !== undefined) {
						if (typeof oData.d.results !== "object") {
							if (oData.d.length > 0) {
								self.oResultsModel.sBindPath = "/d";
							} else {
								sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryForm.noResults"));
							}
						} else {
							nResults = oData.d.results.length;
							if (nResults === 0) {
								sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryForm.noResults"));
							} else {
								self.oResultsModel.sBindPath = "/d/results";
							}
						}
						self.oTable.setBusy(false);
						self.oTable.setModel(self.oResultsModel, "resultsModel");
						// TODO Minimize rerendering to the preview column
						self.oTable.getColumns()[1].rerender();
					} else {
						self.oTable.setBusy(false);
						sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryForm.invalidResponse"));
					}
				}
			}).attachRequestFailed(
					function(oEvent) {
						sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryForm.queryResponseError") + oEvent.getParameter("statusCode")
								+ " " + oEvent.getParameter("statusText") + " " + oEvent.getParameter("responseText"));
						self.oTable.setBusy(false);
					});
			self.oResultsModel.loadData(odataURL);
		} else {
			sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryForm.queryUndefined"));
		}
	} catch (e) {
		sap.m.MessageToast.show(e);
	}
};

Components.queryForm.Component.prototype.checkMoveUpDown = function(oEvent) {
	var self = oEvent.getSource();
	if (oEvent.getParameters().rowContext == null) {
		self.getParent().oTable.getToolbar().oMoveUp.setVisible(false);
		self.getParent().oTable.getToolbar().oMoveDown.setVisible(false);
		self.getParent().oTable.getToolbar().oMoveUp.oClause_1 = null;
		self.getParent().oTable.getToolbar().oMoveUp.oClause0 = null;
		self.getParent().oTable.getToolbar().oMoveDown.oClause0 = null;
		self.getParent().oTable.getToolbar().oMoveDown.oClause1 = null;
	} else {
		var queryModelPath = self.getModel("viewModel").getObject(oEvent.getParameters().rowContext.sPath).path;
		var oQueryModelPath = queryModelPath.split("/");
		var bUp, bDown;
		var oClause_1, oClause0, oClause1;
		var currentClass = self.getModel("queryModel").getObject(queryModelPath)._class;
		switch (self.getModel("queryModel").getObject(queryModelPath)._class) {
		case "Clause":
			oQueryModelPath.splice(oQueryModelPath.length - 2, 1);
			bUp = false;
			var clausesPath = oQueryModelPath.join("/");
			if (jQuery.isEmptyObject(self.getModel("queryModel").getObject(clausesPath + "conjunctionClauses/0/"))) {
				bDown = false
			} else {
				bDown = true;
				oClause0 = clausesPath;
				oClause1 = clausesPath + "conjunctionClauses/0/";
			}
			break;
		case "Query":
			bDown = false;
			bUp = false;
			break;
		default:
			var conjunctionClauseIndex = oQueryModelPath[oQueryModelPath.length - 2];
			oQueryModelPath.splice(oQueryModelPath.length - 3, 2);
			var clausesPath = oQueryModelPath.join("/");
			bUp = true;
			if (conjunctionClauseIndex == 0) {
				oClause_1 = clausesPath;
			} else {
				oClause_1 = clausesPath + "conjunctionClauses/" + (Number(conjunctionClauseIndex) - 1) + "/";
			}
			oClause0 = queryModelPath;
			if (jQuery.isEmptyObject(self.getModel("queryModel").getObject(clausesPath + "conjunctionClauses/" + (Number(conjunctionClauseIndex) + 1) + "/"))) {
				bDown = false
			} else {
				bDown = true;
				oClause1 = clausesPath + "conjunctionClauses/" + (Number(conjunctionClauseIndex) + 1) + "/";
			}
			break;
		}
		var clausesPath = oQueryModelPath.join("/");
		self.getParent().oTable.getToolbar().oMoveUp.setVisible(bUp);
		self.getParent().oTable.getToolbar().oMoveDown.setVisible(bDown);
		self.getParent().oTable.getToolbar().oMoveUp.oClause_1 = oClause_1;
		self.getParent().oTable.getToolbar().oMoveUp.oClause0 = oClause0;
		self.getParent().oTable.getToolbar().oMoveDown.oClause0 = oClause0;
		self.getParent().oTable.getToolbar().oMoveDown.oClause1 = oClause1;
	}
};

Components.queryForm.Component.prototype.moveClauseUp = function(oClause) {
	var oClause_1 = this.oTable.getModel("queryModel").getObject(this.oTable.getToolbar().oMoveUp.oClause_1);
	var oClause0 = this.oTable.getModel("queryModel").getObject(this.oTable.getToolbar().oMoveUp.oClause0);
	this.swapQueryClauses(oClause_1, oClause0);
};
Components.queryForm.Component.prototype.moveClauseDown = function(oClause) {
	var oClause0 = this.oTable.getModel("queryModel").getObject(this.oTable.getToolbar().oMoveDown.oClause0);
	var oClause1 = this.oTable.getModel("queryModel").getObject(this.oTable.getToolbar().oMoveDown.oClause1);
	this.swapQueryClauses(oClause0, oClause1);
};
Components.queryForm.Component.prototype.swapQueryClauses = function(oClause0, oClause1) {
	// swap these two clauses
	var temp = oClause0.clause;
	oClause0.clause = oClause1.clause;
	oClause1.clause = temp;
	this.refreshQuery(this);
};
Components.queryForm.Component.prototype.createDebugActionSheet = function(self) {
	var debugActionSheet = new sap.m.ActionSheet().addButton(new sap.m.Button({
		text : "{i18nModel>debug.queryModel}",
		press : function() {
			alert(JSON.stringify(self.getProperty("query").queryModel(), null, 2), {
				width : "50em"
			});
		}
	})).addButton(new sap.m.Button({
		text : "{i18nModel>debug.viewModel}",
		press : function() {
			alert(JSON.stringify(self.getProperty("query").viewModel(), null, 2), {
				width : "50em"
			});
		}
	})).addButton(new sap.m.Button({
		text : "{i18nModel>debug.queryOData}",
		press : function() {
			var version = self.getOdataModel().sMaxDataServiceVersion;
			sap.m.MessageToast.show(self.getProperty("query").odataURI(version), {
				width : "50em"
			});
		}
	})).addButton(new sap.m.Button({
		text : "{i18nModel>debug.fragmentDefinition}",
		press : function() {
			var queryDetails = {};
			queryDetails.serviceUrl = self.getOdataModel().sServiceUrl;
			var version = self.getOdataModel().sMaxDataServiceVersion;
			queryDetails.resourcePath = self.getProperty("query").odataPath(version);
			queryDetails.filter = self.getProperty("query").odataFilter(version);
			queryDetails.expand = self.getProperty("query").odataExpandList(version);
			queryDetails.select = self.getProperty("query").odataSelectList(version);
			queryDetails.orderby = "";
			queryDetails.options = self.getProperty("query").odataOptions(version);
			var fragment = {};
			fragment.entityType = self.oTable.getModel("metaModel").getODataConcept(self.getProperty("query").sConcept).entityType;
			fragment.position = "R1";
			fragment.title = "title";
			fragment.type = "Components.lensResultsForm|Components.lensResultsTable";
			fragment.query = self.getProperty("query").odataURI(version);
			fragment.querydetails = queryDetails;
			alert(JSON.stringify(fragment, null, 2), {
				width : "100em"
			});
		}
	})).addButton(new sap.m.Button({
		text : "{i18nModel>debug.executeOData}",
		press : function() {
			var version = self.getOdataModel().sMaxDataServiceVersion;
			sap.m.URLHelper.redirect(self.getProperty("service").serviceUrl+ self.getProperty("query").odataURI(version), true);
		//	sap.m.URLHelper.redirect(self.getOdataModel().sServiceUrl + "/" + self.getProperty("query").odataURI(version), true);
		}
	})).addButton(new sap.m.Button({
		text : "{i18nModel>debug.odataCollections}",
		press : function() {
			sap.m.URLHelper.redirect(self.getOdataModel().sServiceUrl, true);
		}
	})).addButton(new sap.m.Button({
		text : "{i18nModel>debug.odataMetadata}",
		press : function() {
			sap.m.URLHelper.redirect(self.getOdataModel().sServiceUrl + "/$metadata", true);
		}
	}));
	return debugActionSheet;

};