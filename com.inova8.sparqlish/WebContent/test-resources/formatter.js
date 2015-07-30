// Query list
var oComboBox = sap.ui.jsfragment("sparqlish.query.queryList", this);
oComboBox.placeAt("uiMenu");

// Preview action
var oButton = sap.ui.jsfragment("sparqlish.query.preview", this);
oButton.placeAt("uiPreview");

// Query action
var oButton = sap.ui.jsfragment("sparqlish.query.query", this);
oButton.placeAt("uiQuery");

// Facet query menu
var oFacetQueryMenu = sap.ui.jsfragment("sparqlish.menu.facetQuery", this);

// Concept menu
var oEditConcept = sap.ui.jsfragment("sparqlish.menu.editConcept", this.oTable);

// Clause menu
var oEditClause = sap.ui.jsfragment("sparqlish.menu.editClause", this.oTable);

// Label menu
var oEditLabel = sap.ui.jsfragment("sparqlish.menu.editLabel", this.oTable);

var oQueryModel = new sap.ui.model.json.JSONModel();
oQueryModel.setData(queryAST.queries[9]);

var oConceptClauseControl = new sparqlish.control.conceptClauseControl();
oConceptClauseControl.setModel(oQueryModel, "queryModel");
oConceptClauseControl.bindElement("queryModel>/");
// oConceptClauseControl.bindProperty("conceptClause","queryModel>/");
oConceptClauseControl.placeAt("uiConceptClauseControl");

var oConceptClauseInitModel = new sap.ui.model.json.JSONModel();
oConceptClauseInitModel.setData({
	"_class" : "Query",
	"name" : "Test: Order query"
});
var oConceptClauseInitControl = new sparqlish.control.conceptClauseControl();
oConceptClauseInitControl.setModel(oConceptClauseInitModel, "queryModel");
oConceptClauseInitControl.bindElement("queryModel>/");
oConceptClauseInitControl.bindProperty("conceptClause", "queryModel>/");
oConceptClauseInitControl.placeAt("uiConceptClauseInitControl");

// var oObjectPropertyClauseModel = new sap.ui.model.json.JSONModel();
// oObjectPropertyClauseModel.setData(queryAST.queries[9].clauses.conjunctionClauses[1].clause);

var oObjectPropertyClauseControl = new sparqlish.control.objectPropertyClauseControl();
oObjectPropertyClauseControl.setModel(oQueryModel, "queryModel");
oObjectPropertyClauseControl.bindElement("queryModel>/clauses/conjunctionClauses/1/clause");
// oObjectPropertyClauseControl.bindProperty("objectPropertyClause","queryModel>/clauses/conjunctionClauses/1/clause/propertyClause");
oObjectPropertyClauseControl.placeAt("uiObjectPropertyClauseControl");

var oObjectPropertyClauseInitModel = new sap.ui.model.json.JSONModel();
oObjectPropertyClauseInitModel.setData({
	propertyClause : {
		"_class" : "ObjectPropertyClause",
		"propertyClause" : {
			"_class" : "ObjectPropertyClause",
			"objectProperty" : "[select object property]",
			"objectPropertyFilters" : {}
		}
	}
});
var oObjectPropertyClauseInitControl = new sparqlish.control.objectPropertyClauseControl();
oObjectPropertyClauseInitControl.setModel(oObjectPropertyClauseInitModel, "queryModel");
oObjectPropertyClauseInitControl.bindElement("queryModel>/");
oObjectPropertyClauseInitControl.bindProperty("objectPropertyClause", "queryModel>/");
oObjectPropertyClauseInitControl.placeAt("uiObjectPropertyClauseInitControl");

var oDataPropertyClauseModel = new sap.ui.model.json.JSONModel();
oDataPropertyClauseModel.setData(queryAST.queries[9].clauses.clause);
var oDataPropertyClauseControl = new sparqlish.control.dataPropertyClauseControl();
oDataPropertyClauseControl.setModel(oQueryModel, "queryModel");
oDataPropertyClauseControl.bindElement("queryModel>/clauses/clause/propertyClause/");
// oObjectPropertyClauseControl.bindElement("queryModel>/propertyClause");
// oDataPropertyClauseControl.bindProperty("dataPropertyClause","queryModel>/propertyClause");
oDataPropertyClauseControl.placeAt("uiDataPropertyClauseControl");

var oDataPropertyClauseInitModel = new sap.ui.model.json.JSONModel();
oDataPropertyClauseInitModel.setData({
	propertyClause : {
		"_class" : "DataPropertyClause"
	}
});
var oDataPropertyClauseInitControl = new sparqlish.control.dataPropertyClauseControl();
oDataPropertyClauseInitControl.setModel(oDataPropertyClauseInitModel, "queryModel");
oDataPropertyClauseInitControl.bindElement("queryModel>/propertyClause/");
// oDataPropertyClauseInitControl.bindProperty("dataPropertyClause","queryModel>/propertyClause");
oDataPropertyClauseInitControl.placeAt("uiDataPropertyClauseInitControl");

var oClausesModel = new sap.ui.model.json.JSONModel();
oClausesModel.setData(queryAST.queries[9]);
var oClausesControl = new sparqlish.control.clausesControl();
oClausesControl.setModel(oClausesModel, "clauses");
oClausesControl.setModel(i18nModel, "i18n");
oClausesControl.bindProperty("clauses", "clauses>/clauses");// .bindElement("/clauses");//
oClausesControl.placeAt("uiClausesControl");