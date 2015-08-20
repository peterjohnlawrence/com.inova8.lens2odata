jQuery.sap.require("sap.ui.core.util.MockServer");

var sUri = "/mock/";
var oMockServer = new sap.ui.core.util.MockServer({
	rootUri : sUri
});
var sMetadataUrl = "test-resources/northwind.v2.metadata.xml";
oMockServer.simulate(sMetadataUrl);
oMockServer.start();

var oDataModel = new sap.ui.model.odata.ODataModel(sUri, true);
var oMetaModel = oDataModel.getMetaModel();
sap.ui.getCore().setModel(oMetaModel, "metaModel");

// TODO this should be part of the control
var oMetaModelEntityContainer = oMetaModel.getODataEntityContainer();
var oEntityContainerModel = new sap.ui.model.json.JSONModel();
oEntityContainerModel.setData(oMetaModelEntityContainer);
sap.ui.getCore().setModel(oEntityContainerModel, "entityContainer");

// set up models
var i18nModel = new sap.ui.model.resource.ResourceModel({
	bundleUrl : [ ".", "i18n/messageBundle.properties" ].join("/")
});
sap.ui.getCore().setModel(i18nModel, "i18nModel");

var oQueryModel = new sap.ui.model.json.JSONModel();
oQueryModel.loadData("test-resources/sparqlish.qunit.odata.json", null, false);
sap.ui.getCore().setModel(oQueryModel, "queryModel");

// datatypesModel>
var oDatatypesModel = new sap.ui.model.json.JSONModel();
oDatatypesModel.loadData("test-resources/datatypesModel.json", null, false);
sap.ui.getCore().setModel(oDatatypesModel, "datatypesModel");

// var oConceptMenu = new sparqlish.control.conceptMenu();
// oConceptMenu.placeAt("uiConceptMenu");

var oFilterLink = new sparqlish.control.iconLink({
	text : "test",
	icon : "add-filter",
	tooltip : "Add a filter value",
	visible : true,
	press : function(oEvent) {
		alert("add filter");
	}
});
oFilterLink.placeAt("uiFilterLink");

var oExtendLink = new sparqlish.control.iconLink({
	text : "test",
	icon : "add-process",
	tooltip : "Add a filter value",
	visible : true,
	press : function(oEvent) {
		alert("add clause");
	}
});
oExtendLink.placeAt("uiExtendLink");

var oPropertyMenu = new sparqlish.control.propertyMenu();
oPropertyMenu.setModel(oQueryModel, "queryModel");
oPropertyMenu.setModel(oMetaModel, "metaModel");
oPropertyMenu.bindElement("queryModel>/queries/9/clauses/conjunctionClauses/1/clause");
oPropertyMenu.placeAt("uiPropertyMenu");

var oIncludeOptionalIgnore = new sparqlish.control.includeOptionalIgnore();
oIncludeOptionalIgnore.setModel(oQueryModel, "queryModel");
oIncludeOptionalIgnore.setModel(oMetaModel, "metaModel");
oIncludeOptionalIgnore.bindElement("queryModel>/queries/9/clauses/conjunctionClauses/1/clause");
oIncludeOptionalIgnore.placeAt("uiIncludeOptionalIgnore");

var oQueryControl1 = new sparqlish.control.queryControl();
oQueryControl1.setModel(oQueryModel, "queryModel");
oQueryControl1.setModel(oMetaModel, "metaModel");
oQueryControl1.bindElement("queryModel>/queries/9/");
oQueryControl1.placeAt("uiQueryControl1");

var oQueryControl2 = new sparqlish.control.queryControl();
oQueryControl2.setModel(oQueryModel, "queryModel");
oQueryControl2.setModel(oMetaModel, "metaModel");
oQueryControl2.bindElement("queryModel>/queries/9/clauses/conjunctionClauses/1/clause");
oQueryControl2.placeAt("uiQueryControl2");

var oQueryControl3 = new sparqlish.control.queryControl();
oQueryControl3.setModel(oQueryModel, "queryModel");
oQueryControl3.setModel(oMetaModel, "metaModel");
oQueryControl3.bindElement("queryModel>/queries/9/clauses/conjunctionClauses/1/clause/propertyClause/clauses/clause");
oQueryControl3.placeAt("uiQueryControl3");

