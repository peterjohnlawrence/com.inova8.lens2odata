jQuery.sap.declare("Queries");
jQuery.sap.declare("Query");
jQuery.sap.declare("Clauses");
jQuery.sap.declare("Clause");
jQuery.sap.declare("ConjunctionClause");
jQuery.sap.declare("PropertyClause");
jQuery.sap.declare("DataPropertyClause");
jQuery.sap.declare("ObjectPropertyClause");
jQuery.sap.declare("InverseObjectPropertyClause");
jQuery.sap.declare("OperationClause");
jQuery.sap.declare("Filters");
jQuery.sap.declare("Filter");
jQuery.sap.declare("ConjunctionFilter");
var sPrefix = "?v";
var sLabelPostfix = "_label";
sap.ui.base.Object.extend("Queries", {
	constructor : function(oAST) {
		this.oAST = oAST;
		this.oQueries = [];
		try {
			if (oAST["queries"] != null) {
				for (var i = 0; i < oAST["queries"].length; i++) {
					this.oQueries.push(new Query(oAST["queries"][i], "/queries/" + i + "/"));
				}
			} else {
				this.oQueries = null;
			}
		} catch (e) {
			jQuery.sap.log.error(e);
		}
	}
});
sap.ui.base.Object.extend("Query", {
	constructor : function(oAST, sPath) {
		this.oAST = oAST;
		this.oClauseReferences = [];
		this.oViewModel = null;
		try {
			if (oAST["_class"] != "Query")
				throw "notQueryException";
			this.sName = oAST["name"];
			this.sPath = sPath;
			this.oContext = {
				sSubject : "",
				sObject : "",
				iLevel : 0
			};
			this.sConcept = oAST["concept"];
			this.sLabel = (oAST["label"] == undefined) ? labelFromURI(this.sConcept) : oAST["label"];
			this.bHidden = (oAST["hidden"] == undefined) ? false : oAST["hidden"];

			if (oAST["conceptFilters"] != null) {
				this.oConceptFilters = oAST["conceptFilters"];
			} else {
				this.oConceptFilters = null;
			}
			if (oAST["clauses"] != null) {
				this.oClauses = new Clauses(oAST["clauses"], this.oContext);
			} else {
				this.oClauses = null;
			}
			// Now prep the viewmodel
			this.oViewModel = this.viewModel();
			// now prep the sparql query
			var sContext = sPrefix + this.oContext.sSubject;
			var sValues = objectFilterSparql(sContext, this.oConceptFilters);
			if (this.oClauses != null) {
				this.sWhere = "WHERE{\n{" + sContext + " a " + this.sConcept + ". OPTIONAL{" + sContext + " rdfs:label " + sContext + sLabelPostfix + "}" + sValues+ "}\n"
						+ this.oClauses.sparql() + "\n}";
			} else {
				this.sWhere = "WHERE{\n{" + sContext + " a " + this.sConcept + ". OPTIONAL{" + sContext + " rdfs:label " + sContext + sLabelPostfix + "}" + sValues+ "}\n" + "}";
			}

		} catch (e) {
			jQuery.sap.log.error(e);
		}
	},
	selectDistinct : function() {
		return "SELECT DISTINCT " + sPrefix + this.oContext.sSubject + " " + this.sNameVariable;
	},
	facetWhere : function() {
		return " WHERE {" + this.facetSparql() + "}";
	},
	facetQuery : function() {
		return this.selectDistinct() + this.facetWhere();
	},
	sparql : function() {
		var sContext = sPrefix + this.oContext.sSubject;
		var sValues = objectFilterSparql(sContext, this.oConceptFilters);
		if (this.oClauses != null) {
			return ( "SELECT * \nWHERE{\n{" + sContext + " a " + this.sConcept + ". OPTIONAL{" + sContext + " rdfs:label " + sContext
					+ sLabelPostfix + "}" + sValues+ "}\n" + this.oClauses.sparql() + "\n}");
		} else {
			return ("SELECT * \nWHERE{\n{" + sContext + " a " + this.sConcept + ". OPTIONAL{" + sContext + " rdfs:label " + sContext
					+ sLabelPostfix + "}" + sValues+ "}\n" + "}");
		}
	},
	facetSparql : function() {
		var sContext = sPrefix + this.oContext.sSubject;
		var sValues = objectFilterSparql(sContext, this.oConceptFilters);
		if (this.oClauses != null) {
			return ("{" + sContext + " a " + this.sConcept + ". OPTIONAL{" + sContext + " rdfs:label " + sContext
					+ sLabelPostfix + "}" + sValues+ "}\n" + this.oClauses.sparql() );
		} else {
			return ("{" + sContext + " a " + this.sConcept + ". OPTIONAL{" + sContext + " rdfs:label " + sContext
					+ sLabelPostfix + "}" + sValues+ "}\n" );
		}
	},
	sparqlish : function() {
		if (this.oConceptFilters != null) {
			return "Find " + labelFromURI(this.sConcept) + " in " + this.oConceptFilters.toString();
		} else {
			return "Find " + labelFromURI(this.sConcept);
		}
	},
	viewModel : function() {
		try {
			this.oClauseReferences[0] = this;
			var oViewModel = {
				"root" : {}
			};
			if (this.oClauses != null) {
				extendj(oViewModel.root, this.oClauses.viewModel(this.sPath, this.oClauseReferences));
			}
			extendj(oViewModel.root, {
				"path" : this.sPath,
				"sparqlish" : this.sparqlish(),
				"label" : this.sLabel,
				"hidden" : this.bHidden,
				"variable" : sPrefix,
				"nameVariable" : sPrefix + sLabelPostfix,
				"index" : 0
			});
			return oViewModel;
		} catch (e) {
			jQuery.sap.log.error(e);
		}
	}
});
sap.ui.base.Object.extend("Clauses", {
	constructor : function(oAST, oContext) {
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "Clauses")
				throw "notClausesException";
			var oFirstContext = {
				sSubject : oContext.sSubject,
				sObject : oContext.sSubject + "_" + 0,
				iLevel : oContext.iLevel
			};
			this.oClause = new Clause(oAST["clause"], oFirstContext);
			if (oAST["conjunctionClauses"] != null) {
				this.oConjunctionClauses = [];
				for (var i = 0; i < oAST["conjunctionClauses"].length; i++) {
					var oNewContext = {
						sSubject : oContext.sSubject,
						sObject : oContext.sSubject + "_" + (i + 1),
						iLevel : oContext.iLevel
					};
					this.oConjunctionClauses[i] = new ConjunctionClause(oAST["conjunctionClauses"][i], oNewContext);
				}
			} else {
				this.oConjunctionClauses = null;
			}
		} catch (e) {
			jQuery.sap.log.error(e);
		}
	},
	sparql : function() {
		var sSparql = this.oClause.sparql();
		if (this.oConjunctionClauses != null) {
			for (var i = 0; i < this.oConjunctionClauses.length; i++) {
				sSparql = sSparql + this.oConjunctionClauses[i].sparql();
			}
			return sSparql;
		} else {
			return sSparql;
		}
	},
	sparqlish : function() {
		var sSparqlish = this.oClause.sparqlish();
		if (this.oConjunctionClauses != null) {
			for (var i = 0; i < this.oConjunctionClauses.length; i++) {
				sSparqlish = sSparqlish + this.oConjunctionClauses[i].sparqlish();
			}
			return sSparqlish;
		} else {
			return sSparqlish;
		}
	},
	viewModel : function(sPath, oClauseReferences) {
		var oViewModel = {};
		if (this.oConjunctionClauses != null) {
			for (var i = 0; i < this.oConjunctionClauses.length; i++) {
				var iIndex = i + 1;
				var oConjunctionClause = {};
				oConjunctionClause[iIndex] = this.oConjunctionClauses[i].viewModel(sPath + "clauses/conjunctionClauses/" + (iIndex - 1) + "/", oClauseReferences);
				extendj(oViewModel, oConjunctionClause);
			}
		}
		extendj(oViewModel, {
			"0" : this.oClause.viewModel(sPath + "clauses/clause/", oClauseReferences)
		});
		return oViewModel;
	}
});
sap.ui.base.Object.extend("Clause", {
	constructor : function(oAST, oContext) {
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "Clause")
				throw "notClauseException";
			this.bIgnore = (oAST["ignore"] == "true") ? true : false;
			this.bOptional = (oAST["optional"] == "true") ? true : false;
			this.oPropertyClause = new PropertyClause(oAST["propertyClause"], oContext);
			this.sLabel = (oAST["label"] == undefined) ? (this.oPropertyClause.sLabel) : oAST["label"];
			this.bHidden = (oAST["hidden"] == undefined) ? (this.oPropertyClause.bHidden) : oAST["hidden"];
		} catch (e) {
			jQuery.sap.log.error(e);
		}
	},
	selectDistinct : function() {
		return "SELECT DISTINCT " + sPrefix + this.oContext.sObject + " " + this.sNameVariable;
	},
	selectRange : function() {
		var sVariable = sPrefix + this.oContext.sObject + " " + this.sNameVariable;
		return "SELECT MIN( " + sVariable + ") MAX(" + sVariable + ")";
	},
	facetWhere : function() {
		return " WHERE {" + this.facetSparql() + "}";
	},
	facetQuery : function() {
		return this.selectDistinct() + this.facetWhere();
	},
	sparql : function() {
		var sSparql = repeatString("\t", this.oContext.iLevel);
		sSparql = sSparql + (this.bIgnore ? "#" : "");
		sSparql = sSparql + (this.bOptional ? "OPTIONAL" : "");
		sSparql = sSparql + this.oPropertyClause.sparql();
		return sSparql;
	},
	facetSparql : function() {
		return this.oPropertyClause.facetSparql();
	},
	sparqlish : function() {
		var sSparqlish = "with ";
		sSparqlish = sSparqlish + (this.bIgnore ? "IGNORE " : "");
		sSparqlish = sSparqlish + (this.bOptional ? "optionally " : "");
		sSparqlish = sSparqlish + this.oPropertyClause.sparqlish();
		return sSparqlish;
	},
	viewModel : function(sPath, oClauseReferences) {
		var iIndex = oClauseReferences.length;
		oClauseReferences.push(this);
		var oViewModel = {};
		extendj(oViewModel, this.oPropertyClause.viewModel(sPath + "clause/propertyClause/", oClauseReferences));
		this.sNameVariable = "";
		if (this.oPropertyClause.oPropertyClause.sDataProperty == undefined) {
			// assume it must be an objectProperty
			this.sNameVariable = sPrefix + this.oContext.sObject + sLabelPostfix;
		}
		extendj(oViewModel, {
			"path" : sPath,
			"sparqlish" : this.sparqlish(),
			"label" : this.sLabel,
			"hidden" : this.bHidden,
			"variable" : sPrefix + this.oContext.sObject,
			"nameVariable" : this.sNameVariable,
			"index" : iIndex
		});
		return oViewModel;
	}
});
sap.ui.base.Object.extend("ConjunctionClause", {
	constructor : function(oAST, oContext) {
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "ConjunctionClause")
				throw "notConjunctionClauseException";
			this.sConjunction = oAST["conjunction"];
			this.oClause = new Clause(oAST["clause"], oContext);
		} catch (e) {
			jQuery.sap.log.error(e);
		}
	},
	sparql : function() {
		return (clauseConjunction(this.sConjunction) + "\n" + this.oClause.sparql());
	},
	sparqlish : function() {
		return (this.sConjunction + " " + this.oClause.sparqlish());
	},
	viewModel : function(sPath, oClauseReferences) {
		var oViewModel = {};
		extendj(oViewModel, this.oClause.viewModel(sPath, oClauseReferences));
		extendj(oViewModel, {
			"path" : sPath,
			"sparqlish" : this.sparqlish()
		});
		return oViewModel;
	}
});
sap.ui.base.Object.extend("PropertyClause", {
	constructor : function(oAST, oContext) {
		this.oAST = oAST;
		this.oContext = oContext;
		this.bHidden = false;

		try {
			if (oAST["_class"] == "DataPropertyClause") {
				this.oPropertyClause = new DataPropertyClause(oAST, oContext);
				this.sLabel = labelFromURI(this.oPropertyClause.sDataProperty);
			} else if (oAST["_class"] == "ObjectPropertyClause") {
				this.oPropertyClause = new ObjectPropertyClause(oAST, oContext);
				this.sLabel = labelFromURI(this.oPropertyClause.sObjectProperty);
			} else if (oAST["_class"] == "InverseObjectPropertyClause") {
				this.oPropertyClause = new InverseObjectPropertyClause(oAST, oContext);
				this.sLabel = labelFromURI(this.oPropertyClause.sInverseObjectProperty);
			}  else if (oAST["_class"] == "OperationClause") {
				this.oPropertyClause = new OperationClause(oAST, oContext);
				this.sLabel = labelFromURI(this.oPropertyClause.sOperationProperty);
			}else
				throw "notPropertyClauseException";
		} catch (e) {
			jQuery.sap.log.error(e);
		}
	},
	sparql : function() {
		return (this.oPropertyClause.sparql());
	},
	facetSparql : function() {
		return this.oPropertyClause.facetSparql();
	},
	sparqlish : function() {
		return (this.oPropertyClause.sparqlish());
	},
	viewModel : function(sPath, oClauseReferences) {
		return this.oPropertyClause.viewModel(sPath, oClauseReferences);
	}
});
sap.ui.base.Object.extend("DataPropertyClause", {
	constructor : function(oAST, oContext) {
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "DataPropertyClause")
				throw "notDataPropertyClauseException";
			this.sDataProperty = oAST["dataProperty"];
			if (oAST["filters"] != null) {
				this.oFilters = new Filters(oAST["filters"], oContext);
			} else {
				this.oFilters = null;
			}

		} catch (e) {
			jQuery.sap.log.error(e);
		}
	},
	sparql : function() {
		var sSparql = "{" + sPrefix + this.oContext.sSubject + " " + this.sDataProperty + " " + sPrefix /* ?o */+ this.oContext.sObject + " . "
		if (this.oFilters != null) {
			return sSparql + this.oFilters.sparql() + "}";
		} else {
			return sSparql + "}";
		}
	},
	facetSparql : function() {
		return this.sparql();
	},
	sparqlish : function() {
		var sSparqlish = labelFromURI(this.sDataProperty);
		if (this.oFilters != null) {
			return sSparqlish + this.oFilters.sparqlish();
		} else {
			return sSparqlish;
		}
	},
	viewModel : function(sPath, oClauseReferences) {
		return {};
	}
});
sap.ui.base.Object.extend("Filters", {
	constructor : function(oAST, oContext) {
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "Filters")
				throw "notFiltersException";
			this.oFilter = new Filter(oAST["filter"], oContext);

			if (oAST["conjunctionFilters"] != null) {
				this.oConjunctionFilters = [];
				for (var i = 0; i < oAST["conjunctionFilters"].length; i++) {
					this.oConjunctionFilters[i] = new ConjunctionFilter(oAST["conjunctionFilters"][i], oContext);
				}
			} else {
				this.oConjunctionFilters = null;
			}

		} catch (e) {
			jQuery.sap.log.error(e);
		}
	},
	sparql : function() {
		var sSparql = "FILTER(" + this.oFilter.sparql();
		if (this.oConjunctionFilters != null) {
			for (var i = 0; i < this.oConjunctionFilters.length; i++) {
				sSparql = sSparql + this.oConjunctionFilters[i].sparql();
			}
			return sSparql + ")";
		} else {
			return sSparql + ")";
		}
	},
	sparqlish : function() {
		var sSparqlish = " " + this.oFilter.sparqlish();
		if (this.oConjunctionFilters != null) {
			for (var i = 0; i < this.oConjunctionFilters.length; i++) {
				sSparqlish = sSparqlish + this.oConjunctionFilters[i].sparqlish();
			}
			return sSparqlish;
		} else {
			return sSparqlish;
		}
	}
});
sap.ui.base.Object.extend("Filter", {
	constructor : function(oAST, oContext) {
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "Filter")
				throw "notFilterException";
			this.sCondition = oAST["condition"];
			this.sValue = oAST["value"];
			this.sDatatype = oAST["datatype"];
		} catch (e) {
			jQuery.sap.log.error(e);
		}
	},
	sparql : function() {
		var sSparql = filterCondition(sPrefix /* ?o */+ this.oContext.sObject, this.sCondition, this.sValue, this.sDatatype);
		return sSparql;
	},
	sparqlish : function() {
		var sSparqlish = this.sCondition + " " + this.sValue;
		return sSparqlish;
	}
});
sap.ui.base.Object.extend("ConjunctionFilter", {
	constructor : function(oAST, oContext) {
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "ConjunctionFilter")
				throw "notConjunctionFilterException";
			this.sFilterConjunction = oAST["filterConjunction"];
			this.oFilter = new Filter(oAST["filter"], oContext);
		} catch (e) {
			jQuery.sap.log.error(e);
		}
	},
	sparql : function() {
		return " " + filterConjunction(this.sFilterConjunction) + " " + this.oFilter.sparql();
	},
	sparqlish : function() {
		return " " + this.sFilterConjunction + " " + this.oFilter.sparqlish();
	}
});
sap.ui.base.Object.extend("ObjectPropertyClause", {
	constructor : function(oAST, oContext) {
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "ObjectPropertyClause")
				throw "notObjectPropertyClauseException";
			this.sObjectProperty = oAST["objectProperty"];
			if (oAST["objectPropertyFilters"] != null) {
				this.oObjectPropertyFilters = oAST["objectPropertyFilters"];
			} else {
				this.oObjectPropertyFilters = null;
			}

			if (oAST["clauses"] != null) {
				var oNewContext = {
					sSubject : oContext.sObject,
					sObject : oContext.sObject + "_",
					iLevel : oContext.iLevel + 1
				};
				this.oClauses = new Clauses(oAST["clauses"], oNewContext);
			} else {
				this.oClauses = null;
			}
		} catch (e) {
			jQuery.sap.log.error(e);
		}
	},
	sparql : function() {
		var sSparql = "{" + sPrefix + this.oContext.sSubject + " " + this.sObjectProperty + " " + sPrefix + this.oContext.sObject + ". OPTIONAL{" + sPrefix
				+ this.oContext.sObject + " rdfs:label " + sPrefix + this.oContext.sObject + sLabelPostfix + "}";
		sSparql = sSparql + objectFilterSparql(sPrefix + this.oContext.sObject, this.oObjectPropertyFilters);
		if (this.oClauses != null) {
			return sSparql + "\n" + this.oClauses.sparql() + "}";
		} else {
			return sSparql + "}";
		}
	},
	facetSparql : function() {
		return "{" + sPrefix + this.oContext.sSubject + " " + this.sObjectProperty + " " + sPrefix + this.oContext.sObject + ". OPTIONAL{" + sPrefix
				+ this.oContext.sObject + " rdfs:label " + sPrefix + this.oContext.sObject + sLabelPostfix + "}" + "}";
	},
	sparqlish : function() {
		if (this.oObjectPropertyFilters != null) {
			return labelFromURI(this.sObjectProperty) + " in " + this.oObjectPropertyFilters.toString();
		} else {
			return labelFromURI(this.sObjectProperty);
		}
	},
	viewModel : function(sPath, oClauseReferences) {
		var oViewModel = {};
		if (this.oClauses != null) {
			extendj(oViewModel, this.oClauses.viewModel(sPath, oClauseReferences));
		}
		extendj(oViewModel, {
			"path" : sPath,
			"sparqlish" : this.sparqlish()
		});
		return oViewModel;
	}
});
sap.ui.base.Object.extend("InverseObjectPropertyClause", {
	constructor : function(oAST, oContext) {
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "InverseObjectPropertyClause")
				throw "notInverseObjectPropertyClauseException";
			this.sInverseObjectProperty = oAST["inverseObjectProperty"];

			if (oAST["clauses"] != null) {
				var oNewContext = {
					sSubject : oContext.sSubject,
					sObject : oContext.sSubject + "_",
					iLevel : oContext.iLevel + 1
				};
				this.oClauses = new Clauses(oAST["clauses"], oNewContext);
			} else {
				this.oClauses = null;
			}

		} catch (e) {
			jQuery.sap.log.error(e);
		}
	},
	sparql : function() {
		var sSparql = "{" + sPrefix + this.oContext.sObject + " " + this.sInverseObjectProperty + " " + sPrefix + this.oContext.sSubject + ". OPTIONAL{" + sPrefix
				+ this.oContext.sObject + " rdfs:label " + sPrefix + this.oContext.sObject + sLabelPostfix + "}";
		if (this.oClauses != null) {
			return sSparql + "\n" + this.oClauses.sparql() + "}";
		} else {
			return sSparql + "}";
		}
	},
	facetSparql : function() {
		return "{" + sPrefix + this.oContext.sObject + " " + this.sInverseObjectProperty + " " + sPrefix + this.oContext.sSubject + ". OPTIONAL{" + sPrefix
				+ this.oContext.sObject + " rdfs:label " + sPrefix + this.oContext.sObject + sLabelPostfix + "}" + "}";
	},
	sparqlish : function() {
		return "that which " + labelFromURI(this.sInverseObjectProperty);
	},
	viewModel : function(sPath, oClauseReferences) {
		var oViewModel = {};
		if (this.oClauses != null) {
			extendj(oViewModel, this.oClauses.viewModel(sPath, oClauseReferences));
		}
		extendj(oViewModel, {
			"path" : sPath,
			"sparqlish" : this.sparqlish()
		});
		return oViewModel;
	}
});
sap.ui.base.Object.extend("OperationClause", {
	constructor : function(oAST, oContext) {
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "OperationClause")
				throw "notOperationClauseException";
			this.sOperation = oAST["operation"];

			if (oAST["clauses"] != null) {
				var oNewContext = {
					sSubject : oContext.sSubject,
					sObject : oContext.sSubject + "_",
					iLevel : oContext.iLevel + 1
				};
				this.oClauses = new Clauses(oAST["clauses"], oNewContext);
			} else {
				this.oClauses = null;
			}

		} catch (e) {
			jQuery.sap.log.error(e);
		}
	},
	sparql : function() {
		var sSparql = "{" + sPrefix + this.oContext.sObject + " " + this.sOperation + " " + sPrefix + this.oContext.sSubject ;
		if (this.oClauses != null) {
			return sSparql + "\n" + this.oClauses.sparql() + "}";
		} else {
			return sSparql + "}";
		}
	},
	facetSparql : function() {
		return "{" + sPrefix + this.oContext.sObject + " " + this.sInverseObjectProperty + " " + sPrefix + this.oContext.sSubject + ". OPTIONAL{" + sPrefix
				+ this.oContext.sObject + " rdfs:label " + sPrefix + this.oContext.sObject + sLabelPostfix + "}" + "}";
	},
	sparqlish : function() {
		return " " + labelFromURI(this.sOperation);
	},
	viewModel : function(sPath, oClauseReferences) {
		var oViewModel = {};
		if (this.oClauses != null) {
			extendj(oViewModel, this.oClauses.viewModel(sPath, oClauseReferences));
		}
		extendj(oViewModel, {
			"path" : sPath,
			"sparqlish" : this.sparqlish()
		});
		return oViewModel;
	}
});
repeatString = function(sString, iRepeat) {
	if (iRepeat <= 0) {
		return "";
	} else {
		var sRepeatString = "";
		for (var i = 0; i < iRepeat; i++) {
			sRepeatString = sRepeatString + sString;
		}
		return sRepeatString;
	}
};
clauseConjunction = function(sConjunction) {
	switch (sConjunction) {
	case "and": {
		return "";
	}
		;
	case "or": {
		return "UNION";
	}
		;
	default:
		throw "illegalClauseConjunction";
	}
};
filterConjunction = function(sConjunction) {
	switch (sConjunction) {
	case "and": {
		return "&&";
	}
		;
	case "or": {
		return "||";
	}
		;
	default:
		throw "illegalClauseConjunction";
	}
};
filterCondition = function(sVariable, sCondition, sValue, sDatatype) {
	switch (sCondition) {
	case "=":
	case "is":
	case "equals": {
		return "(" + sVariable + "= '" + sValue + "'^^" + sDatatype + ")";
	}
		;
	case "!=":
	case "is not":
	case "not equals": {
		return "(" + sVariable + " != '" + sValue + "'^^" + sDatatype + ")";
	}
		;
	case ">":
	case "greater than": {
		return "(" + sVariable + " > '" + sValue + "'^^" + sDatatype + ")";
	}
		;
	case ">=":
	case "greater than or equal": {
		return "(" + sVariable + " >= '" + sValue + "'^^" + sDatatype + ")";
	}
		;
	case "<":
	case "less than": {
		return "(" + sVariable + " < '" + sValue + "'^^" + sDatatype + ")";
	}
		;
	case "<=":
	case "less than or equal": {
		return "(" + sVariable + " <= '" + sValue + "'^^" + sDatatype + ")";
	}
		;
	case "containing":
	case "contains": {
		return "(REGEX(" + sVariable + ", '" + sValue + "'^^" + sDatatype + ",'i'))";
	}
		;
	case "ends with": {
		return "*ERROR*";
	}
		;
	case "starts with": {
		return "*ERROR*";
	}
		;
	case "between": {
		return "*ERROR*";
	}
		;
	case "after": {
		return "(" + sVariable + " > '" + sValue + "'^^" + sDatatype + ")";
	}
		;
	case "before": {
		return "(" + sVariable + " < '" + sValue + "'^^" + sDatatype + ")";
	}
		;
	default:
		throw "illegalFilterCondition";
	}
};
labelFromURI = function(sUri) {
	if (RegExp("^<.*>$").test(sUri)) {
		// URL wrapped within <...>, so strip them
		sUri = sUri.substring(1, sUri.length - 1);
	}
	var sLabel = jQuery.uri(sUri).fragment;
	if (sLabel == undefined) {
		sLabel = jQuery.uri(sUri).path;
		var sLabelArray = sLabel.toString().split("/");
		if (sLabelArray.length > 1) {
			sLabel = sLabelArray[sLabelArray.length - 1];
		}
	}
	return sLabel;
};
extendj = function() {
	for (var i = 1; i < arguments.length; i++)
		for ( var key in arguments[i])
			if (arguments[i].hasOwnProperty(key))
				arguments[0][key] = arguments[i][key];
	return arguments[0];
};
objectFilterSparql = function(sVariable, oFilters) {
	var sSparql = "";
	if (oFilters != null) {
		sSparql = sSparql + "VALUES(" + sVariable + "){";
		for (var i = 0; i < oFilters.length; i++) {
			sSparql = sSparql + "(" + oFilters[i] + ")"
		}
		sSparql = sSparql + "}";
	}
	return sSparql;
}