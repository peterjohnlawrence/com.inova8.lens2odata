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
			width : "1000px"
		}), new sap.ui.table.Column("results", {
			label : "Preview result",
			template : new sparqlish.control.queryClausePreview({
				viewContext : {
					path : "viewModel>"
				}
			})
		}) ],
		fixedColumnCount : 1,
		visibleRowCount : 1,
		rowHeight : 50,
		selectionMode : sap.ui.table.SelectionMode.Single,
		enableColumnReordering : false,
		expandFirstLevel : true,
		expandTolevel : 3,
		toolbar : new sparqlish.control.serviceQueryMenu().setModel(sap.ui.getCore().getModel("serviceQueriesModel"), "serviceQueriesModel").attachPreview(
				function(oEvent) {
					self.previewResults(self);
				}).attachQueryChanged(function(oEvent) {
			self.setQuery(oEvent.getParameter("query"));
		}).attachServiceChanged(function(oEvent) {
			self.setOdataModel(new sap.ui.model.odata.ODataModel(oEvent.getParameter("service").serviceUrl, {
				//json : true,
				maxDataServiceVersion : "3.0"
			}));
			self.setQuery(oEvent.getParameter("query"));
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
	if (jQuery.sap.log.getLevel() === jQuery.sap.log.Level.DEBUG) {
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
				sap.m.MessageToast.show(self.getProperty("query").odataURI("V2"), {
					width : "50em"
				});
			}
		})).addButton(new sap.m.Button({
			text : "Execute OData Query V2",
			press : function() {
				window.open(self.getOdataModel().sServiceUrl + "/" + self.getProperty("query").odataURI("V2") );//+ '&$format=json');
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
				window.open(self.getOdataModel().sServiceUrl + "/" + self.getProperty("query").odataURI("V4"));
			}
		})).addButton(new sap.m.Button({
			text : "Get collections",
			press : function() {
				window.open(self.getOdataModel().sServiceUrl);
			}
		})).addButton(new sap.m.Button({
			text : "Get metadata",
			press : function() {
				window.open(self.getOdataModel().sServiceUrl + "/$metadata");
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
Components.queryEditorPreviewTreeTable.Component.prototype.setQuery = function(queryModel) {
	var query = new Query(this.getOdataModel(), queryModel);
	this.setProperty("query", query);
	// TODO do we really have to reset these
	this.oTable.setModel(this.getOdataModel(), "odataModel");
	this.oTable.setModel(this.getOdataModel().getMetaModel(), "metaModel");
	this.oTable.setModel(this.getDatatypesModel(), "datatypesModel");

	var oMetaModelEntityContainer = this.getOdataModel().getMetaModel().getODataEntityContainer();
	var oEntityContainerModel = new sap.ui.model.json.JSONModel();
	oEntityContainerModel.setData(oMetaModelEntityContainer);
	// TODO this does not work so need to set Core
	this.oTable.setModel(oEntityContainerModel, "entityContainer");
	sap.ui.getCore().setModel(oEntityContainerModel, "entityContainer")

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

			self.oTable.setModel(self.oResultsModel, "resultsModel");
			self.oTable.rerender();

		} catch (err) {

		}
	};
	reportFailure = function(oData, response) {
		sap.m.MessageToast.show(JSON.stringify(oData, null, 2));
	};
	self.getProperty("odataModel").read("/" + query.odataURI(), {
		success : handleResults,
		error : reportFailure
	});

};