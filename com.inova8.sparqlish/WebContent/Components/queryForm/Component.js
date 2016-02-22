jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sparqlish.sparqlish")
jQuery.sap.require("sparqlish.control.queryClause");
jQuery.sap.require("sparqlish.control.queryClausePreview");
jQuery.sap.require("sparqlish.control.serviceQueryMenu");
jQuery.sap.require("sap.ui.table.TreeTable");
jQuery.sap.require("sap.m.Toolbar");
jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.ui.core.IconPool");

jQuery.sap.declare("Components.queryForm.Component");

sap.ui.core.UIComponent.extend("Components.queryForm.Component", {
	metadata : {
		// manifest : "json",
		properties : {
			title : "string",
			serviceQueriesModel : "object",
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
Components.queryForm.Component.prototype.setServiceQueriesModel = function(serviceQueriesModel) {
	this.setProperty("serviceQueriesModel", serviceQueriesModel);
};

Components.queryForm.Component.prototype.createContent = function() {
	var self = this;

	this.oTable = new sap.ui.table.TreeTable({
		columns : [ new sap.ui.table.Column({
			label : "{i18nModel>queryForm.query}",
			template : new sparqlish.control.queryClause({
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
		}), new sap.ui.table.Column("results", {
			label : "{i18nModel>queryForm.resultsPreview}",
			template : new sparqlish.control.queryClausePreview({
				viewContext : {
					path : "viewModel>",
				},
				serviceCode : "LNW2"
			}),
			flexible : true,
			resizable : true,
			autoResizable : true
		}) ],
		// fixedColumnCount : 1,
		width : "100%",
		visibleRowCount : 1,
		selectionMode : sap.ui.table.SelectionMode.Single,
		enableColumnReordering : false,
		expandFirstLevel : true,
		// Only Odata.v2 expandTolevel : 3,
		toolbar : new sparqlish.control.serviceQueryMenu().setModel(sap.ui.getCore().getModel("serviceQueriesModel"), "serviceQueriesModel").attachPreview(
				function(oEvent) {
					self.previewResults(self);
				}).attachQueryChanged(function(oEvent) {
			sap.ui.core.routing.Router.getRouter("lensRouter").navTo("query", {
				service : oEvent.getParameter("service").code,
				querycode : oEvent.getParameter("query").code,
			});
		}).attachServiceChanged(function(oEvent) {
			// self.setService(oEvent.getParameter("service"), oEvent.getParameter("query"));
			sap.ui.core.routing.Router.getRouter("lensRouter").navTo("query", {
				service : oEvent.getParameter("service").code,
				querycode : oEvent.getParameter("query").code,
			});
		}).attachUndo(function(oEvent) {
			self.getQuery().undo();
			self.refreshQuery(self);
		}).attachSave(function(oEvent) {
			self.setQuery(oEvent.getParameter("query"));
		})
	// TODO need to provide i18n on component construction as it is required when i18n appears in path expressions
	}).setModel(sap.ui.getCore().getModel("i18nModel"), "i18nModel").setModel(sap.ui.getCore().getModel("datatypesModel"), "datatypesModel");
	// TODO add debug menu
	if (jQuery.sap.log.getLevel() === jQuery.sap.log.Level.DEBUG) {
		this.oDebug = new sap.m.ActionSelect().addButton(new sap.m.Button({
			text : "Query Model",
			press : function() {
				alert(JSON.stringify(self.getProperty("query").queryModel(), null, 2), {
					width : "50em"
				});
			}
		})).addButton(new sap.m.Button({
			text : "View Model",
			press : function() {
				alert(JSON.stringify(self.getProperty("query").viewModel(), null, 2), {
					width : "50em"
				});
			}
		})).addButton(new sap.m.Button({
			text : "SPARQL Query",
			press : function() {
				alert(self.getProperty("query").sparql(), {
					width : "50em"
				});
			}
		})).addButton(new sap.m.Button({
			text : "OData Query V2",
			press : function() {
				sap.m.MessageToast.show(self.getProperty("query").odataURI("V2"), {
					width : "50em"
				});
			}
		})).addButton(new sap.m.Button({
			text : "OData JSON Query V2",
			press : function() {
				var queryDetails = {};
				queryDetails.serviceUrl = self.getOdataModel().sServiceUrl + "/";
				queryDetails.resourcePath = self.getProperty("query").odataPath("V2");
				queryDetails.filter = self.getProperty("query").odataFilter("V2");
				queryDetails.expand = self.getProperty("query").odataExpand("V2");
				queryDetails.select = self.getProperty("query").odataSelect("V2");
				queryDetails.orderby = "";
				queryDetails.options = self.getProperty("query").odataOptions("V2");
				var fragment = {};
				fragment.position = "R1";
				fragment.title = "title";
				fragment.type = "Components.lensResultsForm|Components.lensResultsTable";
				fragment.query = self.getProperty("query").odataURI("V2");
				fragment.querydetails = queryDetails;
				alert(JSON.stringify(fragment, null, 2), {
					width : "100em"
				});
			}
		})).addButton(new sap.m.Button({
			text : "Execute OData Query V2",
			press : function() {
				sap.m.URLHelper.redirect(self.getOdataModel().sServiceUrl + "/" + self.getProperty("query").odataURI("V2"), true);
			}
		})).addButton(new sap.m.Button({
			text : "OData Query V4",
			press : function() {
				sap.m.MessageToast.show(self.getProperty("query").odataURI("V4"), {
					width : "50em"
				});
			}
		})).addButton(new sap.m.Button({
			text : "Execute OData Query V4",
			press : function() {
				sap.m.URLHelper.redirect(self.getOdataModel().sServiceUrl + "/" + self.getProperty("query").odataURI("V4"), true);
			}
		})).addButton(new sap.m.Button({
			text : "Get collections",
			press : function() {
				sap.m.URLHelper.redirect(self.getOdataModel().sServiceUrl, true);
			}
		})).addButton(new sap.m.Button({
			text : "Get metadata",
			press : function() {
				sap.m.URLHelper.redirect(self.getOdataModel().sServiceUrl + "/$metadata", true);
			}
		}));
		this.oTable.getToolbar().addContent(this.oDebug);

	}
	return this.oTable;
};
Components.queryForm.Component.prototype.clearResults = function(self) {
	self.oResultsModel = new sap.ui.model.json.JSONModel({});
	self.oTable.setModel(self.oResultsModel, "resultsModel");
	self.oTable.rerender();
};
// TODO delegate to Query object
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
	// TODO
	// var query = new Query(this.getOdataModel(), this.getProperty("query").oAST);
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
	self.oTable.rerender();
};
Components.queryForm.Component.prototype.setService = function(service, query, params) {
	var self = this;
	self.setProperty("params",params);
	if (jQuery.isEmptyObject( self.getQuery()) || (self.getQuery().oAST !== query) || (self.getService() !== service)) {
		var odataModel = utils.getCachedOdataModel(service, function() {
			self.oTable.setBusy(false);
		}, function(odataModel) {
			self.setProperty("service", service);
			self.setOdataModel(odataModel);
			self.oTable.setModel(odataModel, "odataModel");
			// Setup service list
			self.oTable.getToolbar().oServiceSelect.setSelectedKey(service.code);
			// Setup query list
			self.oTable.getToolbar().oQuerySelect.bindItems({
				path : "serviceQueriesModel>/services/" + service.code + "/queries",
				sorter : {
					path : "serviceQueriesModel>name"
				},
				template : new sap.ui.core.ListItem({
					key : "{serviceQueriesModel>code}",
					text : "{serviceQueriesModel>name}"
				})
			});
			// Delay this
			// self.oTable.getToolbar().oQuerySelect.setSelectedItem(self.oTable.getToolbar().oQuerySelect.getFirstItem());
			// Setup metamodel to drive the query composition before setting the query
			var oDataMetaModel = odataModel.getMetaModel();
			self.oTable.setBusy(true).setBusyIndicatorDelay(0);
			oDataMetaModel.loaded().then(function() {
				var oMetaModelEntityContainer;
				var oEntityContainerModel = new sap.ui.model.json.JSONModel();
				self.oTable.setModel(oDataMetaModel, "metaModel")
				oMetaModelEntityContainer = oDataMetaModel.getODataEntityContainer();
				self.oTable.setModel(self.getDatatypesModel(), "datatypesModel");
				self.oTable.getColumns()[1].setTemplate(new sparqlish.control.queryClausePreview({
					viewContext : {
						path : "viewModel>",
					},
					serviceCode : service.code
				}));
				oEntityContainerModel.setData(oMetaModelEntityContainer);
				// TODO this does not work so need to set Core
				self.oTable.setModel(oEntityContainerModel, "entityContainer");
				sap.ui.getCore().setModel(oEntityContainerModel, "entityContainer");
				self.oTable.setBusy(false);
				if (jQuery.isEmptyObject(query)) {
					query = service.queries[0];
				}
				self.oTable.getToolbar().oQuerySelect.setSelectedKey(query.code);
				self.setQuery(query);
				self.setProperty("queryCode",query.code)

			}, function() {
				self.oTable.setBusy(false);
				throw ("metamodel error");
			});
		});
	}
};

Components.queryForm.Component.prototype.setQuery = function(queryModel) {
	var self = this;
	try {
		var query = new Query(this.oTable.getModel("metaModel"), queryModel);
		// var query = new Query(this.getOdataModel(), queryModel);
		this.setProperty("query", query);

		var oQueryModel = new sap.ui.model.json.JSONModel();
		oQueryModel.setData(query.oAST);
		this.oTable.setModel(oQueryModel, "queryModel");

		this.oViewModel = new sap.ui.model.json.JSONModel();
		this.oViewModel.setData(query.oViewModel);
		this.oTable.setMinAutoRowCount(1);
		if (!jQuery.isEmptyObject(this.oViewModel.getData())) {
			this.oTable.setVisibleRowCount(this.oViewModel.getData().root.branchLength);
		} else {
			this.oTable.setVisibleRowCount(1);
		}
		this.oTable.setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Interactive);
		this.oTable.setModel(this.oViewModel, "viewModel");
		this.oTable.bindRows("viewModel>/");

		// this.oTable.setModel(this.getDataModel(), "dataModel");
		this.oResultsModel = new sap.ui.model.json.JSONModel({});
		this.oResultsModel.setData({});
		this.oTable.setModel(this.oResultsModel, "resultsModel");
	} catch (e) {
		sap.m.MessageToast.show(e);
	}
};
Components.queryForm.Component.prototype.previewResults = function(self) {
	var query = this.getProperty("query").init(this.getProperty("query").oAST);
	var serviceURL = utils.proxyUrl(this.getProperty("service").serviceUrl);
	var odataURL = serviceURL + "/" + query.odataURI() + "&$top=10";
	self.clearResults(self);
	self.oResultsModel = new sap.ui.model.json.JSONModel({});
	if (!jQuery.isEmptyObject(odataURL)) {
		self.oTable.setBusy(true);// .setBusyIndicatorDelay(0);
		self.oResultsModel.loadData(odataURL);
		self.oResultsModel.attachRequestCompleted(function(oEvent) {
			if (oEvent.getParameter("success")) {
				var nResults = 0;
				self.oResultsModel.sBindPath = null;
				var oData = self.oResultsModel.getData();
				if (jQuery.isEmptyObject(oData.d.results)) {
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
				self.oTable.rerender();

			}
			// TODO not required with Requestfailed handler
			// else {
			// sap.m.MessageToast.show(oEvent.getParameter("errorobject").statusText);
			// }
		}).attachRequestFailed(function(oEvent) {
			sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryForm.queryResponseError") + oEvent.getParameter("statusText"));
			self.oTable.setBusy(false);
		});
	} else {
		sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryForm.queryUndefined"));
	}
};