var oQueryControl4 = new sparqlish.control.queryControl();
oQueryControl4.setModel(oQueryModel, "queryModel");
oQueryControl4.setModel(oMetaModel, "metaModel");
oQueryControl4.bindElement("queryModel>/queries/9/clauses/conjunctionClauses/1");
oQueryControl4.placeAt("uiQueryControl4");

var oConceptClauseControl = new sparqlish.control.conceptClauseControl();
oConceptClauseControl.setModel(oQueryModel, "queryModel");
oConceptClauseControl.setModel(oMetaModel, "metaModel");
oConceptClauseControl.bindElement("queryModel>/queries/9/");
oConceptClauseControl.placeAt("uiConceptClauseControl");

var oClauseControl1 = new sparqlish.control.clauseControl();
oClauseControl1.setModel(oQueryModel, "queryModel");
oClauseControl1.setModel(oMetaModel, "metaModel");
oClauseControl1.bindElement("queryModel>/queries/9/clauses/conjunctionClauses/1/clause");
oClauseControl1.placeAt("uiClauseControl1");

var oClauseControl2 = new sparqlish.control.clauseControl();
oClauseControl2.setModel(oQueryModel, "queryModel");
oClauseControl2.setModel(oMetaModel, "metaModel");
oClauseControl2.bindElement("queryModel>/queries/9/clauses/conjunctionClauses/1/clause/propertyClause/clauses/clause");
oClauseControl2.placeAt("uiClauseControl2");

var oConceptClauseInitModel = new sap.ui.model.json.JSONModel();
oConceptClauseInitModel.setData({
	"_class" : "Query",
	"name" : "Test: Order query",
	"concept" : "[enter concept]",
	"conceptFilters" : []
});
var oConceptClauseInitControl = new sparqlish.control.conceptClauseControl();
oConceptClauseInitControl.setModel(oConceptClauseInitModel, "queryModel");
oConceptClauseInitControl.setModel(oMetaModel, "metaModel");
oConceptClauseInitControl.bindElement("queryModel>/");
oConceptClauseInitControl.placeAt("uiConceptClauseInitControl");

var oClauseInitModel = new sap.ui.model.json.JSONModel();
oClauseInitModel.setData({
	"_class" : "Query",
	"name" : "Test: Order query",
	"concept" : "Orders",
	"conceptFilters" : [],
	"clauses" : {
		"_class" : "Clauses",
		"clause" : {
			"_class" : "Clause",
			"ignore" : false,
			"optional" : true,
			"includeOptionalIgnore" : "include",
			"concept" : "Orders",
			"propertyClause" : {}
		}
	}
});
var oClauseInitControl = new sparqlish.control.clauseControl();
oClauseInitControl.setModel(oClauseInitModel, "queryModel");
oClauseInitControl.setModel(oMetaModel, "metaModel");
oClauseInitControl.bindElement("queryModel>/clauses/clause/");
oClauseInitControl.placeAt("uiClauseInitControl");

var oConjunctionClauseInitModel = new sap.ui.model.json.JSONModel();
oConjunctionClauseInitModel.setData(

{
	"_class" : "Query",
	"name" : "Test: Order query",
	"concept" : "Orders",
	"conceptFilters" : [],
	"clauses" : {
		"_class" : "Clauses",
		"clause" : {
			"_class" : "Clause",
			"ignore" : false,
			"optional" : true,
			"includeOptionalIgnore" : "include",
			"concept" : "Orders",
			"propertyClause" : {}
		}
	},
	"conjunctionClauses" : [ {
		"_class" : "ConjunctionClause",
		"conjunction" : "or",
		"clause" : {}
	}
	]
}

);
var oConjunctionClauseInitControl = new sparqlish.control.conjunctionClauseControl();
oConjunctionClauseInitControl.setModel(oConjunctionClauseInitModel, "queryModel");
oConjunctionClauseInitControl.setModel(oMetaModel, "metaModel");
oConjunctionClauseInitControl.bindElement("queryModel>/conjunctionClause/");
oConjunctionClauseInitControl.placeAt("uiConjunctionClauseInitControl");

var oQueryInitModel = new sap.ui.model.json.JSONModel();
oQueryInitModel.setData({
	"_class" : "Query",
	"concept" : "[select concept]"
});
var oQueryInitControl = new sparqlish.control.queryControl();
oQueryInitControl.setModel(oQueryInitModel, "queryModel");
oQueryInitControl.setModel(oMetaModel, "metaModel");
oQueryInitControl.bindElement("queryModel>/");
oQueryInitControl.placeAt("uiQueryInitControl");