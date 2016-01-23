jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sparqlish.sparqlish")
jQuery.sap.require("sparqlish.control.queryClause");
jQuery.sap.require("sparqlish.control.queryClausePreview");
jQuery.sap.require("sparqlish.control.serviceQueryMenu");
jQuery.sap.require("sap.ui.table.TreeTable");
jQuery.sap.require("sap.m.Toolbar");
jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.ui.core.IconPool");

jQuery.sap.declare("Components.queryEditorPreviewTreeTable.Component");

sap.ui.core.UIComponent.extend("Components.queryEditorPreviewTreeTable.Component", {
	metadata : {
		// manifest : "json",
		properties : {
			title : "string",
			serviceQueriesModel : "object",
			odataModel : "object",
			queryModel : "object",
			query : "object",
			i18nModel : "object", // TODO or specific one for this component?
			datatypesModel : "object"
		}
	}
});
Components.queryEditorPreviewTreeTable.Component.prototype.setServiceQueriesModel = function(serviceQueriesModel) {
	this.setProperty("serviceQueriesModel", serviceQueriesModel);
	this.setService(serviceQueriesModel.getData().services[0].serviceUrl, serviceQueriesModel.getData().services[0].queries[0]);
}

Components.queryEditorPreviewTreeTable.Component.prototype.createContent = function() {
	var self = this;
	this.oTable = new sap.ui.table.TreeTable({
		columns : [ new sap.ui.table.Column({
			label : "Query",
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
			label : "Preview result",
			template : new sparqlish.control.queryClausePreview({
				viewContext : {
					path : "viewModel>"
				}
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
			self.setQuery(oEvent.getParameter("query"));
		}).attachServiceChanged(function(oEvent) {
			self.setService(oEvent.getParameter("service").serviceUrl, oEvent.getParameter("query"));
		}).attachUndo(function(oEvent) {
			self.getQuery().undo();
			self.refreshQuery(self);
		}).attachSave(function(oEvent) {
			self.setQuery(oEvent.getParameter("query"));
		}).attachSaveAs(function(oEvent) {
			self.setQuery(oEvent.getParameter("query"));
		})
	// TODO need to provide i18n on component construction as it is required when i18n appears in path expressions
	}).setModel(sap.ui.getCore().getModel("i18nModel"), "i18nModel").setModel(sap.ui.getCore().getModel("datatypesModel"), "datatypesModel");
	// TODO add debug menu
	if (jQuery.sap.log.getLevel() === jQuery.sap.log.Level.ERROR) {
		this.oDebug = new sap.m.ActionSelect({
			text : "View Model"
		}).addButton(new sap.m.Button({
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
				sap.m.MessageToast.show(self.getProperty("query").odataURI("V4"), {
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
				alert(JSON.stringify(queryDetails), {
					width : "50em"
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
Components.queryEditorPreviewTreeTable.Component.prototype.clearResults = function(self) {
	self.oResultsModel = new sap.ui.model.json.JSONModel({});
	self.oTable.setModel(self.oResultsModel, "resultsModel");
	self.oTable.rerender();
};
// TODO delegate to Query object
Components.queryEditorPreviewTreeTable.Component.prototype.resetQuery = function(self) {
	this.clearResults(this);
	this.setQuery({
		"_class" : "Query",
		"name" : "",
		"concept" : "Orders"
	});
};
Components.queryEditorPreviewTreeTable.Component.prototype.refreshQuery = function(self) {
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
Components.queryEditorPreviewTreeTable.Component.prototype.setService = function(serviceUrl, query) {
	var self = this;
	this.setOdataModel(new sap.ui.model.odata.ODataModel(serviceUrl, {
		// maxDataServiceVersion : "3.0",
		loadMetadataAsync : false
	}));
	this.oTable.setModel(this.getOdataModel(), "odataModel");

	var oDataMetaModel = this.getOdataModel().getMetaModel();
	var oMetaModelEntityContainer;
	self.oTable.setBusy(true).setBusyIndicatorDelay(0);
	var oEntityContainerModel = new sap.ui.model.json.JSONModel();
	oDataMetaModel.loaded().then(function() {
		self.oTable.setModel(oDataMetaModel, "metaModel")
		oMetaModelEntityContainer = oDataMetaModel.getODataEntityContainer();
		self.oTable.setModel(self.getDatatypesModel(), "datatypesModel");

		oEntityContainerModel.setData(oMetaModelEntityContainer);
		// TODO this does not work so need to set Core
		self.oTable.setModel(oEntityContainerModel, "entityContainer");
		sap.ui.getCore().setModel(oEntityContainerModel, "entityContainer");
		self.oTable.setBusy(false);
		self.setQuery(query);

	}, function() {
		self.oTable.setBusy(false);
		throw ("metamodel error");
	});
}
Components.queryEditorPreviewTreeTable.Component.prototype.setQuery = function(queryModel) {
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
Components.queryEditorPreviewTreeTable.Component.prototype.previewResults = function(self) {
	// TODO
	// var query = new Query(this.getOdataModel(), this.getProperty("query").oAST);
	var query = this.getProperty("query").init(this.getProperty("query").oAST);
	this.setProperty("query", query);
	self.clearResults(self);

	self.oResultsModel = new sap.ui.model.json.JSONModel({});
	handleResults = function(oData, response) {
		try {
			var nResults = 0;
			self.oResultsModel.sBindPath = null;
			self.oResultsModel.setData(oData);
			if (jQuery.isEmptyObject(oData.results)) {
				if (oData.length > 0) {
					self.oResultsModel.sBindPath = "/";
				} else {
					throw "No results returned";
				}
			} else {
				nResults = oData.results.length;
				self.oResultsModel.sBindPath = "/results/";
			}
			self.oTable.setBusy(false);

			self.oTable.setModel(self.oResultsModel, "resultsModel");
			self.oTable.rerender();

		} catch (err) {

		}
	};
	reportFailure = function(oData, response) {
		self.oTable.setBusy(false);
		sap.m.MessageToast.show(JSON.stringify(oData, null, 2));
	};
	self.oTable.setBusy(true).setBusyIndicatorDelay(0);
	// self.getProperty("odataModel").read("/" + query.odataURI(), {
	self.getProperty("odataModel").read("/" + query.odataURI() + "&$top=10", {
		success : handleResults,
		error : reportFailure
	});

};