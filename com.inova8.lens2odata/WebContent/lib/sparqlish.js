"use strict";
jQuery.sap.require("sap.ui.model.FilterOperator");
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
jQuery.sap.declare("DataPropertyFilters");
jQuery.sap.declare("DataPropertyFilter");
jQuery.sap.declare("ConjunctionFilter");
var sPrefix = "?v";
var sLabelPostfix = "_label";
var defaultVersion = "V2";
var metadata = "__metadata";
sap.ui.base.Object.extend("Queries", {
	constructor : function(oDataMetaModel, oAST) {
		this.oDataMetaModel = oDataMetaModel;
		this.oAST = oAST;
		this.oQueries = [];
		try {
			if (!jQuery.isEmptyObject(oAST["queries"])) {
				for (var i = 0; i < oAST["queries"].length; i++) {
					this.oQueries.push(new Query(this.oDataMetaModel, oAST["queries"][i], "/queries/" + i + "/"));
				}
			} else {
				this.oQueries = null;
			}
		} catch (e) {
			jQuery.sap.log.error(e);
			throw (e);
		}
	}
});
sap.ui.base.Object
		.extend(
				"Query",
				{
					constructor : function(oDataMetaModel, oAST, sPath) {
						this.queryRestoreList = {
							current : jQuery.extend(true, {}, oAST),
							prior : null
						};
						this.oDataMetaModel = oDataMetaModel;
						this.init(oAST, sPath);
					},
					init : function(oAST, sPath) {
						sPath = sPath || "/";
						this.oAST = oAST || this.oAST;
						this.oViewModel = null;
						try {
							if (this.oAST["_class"] != "Query")
								throw "notQueryException";
							this.sName = this.oAST["name"];
							this.sPath = sPath;
							this.oContext = {
								sOdataEntityPath : "",
								sSubject : "",
								sObject : "",
								iLevel : 0
							};
							this.sTop = (jQuery.isEmptyObject(this.oAST["top"])) ? null : this.oAST["top"];
							this.sSkip = (jQuery.isEmptyObject(this.oAST["skip"])) ? null : this.oAST["skip"];
							this.sConcept = this.oAST["concept"];
							this.sLabel = (jQuery.isEmptyObject(this.oAST["label"])) ? sparqlish.labelFromURI(this.sConcept) : this.oAST["label"];
							this.bHidden = (jQuery.isEmptyObject(this.oAST["hidden"])) ? false : this.oAST["hidden"];

							if (!jQuery.isEmptyObject(this.oAST["conceptFilters"])) {
								this.oConceptFilters = this.oAST["conceptFilters"];
							} else {
								this.oConceptFilters = null;
							}
							if (!jQuery.isEmptyObject(this.oAST["clauses"])) {
								this.oClauses = new Clauses(this.oDataMetaModel, this.oAST["clauses"], this.oContext);
							} else {
								this.oClauses = null;
							}
							// Now prep the viewmodel
							this.oViewModel = this.viewModel();
							// now prep the sparql query
							var sContext = sPrefix + this.oContext.sSubject;
							var sValues = sparqlish.sparqlKeyFilters(sContext, this.oConceptFilters);
							if (!jQuery.isEmptyObject(this.oClauses)) {
								this.sWhere = "WHERE{\n{" + sContext + " a " + this.sConcept + ". OPTIONAL{" + sContext + " rdfs:label " + sContext + sLabelPostfix + "}"
										+ sValues + "}\n" + this.oClauses.sparql() + "\n}";
							} else {
								this.sWhere = "WHERE{\n{" + sContext + " a " + this.sConcept + ". OPTIONAL{" + sContext + " rdfs:label " + sContext + sLabelPostfix + "}"
										+ sValues + "}\n" + "}";
							}

						} catch (e) {
							jQuery.sap.log.error(e);
							throw (e);
						}
						return this;
					},
					clearQuery : function() {
						this.pushQuery();
						this.oAST = {
							"_class" : "Query",
							"name" : "",
							"concept" : "Orders"
						};
						this.init(this.oAST);
					},
					pushQuery : function() {
						var prior = this.queryRestoreList;
						// prior.current = jQuery.extend(true, {}, this.oAST);
						this.queryRestoreList = {
							current : jQuery.extend(true, {}, this.oAST),
							prior : prior
						};
					},
					undo : function() {
						if (this.queryRestoreList.prior != null) {
							this.oAST = this.queryRestoreList.prior.current;
							// this.oAST = this.queryRestoreList.current;
							this.queryRestoreList = this.queryRestoreList.prior;
						}
						// this.init(this.oAST);
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
						var sValues = sparqlish.sparqlKeyFilters(sContext, this.oConceptFilters);
						if (!jQuery.isEmptyObject(this.oClauses)) {
							return ("SELECT * \nWHERE{\n{" + sContext + " a " + this.sConcept + ". OPTIONAL{" + sContext + " rdfs:label " + sContext + sLabelPostfix + "}"
									+ sValues + "}\n" + this.oClauses.sparql() + "\n}");
						} else {
							return ("SELECT * \nWHERE{\n{" + sContext + " a " + this.sConcept + ". OPTIONAL{" + sContext + " rdfs:label " + sContext + sLabelPostfix + "}"
									+ sValues + "}\n" + "}");
						}
					},
					facetSparql : function() {
						var sContext = sPrefix + this.oContext.sSubject;
						var sValues = sparqlish.sparqlKeyFilters(sContext, this.oConceptFilters);
						if (!jQuery.isEmptyObject(this.oClauses)) {
							return ("{" + sContext + " a " + this.sConcept + ". OPTIONAL{" + sContext + " rdfs:label " + sContext + sLabelPostfix + "}" + sValues + "}\n" + this.oClauses
									.sparql());
						} else {
							return ("{" + sContext + " a " + this.sConcept + ". OPTIONAL{" + sContext + " rdfs:label " + sContext + sLabelPostfix + "}" + sValues + "}\n");
						}
					},
					sparqlish : function() {
						if (!jQuery.isEmptyObject(this.oConceptFilters)) {
							return "Find <embed data-index='0'>" + sparqlish.labelFromURI(this.sConcept) + " in " + sparqlish.sparqlishKeyFilters(this.oConceptFilters);
						} else {
							return "Find " + sparqlish.labelFromURI(this.sConcept);
						}
					},
					branchLength : function(oBranch) {
						oBranch.branchLength = 1;
						var nClause = 0;
						while (!jQuery.isEmptyObject(oBranch[nClause])) {
							oBranch.branchLength += this.branchLength(oBranch[nClause]);
							nClause++;
						}
						return oBranch.branchLength;
					},
					queryModel : function() {
						return this.oAST;
					},
					viewModel : function() {
						this.oClauseReferences = [];
						try {
							this.oClauseReferences[0] = this;
							var entitySetType = this.oDataMetaModel.getODataEntitySet(this.sConcept);
							var entityType = this.oDataMetaModel.getODataEntityType(entitySetType.entityType);
							var oViewModel = {
								"root" : {}
							};
							if (!jQuery.isEmptyObject(this.oClauses)) {
								sparqlish.extendj(oViewModel.root, this.oClauses.viewModel(this.sPath, this.oClauseReferences, entityType.name, "", "{path}/{=P0}"), 0);
							}
							sparqlish.extendj(oViewModel.root, {
								"path" : this.sPath,
								"resultsPath" : "",
								"resultsContext" : "{path}/{=P0}",
								"sparqlish" : this.sparqlish(),
								"label" : this.sLabel,
								"hidden" : this.bHidden,
								"variable" : sPrefix,
								"nameVariable" : sPrefix + sLabelPostfix,
								"keyVariable" : entityType.name,
								"field" : entityType.name,
								"type" : metadata,
								"multiplicity" : "*",
								"index" : 0
							});
							oViewModel.root.branchLength = this.branchLength(oViewModel.root);
							return oViewModel;
						} catch (e) {
							jQuery.sap.log.error(e);
							throw e;
						}
					},
					odataPath : function(sVersion) {
						return "/" + this.sConcept + "()";
					},
					odataFilter : function(sVersion) {
						var sClausesFilter = "";
						if (!jQuery.isEmptyObject(this.oClauses)) {
							sClausesFilter = this.oClauses.odataFilter(sVersion, this.oAST.parameters);
						}
						if (!jQuery.isEmptyObject(this.oConceptFilters)) {
							var sOdataKeyFilters = sparqlish.odataKeyFilters(sVersion, this.oContext.sOdataEntityPath, this.oConceptFilters, this.oAST.parameters);
							if (sClausesFilter != "") {
								return jQuery.isEmptyObject(sOdataKeyFilters) ? "(" + sClausesFilter + ")" : "((" + sOdataKeyFilters + ")and(" + sClausesFilter + "))";
							} else {
								return jQuery.isEmptyObject(sOdataKeyFilters) ? "" : "(" + sOdataKeyFilters + ")";
							}
						} else {
							if (sClausesFilter != "") {
								return "(" + sClausesFilter + ")";
							} else {
								return "";
							}
						}
					},
					odataFilterSet : function(sVersion) {
						var oOdataFilterSet = {
							_class : "filterset",
							filters : {},
							and : true
						};
						if (!jQuery.isEmptyObject(this.oClauses)) {
							oOdataFilterSet.filters = this.oClauses.odataFilterSet(sVersion, this.oAST.parameters);
						}
						if (!jQuery.isEmptyObject(this.oConceptFilters)) {
							// TODO
							return null;
						} else {
							if (jQuery.isEmptyObject(oOdataFilterSet.filters)) {
								return null;
							} else {
								return oOdataFilterSet;
							}
						}
					},
					odataSelect : function(sVersion) {
						var sSelect = "";
						if (!jQuery.isEmptyObject(this.oClauses)) {
							sSelect = this.oClauses.odataSelect(sVersion);
						}
						if (!jQuery.isEmptyObject(this.oConceptFilters)) {
							var sOdataKeys = sparqlish.odataKeys(sVersion, this.oContext.sOdataEntityPath, this.oConceptFilters);
							if (sSelect != "") {
								return jQuery.isEmptyObject(sOdataKeys) ? sSelect : +sOdataKeys + "," + sSelect;
							} else {
								return jQuery.isEmptyObject(sOdataKeys) ? "" : +sOdataKeys;
							}
						} else {
							if (sSelect != "") {
								return sSelect;
							} else {
								return "";
							}
						}
					},
					odataSelectList : function(sVersion) {
						var select = this.odataSelect(sVersion);
						if (jQuery.isEmptyObject(select)) {
							return "";
						} else {
							return select.join();
						}
					},
					odataExpand : function(sVersion) {
						var sOdataExpand = "";
						if (!jQuery.isEmptyObject(this.oClauses)) {
							if (sVersion == "V4") {
								return this.odataExpandSelect(sVersion);
							} else {
								sOdataExpand = this.oClauses.odataExpand(sVersion);
								if (jQuery.isEmptyObject(sOdataExpand)) {
									return "";
								} else {
									return sOdataExpand;
								}
							}
						} else
							return "";
					},
					odataExpandList : function(sVersion) {
						var expand = this.odataExpand(sVersion);
						if (jQuery.isEmptyObject(expand)) {
							return "";
						} else {
							return expand.join();
						}
					},
					odataExpandSelect : function(sVersion) {
						return "$expand=" + this.oClauses.odataExpandSelect(sVersion);
					},
					odataOptions : function(sVersion) {
						var sTop = ((this.sTop == null) ? "" : "$top=" + this.sTop);
						var sSkip = ((this.sSkip == null) ? "" : "$skip=" + this.sSkip);
						if (sTop != "") {
							if (sSkip != "") {
								return sTop + "&" + sSkip;
							} else {
								return sSkip;
							}
						} else {
							if (sSkip != "") {
								return sSkip;
							} else {
								return ""
							}
						}
					},
					odataCustomQueryOptions : function(sVersion) {
						var odataCustomQueryOptions = "";
						if (!jQuery.isEmptyObject(this.oClauses)) {
							odataCustomQueryOptions = this.oClauses.odataCustomQueryOptions(sVersion);
						}
						if (!jQuery.isEmptyObject(this.oAST.operationParameters)) {
							for (operationParameterIndex in this.oAST.operationParameters) {
								var operationParameter = this.oAST.operationParameters[operationParameterIndex];
								odataCustomQueryOptions = odataCustomQueryOptions + "&" + operationParameter.name + "="
										+ sparqlish.odataValue(sVersion, operationParameter.value, operationParameter.type, this.oAST.parameters);
							}
						}
						return odataCustomQueryOptions;
					},
					odataCustomQueryOptionsList:function(sVersion){
						var odataCustomQueryOptionsList = {};
						if (!jQuery.isEmptyObject(this.oClauses)) {
							odataCustomQueryOptionsList = this.oClauses.odataCustomQueryOptionsList(sVersion);
						}
						if (!jQuery.isEmptyObject(this.oAST.operationParameters)) {
							for (operationParameterIndex in this.oAST.operationParameters) {
								var operationParameter = this.oAST.operationParameters[operationParameterIndex];
								odataCustomQueryOptionsList[operationParameter.name] = sparqlish.odataValue(sVersion, operationParameter.value, operationParameter.type, this.oAST.parameters);
							}
						}
						return odataCustomQueryOptionsList;
					},
					odataQuery : function(sVersion) {
						sVersion = sVersion || defaultVersion;
						var url = [];
						var filter = this.odataFilter(sVersion);
						if (!jQuery.isEmptyObject(filter))
							url.push("$filter=" + filter);
						var expand = this.odataExpand(sVersion);
						if (!jQuery.isEmptyObject(expand))
							url.push("$expand=" + expand);
						var select = this.odataSelect(sVersion);
						if (!jQuery.isEmptyObject(select))
							url.push("$select=" + select);
						var options = this.odataOptions(sVersion);
						if (!jQuery.isEmptyObject(options))
							url.push(options);
						var customQueryOptions = this.odataCustomQueryOptions(sVersion);
						if (!jQuery.isEmptyObject(customQueryOptions))
							url.push(customQueryOptions);
						return "?" + url.join("&");
					},
					odataURI : function(sVersion) {
						sVersion = sVersion || defaultVersion;
						return this.odataPath(sVersion) + this.odataQuery(sVersion);
					}
				});
sap.ui.base.Object.extend("Clauses", {
	constructor : function(oDataMetaModel, oAST, oContext) {
		this.oDataMetaModel = oDataMetaModel;
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "Clauses")
				throw "notClausesException";
			var oFirstContext = {
				sOdataEntityPath : oContext.sOdataEntityPath,
				sSubject : oContext.sSubject,
				sObject : oContext.sSubject + "_" + 0,
				iLevel : oContext.iLevel
			};
			if (!jQuery.isEmptyObject(oAST["clause"])) {
				this.oClause = new Clause(this.oDataMetaModel, oAST["clause"], oFirstContext);
				if (!jQuery.isEmptyObject(oAST["conjunctionClauses"])) {
					this.oConjunctionClauses = [];
					for (var i = 0; i < oAST["conjunctionClauses"].length; i++) {
						var oNewContext = {
							sOdataEntityPath : oContext.sOdataEntityPath,
							sSubject : oContext.sSubject,
							sObject : oContext.sSubject + "_" + (i + 1),
							iLevel : oContext.iLevel
						};
						this.oConjunctionClauses[i] = new ConjunctionClause(this.oDataMetaModel, oAST["conjunctionClauses"][i], oNewContext);
					}
				} else {
					this.oConjunctionClauses = null;
				}
			} else {
				this.oClause = null;
			}
		} catch (e) {
			jQuery.sap.log.error(e);
			throw (e);
		}
	},
	sparql : function() {
		if (!jQuery.isEmptyObject(this.oClause)) {
			var sSparql = this.oClause.sparql();
			if (!jQuery.isEmptyObject(this.oConjunctionClauses)) {
				for (var i = 0; i < this.oConjunctionClauses.length; i++) {
					sSparql = sSparql + this.oConjunctionClauses[i].sparql();
				}
				return sSparql;
			} else {
				return sSparql;
			}
		} else {
			return "";
		}
	},
	sparqlish : function() {
		if (!jQuery.isEmptyObject(this.oClause)) {
			var sSparqlish = this.oClause.sparqlish();
			if (!jQuery.isEmptyObject(this.oConjunctionClauses)) {
				for (var i = 0; i < this.oConjunctionClauses.length; i++) {
					sSparqlish = sSparqlish + this.oConjunctionClauses[i].sparqlish();
				}
				return sSparqlish;
			} else {
				return sSparqlish;
			}
		} else {
			return "";
		}
	},
	viewModel : function(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex) {
		var oViewModel = {};
		if (!jQuery.isEmptyObject(this.oConjunctionClauses)) {
			for (var i = 0; i < this.oConjunctionClauses.length; i++) {
				var iIndex = i + 1;
				var oConjunctionClause = {};
				oConjunctionClause[iIndex] = this.oConjunctionClauses[i].viewModel(sPath + "clauses/conjunctionClauses/" + (iIndex - 1) + "/", oClauseReferences,
				// oConjunctionClause[iIndex] = this.oConjunctionClauses[i].viewModel(sPath + "clauses/conjunctionClauses/" +
				// (iIndex - 1) + "/clause/", oClauseReferences,
				sKeyVariable, sResultsPath, sResultsContext, iClauseIndex);
				sparqlish.extendj(oViewModel, oConjunctionClause);
			}
		}
		if (!jQuery.isEmptyObject(this.oClause)) {
			sparqlish.extendj(oViewModel, {
				// "0" : this.oClause.viewModel(sPath + "clauses/clause/", oClauseReferences, sKeyVariable, sResultsPath,
				// sResultsContext, iClauseIndex)
				"0" : this.oClause.viewModel(sPath + "clauses/", oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex)
			});
		}
		return oViewModel;
	},
	odataFilter : function(sVersion, oParameters) {
		if (!jQuery.isEmptyObject(this.oClause)) {
			var sOdataFilter = this.oClause.odataFilter(sVersion, oParameters);
			if (!jQuery.isEmptyObject(this.oConjunctionClauses) && (this.oConjunctionClauses.length > 0)) {
				var sOdataConjunctionClause0Filter = this.oConjunctionClauses[0].odataFilter(sVersion, oParameters);
				if ((sOdataFilter != "") && (sOdataConjunctionClause0Filter != "")) {
					sOdataFilter = sOdataFilter + "and" + sOdataConjunctionClause0Filter;
				} else {
					sOdataFilter = sOdataFilter + sOdataConjunctionClause0Filter;
				}
				for (var i = 1; i < this.oConjunctionClauses.length; i++) {
					var sOdataConjunctionClauseFilter = this.oConjunctionClauses[i].odataFilter(sVersion, oParameters);
					if (!jQuery.isEmptyObject(sOdataConjunctionClauseFilter)) {
						if (jQuery.isEmptyObject(sOdataFilter)) {
							// Ignore any conjunctions if this is the first filter
							sOdataFilter = sOdataConjunctionClauseFilter;
						} else {
							sOdataFilter = sOdataFilter + sparqlish.odataClauseConjunction(this.oConjunctionClauses[i].sConjunction) + sOdataConjunctionClauseFilter;
						}
					}
				}
				return sOdataFilter;
			} else {
				return sOdataFilter;
			}
		} else {
			return "";
		}
	},
	odataFilterSet : function(sVersion, oParameters) {
		if (!jQuery.isEmptyObject(this.oClause)) {
			var oOdataFilterSet = {};
			var oClauseFilterSet = this.oClause.odataFilterSet(sVersion, oParameters);
			if(!jQuery.isEmptyObject(oClauseFilterSet)) oOdataFilterSet[0] = oClauseFilterSet;

			if (!jQuery.isEmptyObject(this.oConjunctionClauses) && (this.oConjunctionClauses.length > 0)) {
				var oOdataConjunctionClause0FilterSet = this.oConjunctionClauses[0].odataFilterSet(sVersion, oParameters);
				if ((!jQuery.isEmptyObject(oOdataFilterSet)) && (!jQuery.isEmptyObject(oOdataConjunctionClause0FilterSet))) {
					oOdataFilterSet[1] = oOdataConjunctionClause0FilterSet;
					// oOdataFilterSet = oOdataFilterSet + "and" + oOdataConjunctionClause0FilterSet;
				} else {
					// oOdataFilterSet = oOdataFilterSet + oOdataConjunctionClause0FilterSet;
				}
				for (var i = 1; i < this.oConjunctionClauses.length; i++) {
					var oOdataConjunctionClauseFilterSet = this.oConjunctionClauses[i].odataFilterSet(sVersion, oParameters);
					if (!jQuery.isEmptyObject(oOdataConjunctionClauseFilterSet)) {
						if (jQuery.isEmptyObject(oOdataFilterSet)) {
							// Ignore any conjunctions if this is the first filter
							oOdataFilterSet[i + 1] = oOdataConjunctionClauseFilterSet;
						} else {
							oOdataFilterSet[i + 1] = oOdataConjunctionClauseFilterSet;
						}
					}
				}
				return oOdataFilterSet;
			} else {
				return oOdataFilterSet[0];
			}
		} else {
			return null;
		}
	},
	odataSelect : function(sVersion) {
		if (!jQuery.isEmptyObject(this.oClause)) {
			var sOdataSelect = [];
			var clauseSelect = this.oClause.odataSelect(sVersion);
			if (!jQuery.isEmptyObject(clauseSelect)) {
				if (clauseSelect instanceof Array) {
					sOdataSelect.push.apply(sOdataSelect, clauseSelect);
				} else {
					sOdataSelect.push(clauseSelect);
				}
			}
			if (!jQuery.isEmptyObject(this.oConjunctionClauses)) {
				for (var i = 0; i < this.oConjunctionClauses.length; i++) {
					var sOdataConjunctionSelect = this.oConjunctionClauses[i].odataSelect(sVersion);
					if (!jQuery.isEmptyObject(sOdataConjunctionSelect)) {
						if (sOdataConjunctionSelect instanceof Array) {
							sOdataSelect.push.apply(sOdataSelect, sOdataConjunctionSelect);
						} else {
							sOdataSelect.push(sOdataConjunctionSelect);
						}
						// if (sOdataConjunctionSelect != "") {
						// if (sOdataSelect != "") {
						// sOdataSelect = sOdataSelect + "," + sOdataConjunctionSelect;
						// } else {
						// sOdataSelect = sOdataConjunctionSelect
						// }
					}
				}
				return sOdataSelect;
			} else {
				return sOdataSelect;
			}
		} else {
			return "";
		}
	},
	odataExpand : function(sVersion) {
		if (!jQuery.isEmptyObject(this.oClause)) {
			var sOdataExpand = [];
			var clauseExpand = this.oClause.odataExpand(sVersion);
			if (!jQuery.isEmptyObject(clauseExpand)) {
				if (clauseExpand instanceof Array) {
					sOdataExpand.push.apply(sOdataExpand, clauseExpand);
				} else {
					sOdataExpand.push(clauseExpand);
				}
			}
			if (!jQuery.isEmptyObject(this.oConjunctionClauses)) {
				for (var i = 0; i < this.oConjunctionClauses.length; i++) {
					var sOdataConjunctionExpand = this.oConjunctionClauses[i].odataExpand(sVersion);
					if (!jQuery.isEmptyObject(sOdataConjunctionExpand)) {
						if (sOdataConjunctionExpand instanceof Array) {
							sOdataExpand.push.apply(sOdataExpand, sOdataConjunctionExpand);
						} else {
							sOdataExpand.push(sOdataConjunctionExpand);
						}
						// sOdataExpand.push(sOdataConjunctionExpand);
						// if (sOdataExpand != "") {
						// sOdataExpand = sOdataExpand + "," + sOdataConjunctionExpand;
						// } else {
						// sOdataExpand = sOdataConjunctionExpand;
						// }
					}
				}
				return sOdataExpand;
			} else {
				return sOdataExpand;
			}
		} else {
			return "";
		}
	},
	odataExpandSelect : function(sVersion) {
		if (!jQuery.isEmptyObject(this.oClause)) {
			var sOdataExpandSelect = [];
			sOdataExpandSelect[0] = this.oClause.odataExpandSelect(sVersion);
			(sOdataExpandSelect == "") ? "" : sOdataExpandSelect + "($select=xx)";
			if (!jQuery.isEmptyObject(this.oConjunctionClauses)) {
				for (var i = 0; i < this.oConjunctionClauses.length; i++) {
					var sOdataConjunctionExpandSelect = this.oConjunctionClauses[i].odataExpandSelect(sVersion);
					if (!jQuery.isEmptyObject(sOdataConjunctionExpandSelect)) {
						if (sOdataConjunctionExpandSelect instanceof Array) {
							sOdataExpandSelect.push.apply(sOdataExpand, sOdataConjunctionExpandSelect);
						} else {
							sOdataExpandSelect.push(sOdataConjunctionExpandSelect);
						}
						// if (sOdataConjunctionExpandSelect != "") {
						// sOdataExpandSelect.push(sOdataConjunctionExpandSelect);
						// if (sOdataExpandSelect != "") {
						// sOdataExpandSelect = sOdataExpandSelect + "," + sOdataConjunctionExpandSelect;
						// } else {
						// sOdataExpandSelect = sOdataConjunctionExpandSelect;
						// }
					}
				}
				return sOdataExpandSelect;
			} else {
				return sOdataExpandSelect;
			}
		} else {
			return "";
		}
	},
	odataSelectForExpand : function(sVersion) {
		if (!jQuery.isEmptyObject(this.oClause)) {
			var sOdataSelectForExpand = [];
			sOdataSelectForExpand[0] = this.oClause.odataSelectForExpand(sVersion);
			if (!jQuery.isEmptyObject(this.oConjunctionClauses)) {
				for (var i = 0; i < this.oConjunctionClauses.length; i++) {
					var sOdataConjunctionSelect = this.oConjunctionClauses[i].odataSelectForExpand(sVersion);
					if (!jQuery.isEmptyObject(sOdataConjunctionSelect)) {
						if (sOdataConjunctionSelect instanceof Array) {
							sOdataSelectForExpand.push.apply(sOdataExpand, sOdataConjunctionSelect);
						} else {
							sOdataSelectForExpand.push(sOdataConjunctionSelect);
						}
						// if (sOdataConjunctionSelect != "") {
						// sOdataSelectForExpand.push(sOdataConjunctionSelect);
						// sOdataSelectForExpand = sOdataSelectForExpand + "," +
						// this.oConjunctionClauses[i].odataSelectForExpand(sVersion);
					}
				}
				return sOdataSelectForExpand;
			} else {
				return sOdataSelectForExpand;
			}
		} else {
			return "";
		}
	},
	odataCustomQueryOptions : function(sVersion) {
		if (!jQuery.isEmptyObject(this.oClause)) {
			return this.oClause.odataCustomQueryOptions(sVersion);
		} else {
			return "";
		}
	},
		odataCustomQueryOptionsList : function(sVersion) {
		if (!jQuery.isEmptyObject(this.oClause)) {
			return this.oClause.odataCustomQueryOptionsList(sVersion);
		} else {
			return null;
		}
	}
});
sap.ui.base.Object.extend("Clause", {
	constructor : function(oDataMetaModel, oAST, oContext) {
		this.oDataMetaModel = oDataMetaModel;
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "Clause")
				throw "notClauseException";
			this.bIgnore = (oAST["ignore"]) ? true : false;
			this.bOptional = (oAST["optional"]) ? true : false;
			if (jQuery.isEmptyObject(oAST["includeOptionalIgnore"])) {
				this.sIncludeOptionalIgnore = "include";
			} else {
				this.sIncludeOptionalIgnore = oAST["includeOptionalIgnore"];
			}
			this.oPropertyClause = new PropertyClause(this.oDataMetaModel, oAST["propertyClause"], oContext);
			this.sLabel = (jQuery.isEmptyObject(oAST["label"])) ? (this.oPropertyClause.sLabel) : oAST["label"];
			this.bHidden = (jQuery.isEmptyObject(oAST["hidden"])) ? (this.oPropertyClause.bHidden) : oAST["hidden"];
		} catch (e) {
			jQuery.sap.log.error(e);
			throw (e);
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
		var sSparql = sparqlish.repeatString("\t", this.oContext.iLevel);
		sSparql = sSparql + (this.bIgnore ? "#" : "");
		sSparql = sSparql + (this.bOptional ? "OPTIONAL" : "");
		if (!jQuery.isEmptyObject(this.oPropertyClause))
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
		if (!jQuery.isEmptyObject(this.oPropertyClause))
			sSparqlish = sSparqlish + this.oPropertyClause.sparqlish();
		return sSparqlish;
	},
	viewModel : function(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex) {
		var iIndex = oClauseReferences.length;
		oClauseReferences.push(this);
		var oViewModel = {};
		this.sNameVariable = "";
		if (!jQuery.isEmptyObject(this.oPropertyClause)) {
			sparqlish.extendj(oViewModel, this.oPropertyClause.viewModel(sPath + "clause/propertyClause/", oClauseReferences, sKeyVariable, sResultsPath,
					sResultsContext, iIndex));
			switch (this.oPropertyClause.oPropertyClause.oAST._class) {
			case "ObjectPropertyClause":
				this.sNameVariable = sPrefix + this.oContext.sObject + sLabelPostfix;
				this.sField = this.oPropertyClause.oPropertyClause.sObjectProperty;
				this.sType = metadata;
				break;
			case "DataPropertyClause":
				this.sField = this.oPropertyClause.oPropertyClause.sDataProperty;
				this.sType = this.oPropertyClause.oPropertyClause.oAST.type;
				break;
			case "ComplexDataPropertyClause":
				this.sField = this.oPropertyClause.oPropertyClause.sDataProperty;
				this.sType = this.oPropertyClause.oPropertyClause.oAST.type;
				break;
			default:
			}
			this.sKeyVariable = sKeyVariable + ":" + this.sField;
			this.sResultsPath = sResultsPath + "/" + this.sField;
		}
		sparqlish.extendj(oViewModel, {
			"path" : sPath + "clause/",
			"sparqlish" : this.sparqlish(),
			"label" : this.sLabel,
			"hidden" : this.bHidden,
			"includeOptionalIgnore" : this.sIncludeOptionalIgnore,
			"variable" : sPrefix + this.oContext.sObject,
			"nameVariable" : this.sNameVariable,
			"keyVariable" : this.sKeyVariable,
			"resultsPath" : this.sResultsPath,
			"field" : this.sField,
			"type" : this.sType,
			"index" : iIndex
		});
		return oViewModel;
	},
	odataFilter : function(sVersion, oParameters) {
		if (!jQuery.isEmptyObject(this.oPropertyClause)) {
			return this.oPropertyClause.odataFilter(sVersion, oParameters);
		} else {
			return "";
		}
	},
	odataFilterSet : function(sVersion, oParameters) {
		if (!jQuery.isEmptyObject(this.oPropertyClause)) {
			return this.oPropertyClause.odataFilterSet(sVersion, oParameters);
		} else {
			return null;
		}
	},
	odataSelect : function(sVersion) {
		if (!jQuery.isEmptyObject(this.oPropertyClause)) {
			return this.oPropertyClause.odataSelect(sVersion);
		} else {
			return "";
		}
	},
	odataExpand : function(sVersion) {
		if (!jQuery.isEmptyObject(this.oPropertyClause)) {
			return this.oPropertyClause.odataExpand(sVersion);
		} else {
			return "";
		}
	},
	odataExpandSelect : function(sVersion) {
		if (!jQuery.isEmptyObject(this.oPropertyClause)) {
			return this.oPropertyClause.odataExpandSelect(sVersion);
		} else {
			return "";
		}
	},
	odataSelectForExpand : function(sVersion) {
		if (!jQuery.isEmptyObject(this.oPropertyClause)) {
			return this.oPropertyClause.odataSelectForExpand(sVersion);
		} else {
			return "";
		}
	},
	odataCustomQueryOptions : function(sVersion) {
		if (!jQuery.isEmptyObject(this.oPropertyClause)) {
			return this.oPropertyClause.odataCustomQueryOptions(sVersion);
		} else {
			return "";
		}
	},
	odataCustomQueryOptionsList : function(sVersion) {
		if (!jQuery.isEmptyObject(this.oPropertyClause)) {
			return this.oPropertyClause.odataCustomQueryOptionsList(sVersion);
		} else {
			return null;
		}
	}
});
sap.ui.base.Object.extend("ConjunctionClause", {
	constructor : function(oDataMetaModel, oAST, oContext) {
		this.oDataMetaModel = oDataMetaModel;
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "ConjunctionClause")
				throw "notConjunctionClauseException";
			this.sConjunction = oAST["conjunction"];
			this.oClause = new Clause(this.oDataMetaModel, oAST["clause"], oContext);
		} catch (e) {
			jQuery.sap.log.error(e);
			throw (e);

		}
	},
	sparql : function() {
		return (sparqlish.sparqlClauseConjunction(this.sConjunction) + "\n" + this.oClause.sparql());
	},
	sparqlish : function() {
		return (this.sConjunction + " " + this.oClause.sparqlish());
	},
	viewModel : function(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex) {
		var oViewModel = {};
		sparqlish.extendj(oViewModel, this.oClause.viewModel(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex));
		sparqlish.extendj(oViewModel, {
			"path" : sPath,
			"sparqlish" : this.sparqlish()
		});
		return oViewModel;
	},
	odataFilter : function(sVersion, oParameters) {
		var sOdataFilter = this.oClause.odataFilter(sVersion, oParameters);
		if (sOdataFilter == "") {
			return "";
		} else {
			return /* sparqlish.odataClauseConjunction(this.sConjunction) + */this.oClause.odataFilter(sVersion, oParameters);
		}
	},
	odataFilterSet : function(sVersion, oParameters) {
		var oOdataFilterSet = this.oClause.odataFilterSet(sVersion, oParameters);
		if (jQuery.isEmptyObject(oOdataFilterSet)) {
			return null;
		} else {
			return /* sparqlish.odataClauseConjunction(this.sConjunction) + */this.oClause.odataFilterSet(sVersion, oParameters);
		}
	},
	odataSelect : function(sVersion) {
		return this.oClause.odataSelect(sVersion);
	},
	odataExpand : function(sVersion) {
		return this.oClause.odataExpand(sVersion);
	},
	odataExpandSelect : function(sVersion) {
		return this.oClause.odataExpandSelect(sVersion);
	},
	odataSelectForExpand : function(sVersion) {
		return this.oClause.odataSelectForExpand(sVersion);
	},
	odataCustomQueryOptions : function(sVersion) {
		return this.oClause.odataCustomQueryOptions(sVersion);
	},
	odataCustomQueryOptionsList : function(sVersion) {
		return this.oClause.odataCustomQueryOptionsList(sVersion);
	}
});
sap.ui.base.Object.extend("PropertyClause", {
	constructor : function(oDataMetaModel, oAST, oContext) {
		this.oDataMetaModel = oDataMetaModel;
		this.oAST = oAST;
		this.oContext = oContext;
		this.bHidden = false;

		try {
			if (oAST["_class"] == "DataPropertyClause") {
				this.oPropertyClause = new DataPropertyClause(this.oDataMetaModel, oAST, oContext);
				this.sLabel = sparqlish.labelFromURI(this.oPropertyClause.oAST["dataProperty"]);
			} else if (oAST["_class"] == "ObjectPropertyClause") {
				this.oPropertyClause = new ObjectPropertyClause(this.oDataMetaModel, oAST, oContext);
				this.sLabel = sparqlish.labelFromURI(this.oPropertyClause.oAST["objectProperty"]);
			} else if (oAST["_class"] == "InverseObjectPropertyClause") {
				this.oPropertyClause = new InverseObjectPropertyClause(this.oDataMetaModel, oAST, oContext);
				this.sLabel = sparqlish.labelFromURI(this.oPropertyClause.oAST["inverseObjectProperty"]);
			} else if (oAST["_class"] == "OperationClause") {
				this.oPropertyClause = new OperationClause(this.oDataMetaModel, oAST, oContext);
				this.sLabel = sparqlish.labelFromURI(this.oPropertyClause.oAST["operationProperty"]);
			} else if (oAST["_class"] == "ComplexDataPropertyClause") {
				this.oPropertyClause = new ComplexDataPropertyClause(this.oDataMetaModel, oAST, oContext);
				this.sLabel = sparqlish.labelFromURI(this.oPropertyClause.oAST["complexDataProperty"]);
			} else
				throw "notPropertyClauseException";
		} catch (e) {
			jQuery.sap.log.error(e);
			throw (e);
		}
	},
	sparql : function() {
		return this.oPropertyClause.sparql();
	},
	facetSparql : function() {
		return this.oPropertyClause.facetSparql();
	},
	sparqlish : function() {
		return (this.oPropertyClause.sparqlish());
	},
	viewModel : function(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex) {
		return this.oPropertyClause.viewModel(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex);
	},
	odataFilter : function(sVersion, oParameters) {
		return this.oPropertyClause.odataFilter(sVersion, oParameters);
	},
	odataFilterSet : function(sVersion, oParameters) {
		return this.oPropertyClause.odataFilterSet(sVersion, oParameters);
	},
	odataSelect : function(sVersion) {
		return this.oPropertyClause.odataSelect(sVersion);
	},
	odataExpand : function(sVersion) {
		return this.oPropertyClause.odataExpand(sVersion);
	},
	odataExpandSelect : function(sVersion) {
		return this.oPropertyClause.odataExpandSelect(sVersion);
	},
	odataSelectForExpand : function(sVersion) {
		return this.oPropertyClause.odataSelectForExpand(sVersion);
	},
	odataCustomQueryOptions : function(sVersion) {
		return this.oPropertyClause.odataCustomQueryOptions(sVersion);
	},
	odataCustomQueryOptionsList : function(sVersion) {
		return this.oPropertyClause.odataCustomQueryOptionsList(sVersion);
	}
});
sap.ui.base.Object.extend("DataPropertyClause", {
	constructor : function(oDataMetaModel, oAST, oContext) {
		this.oDataMetaModel = oDataMetaModel;
		this.oAST = oAST;
		try {
			if (oAST["_class"] != "DataPropertyClause")
				throw "notDataPropertyClauseException";
			// this.sDataProperty = oAST["dataProperty"];
			if (!jQuery.isEmptyObject(oAST["dataPropertyFilters"])&&!jQuery.isEmptyObject(oAST["dataPropertyFilters"]["dataPropertyFilter"])) {
				this.oFilters = new DataPropertyFilters(this.oDataMetaModel, oAST["dataPropertyFilters"], oContext);
			} else {
				this.oFilters = null;
			}
			this.oContext = oContext;
			if (this.oContext.sOdataEntityPath == "") {
				this.oContext.sOdataEntityPath = this.oAST["dataProperty"];
			} else {
				this.oContext.sOdataEntityPath = this.oContext.sOdataEntityPath + "/" + this.oAST["dataProperty"];
			}
		} catch (e) {
			jQuery.sap.log.error(e);
			throw (e);
		}
	},
	sparql : function() {
		var sSparql = "{" + sPrefix + this.oContext.sSubject + " " + this.oAST["dataProperty"] + " " + sPrefix /* ?o */+ this.oContext.sObject + " . "
		if (!jQuery.isEmptyObject(this.oFilters)) {
			return sSparql + this.oFilters.sparql() + "}";
		} else {
			return sSparql + "}";
		}
	},
	facetSparql : function() {
		return this.sparql();
	},
	sparqlish : function() {
		var sSparqlish = sparqlish.labelFromURI(this.oAST["dataProperty"]);
		if (!jQuery.isEmptyObject(this.oFilters)) {
			return sSparqlish + this.oFilters.sparqlish();
		} else {
			return sSparqlish;
		}
	},
	viewModel : function(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex) {
		return {
			"keyVariable" : sKeyVariable + ":" + this.oAST["dataProperty"],
			"resultsPath" : sResultsPath + "/" + this.oAST["dataProperty"],
			"resultsContext" : sResultsContext + "/" + this.oAST["dataProperty"],
			"field" : this.oAST["dataProperty"],
			"type" : this.type
		};
	},
	odataFilter : function(sVersion, oParameters) {
		var sOdataFilter = "";
		if (!jQuery.isEmptyObject(this.oFilters)) {
			return sOdataFilter + this.oFilters.odataFilter(sVersion, oParameters);
		} else {
			return sOdataFilter;
		}
	},
	odataFilterSet : function(sVersion, oParameters) {
		if (!jQuery.isEmptyObject(this.oFilters)) {
			return this.oFilters.odataFilterSet(sVersion, oParameters);
		} else {
			return null;
		}
	},
	odataSelect : function(sVersion) {
		return this.oContext.sOdataEntityPath;
	},
	odataExpand : function(sVersion) {
		return "";
	},
	odataExpandSelect : function(sVersion) {
		return "";
	},
	odataSelectForExpand : function(sVersion) {
		return this.oAST["dataProperty"];
	},
	odataCustomQueryOptions : function(sVersion) {
		return "";
	},
	odataCustomQueryOptionsList : function(sVersion) {
		return null;
	}
});
sap.ui.base.Object.extend("DataPropertyFilters", {
	constructor : function(oDataMetaModel, oAST, oContext) {
		this.oDataMetaModel = oDataMetaModel;
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "DataPropertyFilters")
				throw "notFiltersException";
			if (!jQuery.isEmptyObject(oAST["dataPropertyFilter"])) {
				this.oFilter = new DataPropertyFilter(this.oDataMetaModel, oAST["dataPropertyFilter"], oContext);
				if (!jQuery.isEmptyObject(oAST["conjunctionFilters"])) {
					this.oConjunctionFilters = [];
					for (var i = 0; i < oAST["conjunctionFilters"].length; i++) {
						this.oConjunctionFilters[i] = new ConjunctionFilter(this.oDataMetaModel, oAST["conjunctionFilters"][i], oContext);
					}
				} else {
					this.oConjunctionFilters = null;
				}
			}else{
				this.oFilter =null;
				this.oConjunctionFilters = null;
			}
		} catch (e) {
			jQuery.sap.log.error(e);
			throw (e);
		}
	},
	sparql : function() {
		if (!jQuery.isEmptyObject(this.oFilter)) {
			var sSparql = "FILTER(" + this.oFilter.sparql();
			if (!jQuery.isEmptyObject(this.oConjunctionFilters)) {
				for (var i = 0; i < this.oConjunctionFilters.length; i++) {
					sSparql = sSparql + this.oConjunctionFilters[i].sparql();
				}
				return sSparql + ")";
			} else {
				return sSparql + ")";
			}
		} else {
			return "";
		}
	},
	sparqlish : function() {
		if (!jQuery.isEmptyObject(this.oFilter)) {
			var sSparqlish = " " + this.oFilter.sparqlish();
			if (!jQuery.isEmptyObject(this.oConjunctionFilters)) {
				for (var i = 0; i < this.oConjunctionFilters.length; i++) {
					sSparqlish = sSparqlish + this.oConjunctionFilters[i].sparqlish();
				}
				return "{" + sSparqlish + "}";
			} else {
				return sSparqlish;
			}
		} else {
			return "";
		}
	},
	odataFilter : function(sVersion, oParameters) {
		if (!jQuery.isEmptyObject(this.oFilter)) {
			var sOdataFilter = this.oFilter.odataFilter(sVersion, oParameters);
			if (!jQuery.isEmptyObject(this.oConjunctionFilters)) {
				for (var i = 0; i < this.oConjunctionFilters.length; i++) {
					sOdataFilter = sOdataFilter + this.oConjunctionFilters[i].odataFilter(sVersion, oParameters);
				}
				return "(" + sOdataFilter + ")";
			} else {
				return sOdataFilter;
			}
		} else {
			return "";
		}
	},
	odataFilterSet : function(sVersion, oParameters) {
		if (!jQuery.isEmptyObject(this.oFilter)) {
			var oOdataFilter = this.oFilter.odataFilterSet(sVersion, oParameters);
			if (!jQuery.isEmptyObject(this.oConjunctionFilters)) {
				var oOdataFilterset;
				for (var i = 0; i < this.oConjunctionFilters.length; i++) {
					oOdataFilterset = {
						_class : "filterset",
						filters : {
							0 : oOdataFilter
						}
					};
					oOdataFilterset.and = ((this.oConjunctionFilters[i].oAST.filterConjunction == "and") ? true : false);
					oOdataFilterset.filters[i + 1] = this.oConjunctionFilters[i].odataFilterSet(sVersion, oParameters);
					oOdataFilter = oOdataFilterset;
				}
				return oOdataFilterset;
			} else {
				return oOdataFilter;
			}
		} else {
			return null;
		}
	},
	odataSelect : function(sVersion) {
		return "";
	},
	odataExpand : function(sVersion) {
		return "";
	},
	odataExpandSelect : function(sVersion) {
		return "";
	}
});
sap.ui.base.Object.extend("DataPropertyFilter", {
	constructor : function(oDataMetaModel, oAST, oContext) {
		this.oDataMetaModel = oDataMetaModel;
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "DataPropertyFilter")
				throw "notFilterException";

			// this.sOperator = oAST["operator"];
			// this.sValue = oAST["value"];
			// this.sDatatype = oAST["datatype"];
			// this.sType = oAST["type"];

		} catch (e) {
			jQuery.sap.log.error(e);
			throw (e);
		}
	},
	sparql : function() {
		// var sSparql = sparqlish.sparqlFilterOperator(sPrefix /* ?o */+ this.oContext.sObject, this.sOperator,
		// this.sValue,
		// this.sType);
		var sSparql = sparqlish.sparqlFilterOperator(sPrefix /* ?o */+ this.oContext.sObject, this.oAST["operator"], this.oAST["value"], this.oAST["type"]);
		return sSparql;
	},
	sparqlish : function() {
		// var sSparqlish = this.sOperator + " " + this.sValue;
		var sSparqlish = this.oAST["operator"] + " " + this.oAST["value"];
		return sSparqlish;
	},
	odataFilter : function(sVersion, oParameters) {
		// var sOdataFilter = sparqlish.odataFilterOperator(sVersion, this.oContext.sOdataEntityPath, this.sOperator,
		// this.sValue,
		// this.sType, oParameters);
		var sOdataFilter = sparqlish.odataFilterOperator(sVersion, this.oContext.sOdataEntityPath, this.oAST["operator"], this.oAST["value"], this.oAST["type"],
				oParameters);
		return sOdataFilter;
	},
	odataFilterSet : function(sVersion, oParameters) {
		var oOdataFilterSet = sparqlish.odataFilterSetOperator(sVersion, this.oContext.sOdataEntityPath, this.oAST["operator"], this.oAST["value"],
				this.oAST["type"], oParameters);
		return oOdataFilterSet;
	},
	odataSelect : function(sVersion) {
		return "";
	},
	odataExpand : function(sVersion) {
		return "";
	},
	odataExpandSelect : function(sVersion) {
		return "";
	},
	odataSelectForExpand : function(sVersion) {
		return "";
	}
});
sap.ui.base.Object.extend("ConjunctionFilter", {
	constructor : function(oDataMetaModel, oAST, oContext) {
		this.oDataMetaModel = oDataMetaModel;
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "ConjunctionFilter")
				throw "notConjunctionFilterException";
			this.sFilterConjunction = oAST["filterConjunction"];
			this.oFilter = new DataPropertyFilter(this.oDataMetaModel, oAST["dataPropertyFilter"], oContext);
		} catch (e) {
			jQuery.sap.log.error(e);
			throw (e);
		}
	},
	sparql : function() {
		return " " + sparqlish.sparqlFilterConjunction(this.sFilterConjunction) + " " + this.oFilter.sparql();
	},
	sparqlish : function() {
		return " " + this.sFilterConjunction + " " + this.oFilter.sparqlish();
	},
	odataFilter : function(sVersion, oParameters) {
		return sparqlish.odataFilterConjunction(sVersion, this.sFilterConjunction) + this.oFilter.odataFilter(sVersion, oParameters);
	},
	odataFilterSet : function(sVersion, oParameters) {
		// return sparqlish.odataFilterConjunction(sVersion, this.sFilterConjunction) +
		// this.oFilter.odataFilterSet(sVersion, oParameters);
		return this.oFilter.odataFilterSet(sVersion, oParameters);
	},
	odataSelect : function(sVersion) {
		return this.oFilter.odataSelect(sVersion);
	},
	odataExpand : function(sVersion) {
		return "";
	},
	odataExpandSelect : function(sVersion) {
		return "";
	},
	odataSelectForExpand : function(sVersion) {
		return "";
	}
});
sap.ui.base.Object.extend("ObjectPropertyClause", {
	constructor : function(oDataMetaModel, oAST, oContext) {
		this.oDataMetaModel = oDataMetaModel;
		this.oAST = oAST;
		try {
			if (oAST["_class"] != "ObjectPropertyClause")
				throw "notObjectPropertyClauseException";
			// this.sObjectProperty = oAST["objectProperty"];
			if (!jQuery.isEmptyObject(oAST["objectPropertyFilters"])) {
				this.oObjectPropertyFilters = oAST["objectPropertyFilters"];
			} else {
				this.oObjectPropertyFilters = null;
			}
			this.oContext = oContext;
			if (this.oContext.sOdataEntityPath == "") {
				this.oContext.sOdataEntityPath = this.oAST["objectProperty"];
			} else {
				this.oContext.sOdataEntityPath = this.oContext.sOdataEntityPath + "/" + this.oAST["objectProperty"];
			}

			if (!jQuery.isEmptyObject(oAST["clauses"]) && (oAST["clauses"]._class == "Clauses")) {
				var oNewContext = {
					sOdataEntityPath : oContext.sOdataEntityPath,
					sSubject : oContext.sObject,
					sObject : oContext.sObject + "_",
					iLevel : oContext.iLevel + 1
				};
				this.oClauses = new Clauses(this.oDataMetaModel, oAST["clauses"], oNewContext);
			} else {
				this.oClauses = null;
			}
		} catch (e) {
			jQuery.sap.log.error(e);
			throw (e);
		}
	},
	sparql : function() {
		var sSparql = "{" + sPrefix + this.oContext.sSubject + " " + this.oAST["objectProperty"] + " " + sPrefix + this.oContext.sObject + ". OPTIONAL{" + sPrefix
				+ this.oContext.sObject + " rdfs:label " + sPrefix + this.oContext.sObject + sLabelPostfix + "}";
		sSparql = sSparql + sparqlish.sparqlKeyFilters(sPrefix + this.oContext.sObject, this.oObjectPropertyFilters);
		if (!jQuery.isEmptyObject(this.oClauses)) {
			return sSparql + "\n" + this.oClauses.sparql() + "}";
		} else {
			return sSparql + "}";
		}
	},
	facetSparql : function() {
		return "{" + sPrefix + this.oContext.sSubject + " " + this.oAST["objectProperty"] + " " + sPrefix + this.oContext.sObject + ". OPTIONAL{" + sPrefix
				+ this.oContext.sObject + " rdfs:label " + sPrefix + this.oContext.sObject + sLabelPostfix + "}" + "}";
	},
	sparqlish : function() {
		if (!jQuery.isEmptyObject(this.oObjectPropertyFilters)) {
			return sparqlish.labelFromURI(this.oAST["objectProperty"]) + " in " + sparqlish.sparqlishKeyFilters(this.oObjectPropertyFilters);
		} else {
			return sparqlish.labelFromURI(this.sObjectProperty);
		}
	},
	viewModel : function(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex) {
		var oViewModel = {};
		var sContext = "";
		if (this.oAST.multiplicity === "*")
			sContext = "/results/{=P" + iClauseIndex + "}";
		if (!jQuery.isEmptyObject(this.oClauses)) {
			sparqlish.extendj(oViewModel, this.oClauses.viewModel(sPath, oClauseReferences, sKeyVariable + ":" + this.oAST["objectProperty"], sResultsPath + "/"
					+ this.oAST["objectProperty"], sResultsContext + "/" + this.oAST["objectProperty"] + sContext, iClauseIndex));
		}
		sparqlish.extendj(oViewModel, {
			"path" : sPath,
			"sparqlish" : this.sparqlish(),
			"keyVariable" : sKeyVariable + ":" + this.oAST["objectProperty"],
			"resultsPath" : sResultsPath + "/" + this.oAST["objectProperty"],
			"resultsContext" : sResultsContext + "/" + this.oAST["objectProperty"] + sContext,
			"field" : this.oAST["objectProperty"],
			"multiplicity" : this.oAST.multiplicity,
			"type" : metadata
		});
		return oViewModel;
	},
	odataFilter : function(sVersion, oParameters) {
		var sOdataFilter = "";
		if (!jQuery.isEmptyObject(this.oClauses)) {
			sOdataFilter = this.oClauses.odataFilter(sVersion, oParameters);
		}
		if (!jQuery.isEmptyObject(this.oObjectPropertyFilters) && (this.oObjectPropertyFilters.length > 0)) {
			if (sOdataFilter != "") {
				sOdataFilter = "(" + sparqlish.odataKeyFilters(sVersion, this.oContext.sOdataEntityPath, this.oObjectPropertyFilters, oParameters) + ")and"
						+ sOdataFilter;
			} else {
				sOdataFilter = "(" + sparqlish.odataKeyFilters(sVersion, this.oContext.sOdataEntityPath, this.oObjectPropertyFilters, oParameters) + ")";
			}
		}
		return sOdataFilter;
	},
	odataFilterSet : function(sVersion, oParameters) {
		var oOdataFilterSet = "";
		if (!jQuery.isEmptyObject(this.oClauses)) {
			oOdataFilterSet = this.oClauses.odataFilterSet(sVersion, oParameters);
		}
		if (!jQuery.isEmptyObject(this.oObjectPropertyFilters) && (this.oObjectPropertyFilters.length > 0)) {
			// if (sOdataFilter != "") {
			// sOdataFilter = "(" + sparqlish.odataKeyFilters(sVersion, this.oContext.sOdataEntityPath,
			// this.oObjectPropertyFilters,
			// oParameters) + ")and" + sOdataFilter;
			// } else {
			// sOdataFilter = "(" + sparqlish.odataKeyFilters(sVersion, this.oContext.sOdataEntityPath,
			// this.oObjectPropertyFilters,
			// oParameters) + ")";
			// }
		}
		return oOdataFilterSet;
	},
	odataSelect : function(sVersion) {
		if ((sVersion == "V4") && (this.oContext.iLevel >= 0)) {
			return "";
		} else {
			var sOdataSelect = [];
			if (!jQuery.isEmptyObject(this.oClauses) && !jQuery.isEmptyObject(this.oClauses.oClause)) {
				sOdataSelect = this.oClauses.odataSelect(sVersion);
			}
			if (!jQuery.isEmptyObject(this.oObjectPropertyFilters) && (this.oObjectPropertyFilters.length > 0)) {
				if (!jQuery.isEmptyObject(sOdataSelect)) {// sOdataSelect != "") {
					sOdataSelect = sparqlish.odataKeys(sVersion, this.oContext.sOdataEntityPath, this.oObjectPropertyFilters) + "," + sOdataSelect;
				} else {
					sOdataSelect = sparqlish.odataKeys(sVersion, this.oContext.sOdataEntityPath, this.oObjectPropertyFilters);
				}
			} else if (!(!jQuery.isEmptyObject(this.oClauses) && !jQuery.isEmptyObject(this.oClauses.oClause))) {
				if (!jQuery.isEmptyObject(sOdataSelect)) {
					sOdataSelect.unshift(this.oContext.sOdataEntityPath)
				} else {
					sOdataSelect.push(this.oContext.sOdataEntityPath);
				}
			}
			return sOdataSelect;
		}
	},
	odataExpand : function(sVersion) {
		var sClausesExpand = [];
		if (!jQuery.isEmptyObject(this.oClauses)) {
			sClausesExpand = this.oClauses.odataExpand(sVersion);
		}
		if (jQuery.isEmptyObject(sClausesExpand)) {
			return this.oAST["objectProperty"];
		} else {
			var odataExpand = []
			odataExpand.push(this.oAST["objectProperty"])
			for (sClauseExpand in sClausesExpand) {
				odataExpand.push(this.oAST["objectProperty"] + "/" + sClausesExpand[sClauseExpand]);
			}
			return odataExpand;
		}
	},
	odataExpandSelect : function(sVersion) {
		var sOdataExpandSelect = "";
		var sOdataSelect = "";
		if (!jQuery.isEmptyObject(this.oClauses)) {
			sOdataExpandSelect = this.oClauses.odataExpandSelect(sVersion);
			sOdataSelect = this.oClauses.odataSelectForExpand(sVersion);
			if (!jQuery.isEmptyObject(this.oObjectPropertyFilters)) {
				sOdataSelect = sparqlish.odataKeys(sVersion, "", this.oObjectPropertyFilters) + "," + sOdataSelect;
			}
		}
		if (sOdataExpandSelect == "") {
			return this.oAST["objectProperty"] + "($select=" + sOdataSelect + ")";
		} else {
			return this.oAST["objectProperty"] + "($select=" + sOdataSelect + ")," + this.oAST["objectProperty"] + "($expand=" + sOdataExpandSelect + ")";
		}
	},
	odataSelectForExpand : function(sVersion) {
		return "";
	},
	odataCustomQueryOptions : function(sVersion) {
		var odataCustomQueryOptions = "";
		if (!jQuery.isEmptyObject(this.oAST.operationParameters)) {
			for (operationParameterIndex in this.oAST.operationParameters) {
				var operationParameter = this.oAST.operationParameters[operationParameterIndex];
				odataCustomQueryOptions = odataCustomQueryOptions + "&" + operationParameter.name + "="
						+ sparqlish.odataValue(sVersion, operationParameter.value, operationParameter.type, this.oAST.parameters);
			}
		}
		return odataCustomQueryOptions;
	},
	odataCustomQueryOptionsList : function(sVersion) {
		var odataCustomQueryOptionsList = {};
		if (!jQuery.isEmptyObject(this.oAST.operationParameters)) {
			for (operationParameterIndex in this.oAST.operationParameters) {
				var operationParameter = this.oAST.operationParameters[operationParameterIndex];
				odataCustomQueryOptionsList[operationParameter.name]= sparqlish.odataValue(sVersion, operationParameter.value, operationParameter.type, this.oAST.parameters);
			}
		}
		return odataCustomQueryOptionsList;
	}
});
sap.ui.base.Object.extend("InverseObjectPropertyClause", {
	constructor : function(oDataMetaModel, oAST, oContext) {
		this.oDataMetaModel = oDataMetaModel;
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "InverseObjectPropertyClause")
				throw "notInverseObjectPropertyClauseException";
			// this.sInverseObjectProperty = oAST["inverseObjectProperty"];

			if (!jQuery.isEmptyObject(oAST["clauses"])) {
				var oNewContext = {
					sOdataEntityPath : oContext.sOdataEntityPath + "/" + "Inverseproperty",
					sSubject : oContext.sSubject,
					sObject : oContext.sSubject + "_",
					iLevel : oContext.iLevel + 1
				};
				this.oClauses = new Clauses(this.oDataMetaModel, oAST["clauses"], oNewContext);
			} else {
				this.oClauses = null;
			}

		} catch (e) {
			jQuery.sap.log.error(e);
			throw (e);
		}
	},
	sparql : function() {
		var sSparql = "{" + sPrefix + this.oContext.sObject + " " + this.oAST["inverseObjectProperty"] + " " + sPrefix + this.oContext.sSubject + ". OPTIONAL{"
				+ sPrefix + this.oContext.sObject + " rdfs:label " + sPrefix + this.oContext.sObject + sLabelPostfix + "}";
		if (!jQuery.isEmptyObject(this.oClauses)) {
			return sSparql + "\n" + this.oClauses.sparql() + "}";
		} else {
			return sSparql + "}";
		}
	},
	facetSparql : function() {
		return "{" + sPrefix + this.oContext.sObject + " " + this.oAST["inverseObjectProperty"] + " " + sPrefix + this.oContext.sSubject + ". OPTIONAL{" + sPrefix
				+ this.oContext.sObject + " rdfs:label " + sPrefix + this.oContext.sObject + sLabelPostfix + "}" + "}";
	},
	sparqlish : function() {
		return "that which " + sparqlish.labelFromURI(this.sInverseObjectProperty);
	},
	viewModel : function(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex) {
		var oViewModel = {};
		if (!jQuery.isEmptyObject(this.oClauses)) {
			sparqlish.extendj(oViewModel, this.oClauses.viewModel(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex));
		}
		sparqlish.extendj(oViewModel, {
			"path" : sPath,
			"sparqlish" : this.sparqlish()
		});
		return oViewModel;
	},
	odataFilter : function(sVersion, oParameters) {
		return "";
	},
	odataFilterSet : function(sVersion, oParameters) {
		return null;
	},
	odataSelect : function(sVersion) {
		return "";
	},
	odataExpand : function(sVersion) {
		return "";
	},
	odataExpandSelect : function(sVersion) {
		return "";
	}
});
sap.ui.base.Object.extend("OperationClause", {
	constructor : function(oDataMetaModel, oAST, oContext) {
		this.oDataMetaModel = oDataMetaModel;
		this.oAST = oAST;
		this.oContext = oContext;
		try {
			if (oAST["_class"] != "OperationClause")
				throw "notOperationClauseException";
			// this.sOperation = oAST["operation"];

			if (!jQuery.isEmptyObject(oAST["clauses"])) {
				var oNewContext = {
					sSubject : oContext.sSubject,
					sObject : oContext.sSubject + "_",
					iLevel : oContext.iLevel + 1
				};
				this.oClauses = new Clauses(this.oDataMetaModel, oAST["clauses"], oNewContext);
			} else {
				this.oClauses = null;
			}

		} catch (e) {
			jQuery.sap.log.error(e);
			throw (e);
		}
	},
	sparql : function() {
		var sSparql = "{" + sPrefix + this.oContext.sObject + " " + this.oAST["operation"] + " " + sPrefix + this.oContext.sSubject;
		if (!jQuery.isEmptyObject(this.oClauses)) {
			return sSparql + "\n" + this.oClauses.sparql() + "}";
		} else {
			return sSparql + "}";
		}
	},
	facetSparql : function() {
		return "{" + sPrefix + this.oContext.sObject + " " + this.oAST["inverseObjectProperty"] + " " + sPrefix + this.oContext.sSubject + ". OPTIONAL{" + sPrefix
				+ this.oContext.sObject + " rdfs:label " + sPrefix + this.oContext.sObject + sLabelPostfix + "}" + "}";
	},
	sparqlish : function() {
		return " " + sparqlish.labelFromURI(this.oAST["operation"]);
	},
	viewModel : function(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex) {
		var oViewModel = {};
		if (!jQuery.isEmptyObject(this.oClauses)) {
			sparqlish.extendj(oViewModel, this.oClauses.viewModel(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex));
		}
		sparqlish.extendj(oViewModel, {
			"path" : sPath,
			"sparqlish" : this.sparqlish()
		});
		return oViewModel;
	},
	odataFilter : function(sVersion, oParameters) {
		return "";
	},
	odataFilterSet : function(sVersion, oParameters) {
		return null;
	},
	odataSelect : function(sVersion) {
		return "";
	},
	odataExpand : function(sVersion) {
		return "";
	},
	odataExpandSelect : function(sVersion) {
		return "";
	}
});
sap.ui.base.Object.extend("ComplexDataPropertyClause", {
	constructor : function(oDataMetaModel, oAST, oContext) {
		this.oDataMetaModel = oDataMetaModel;
		this.oAST = oAST;
		try {
			if (oAST["_class"] != "ComplexDataPropertyClause")
				throw "notComplexDataPropertyClauseException";
			// this.sComplexDataProperty = oAST["complexDataProperty"];
			this.oContext = oContext;
			if (this.oContext.sOdataEntityPath == "") {
				this.oContext.sOdataEntityPath = this.oAST["complexDataProperty"];
			} else {
				this.oContext.sOdataEntityPath = this.oContext.sOdataEntityPath + "/" + this.oAST["complexDataProperty"];
			}

			if (!jQuery.isEmptyObject(oAST["clauses"]) && (oAST["clauses"]._class == "Clauses")) {
				var oNewContext = {
					sOdataEntityPath : oContext.sOdataEntityPath,
					sSubject : oContext.sObject,
					sObject : oContext.sObject + "_",
					iLevel : oContext.iLevel + 1
				};
				this.oClauses = new Clauses(this.oDataMetaModel, oAST["clauses"], oNewContext);
			} else {
				this.oClauses = null;
			}
		} catch (e) {
			jQuery.sap.log.error(e);
			throw (e);
		}
	},
	sparql : function() {
		return "";
	},
	facetSparql : function() {
		return "";
		return "";
	},
	sparqlish : function() {
		return sparqlish.labelFromURI(this.oAST["complexDataProperty"]);
	},
	viewModel : function(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex) {
		var oViewModel = {};
		var sContext = "";
		if (this.oAST.multiplicity === "*")
			sContext = "/results/{=P" + iClauseIndex + "}";
		if (!jQuery.isEmptyObject(this.oClauses)) {
			sparqlish.extendj(oViewModel, this.oClauses.viewModel(sPath, oClauseReferences, sKeyVariable + ":" + this.oAST["complexDataProperty"], sResultsPath + "/"
					+ this.oAST["complexDataProperty"], sResultsContext + "/" + this.oAST["complexDataProperty"] + sContext, iClauseIndex));
		}
		sparqlish.extendj(oViewModel, {
			"path" : sPath,
			"sparqlish" : this.sparqlish(),
			"keyVariable" : sKeyVariable + ":" + this.oAST["complexDataProperty"],
			"resultsPath" : sResultsPath + "/" + this.oAST["complexDataProperty"],
			"resultsContext" : sResultsContext + "/" + this.oAST["complexDataProperty"] + sContext,
			"field" : this.oAST["complexDataProperty"],
			"multiplicity" : this.oAST.multiplicity,
			"type" : metadata
		});
		return oViewModel;
	},
	odataFilter : function(sVersion, oParameters) {
		var sOdataFilter = "";
		if (!jQuery.isEmptyObject(this.oClauses)) {
			sOdataFilter = this.oClauses.odataFilter(sVersion, oParameters);
		}
		return sOdataFilter;
	},
	odataFilterSet : function(sVersion, oParameters) {
		var oOdataFilterSet;
		if (!jQuery.isEmptyObject(this.oClauses)) {
			oOdataFilterSet = this.oClauses.odataFilterSet(sVersion, oParameters);
		}
		return oOdataFilterSet;
	},
	odataSelect : function(sVersion) {
		// Cannot navigate path of a complex type in a $select statement, can only retrive entire complex type in $select
		return this.oAST["complexDataProperty"];
	},
	odataExpand : function(sVersion) {
		var sClausesExpand = [];
		if (!jQuery.isEmptyObject(this.oClauses)) {
			sClausesExpand = this.oClauses.odataExpand(sVersion);
		}
		if (jQuery.isEmptyObject(sClausesExpand)) {
			return this.oAST["complexDataProperty"];
		} else {
			var odataExpand = []
			odataExpand.push(this.oAST["complexDataProperty"])
			for (sClauseExpand in sClausesExpand) {
				odataExpand.push(this.oAST["complexDataProperty"] + "/" + sClausesExpand[sClauseExpand]);
			}
			return odataExpand;
		}
	},
	odataExpandSelect : function(sVersion) {
		return "";
	},
	odataSelectForExpand : function(sVersion) {
		return "";
	},
	odataCustomQueryOptions : function(sVersion) {
		return "";
	},
	odataCustomQueryOptionsList : function(sVersion) {
		return null;
	}
});

(function(window) {
	"use strict";
	jQuery.sap.declare('lib.sparqlish');
	window.sparqlish = {};
	sparqlish.sparqlClauseConjunction = function(sConjunction) {
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
	sparqlish.sparqlKeyFilters = function(sVariable, oFilters) {
		var sSparql = "";
		if (!jQuery.isEmptyObject(oFilters)) {
			sSparql = sSparql + "VALUES(" + sVariable + "){";
			for (var i = 0; i < oFilters.length; i++) {
				sSparql = sSparql + "(" + sparqlish.sparqlValue(oFilters[i][0].value, oFilters[i][0].type) + ")"
			}
			sSparql = sSparql + "}";
		}
		return sSparql;
	};
	sparqlish.odataClauseConjunction = function(sConjunction) {
		switch (sConjunction) {
		case "and": {
			return "and";
		}
			;
		case "or": {
			return "or";
		}
			;
		default:
			throw "illegalClauseConjunction";
		}
	};
	sparqlish.sparqlFilterConjunction = function(sConjunction) {
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
	sparqlish.odataFilterConjunction = function(sVersion, sConjunction) {
		switch (sConjunction) {
		case "and": {
			return "and";
		}
			;
		case "or": {
			return "or";
		}
			;
		default:
			throw "illegalClauseConjunction";
		}
	};
	sparqlish.sparqlFilterOperator = function(sVariable, sOperator, sValue, sType) {
		var sSparqlValue = sparqlish.sparqlValue(sValue, sType);
		switch (sOperator) {
		case "eq": {
			return "(" + sVariable + "= " + sSparqlValue + ")";
		}
			;
		case "ne": {
			return "(" + sVariable + " != " + sSparqlValue + ")";
		}
			;
		case "gt": {
			return "(" + sVariable + " > " + sSparqlValue + ")";
		}
			;
		case "ge": {
			return "(" + sVariable + " >= " + sSparqlValue + ")";
		}
			;
		case "lt": {
			return "(" + sVariable + " < " + sSparqlValue + ")";
		}
			;
		case "le": {
			return "(" + sVariable + " <= " + sSparqlValue + ")";
		}
			;
		case "substringof": {
			return "(REGEX(" + sVariable + ", " + sSparqlValue + ",'i'))";
		}
			;
		case "endswith": {
			return "*ERROR*";
		}
			;
		case "startswith": {
			return "*ERROR*";
		}
			;
		case "between": {
			return "*ERROR*";
		}
			;
			// case "after": {
			// return "(" + sVariable + " > " + sSparqlValue + ")";
			// }
			// ;
			// case "before": {
			// return "(" + sVariable + " < " + sSparqlValue + ")";
			// }
			// ;
		default:
			throw "illegalFilterOperator";
		}
	};
	sparqlish.odataFilterOperator = function(sVersion, sVariable, sOperator, sValue, sType, oParameters) {
		if (jQuery.isEmptyObject(sValue)) {
			return "";
		} else {
			switch (sOperator) {
			case "eq": {
				return "(" + sVariable + " eq " + sparqlish.odataValue(sVersion, sValue, sType, oParameters) + ")";
			}
			case "ne": {
				return "(" + sVariable + " ne " + sparqlish.odataValue(sVersion, sValue, sType, oParameters) + ")";
			}
			case "gt": {
				return "(" + sVariable + " gt " + sparqlish.odataValue(sVersion, sValue, sType, oParameters) + ")";
			}
			case "ge": {
				return "(" + sVariable + " ge " + sparqlish.odataValue(sVersion, sValue, sType, oParameters) + ")";
			}
			case "lt": {
				return "(" + sVariable + " lt " + sparqlish.odataValue(sVersion, sValue, sType, oParameters) + ")";
			}
			case "le": {
				return "(" + sVariable + " le " + sparqlish.odataValue(sVersion, sValue, sType, oParameters) + ")";
			}
			case "substringof": {
				// TODO
				if (sVersion == "V4") {
					return "(contains(" + sVariable + "," + sparqlish.odataValue(sVersion, sValue, sType, oParameters) + "))";
				} else {
					return "(substringof(" + sparqlish.odataValue(sVersion, sValue, sType, oParameters) + "," + sVariable + "))";
				}
			}
			case "endswith": {
				// TODO
				if (sVersion == "V4") {
					return "(contains(" + sVariable + "," + sparqlish.odataValue(sVersion, sValue, sType, oParameters) + "))";
				} else {
					return "(endswith(" + sparqlish.odataValue(sVersion, sValue, sType, oParameters) + "," + sVariable + "))";
				}
			}
			case "startswith": {
				// TODO
				if (sVersion == "V4") {
					return "(contains(" + sVariable + "," + sparqlish.odataValue(sVersion, sValue, sType, oParameters) + "))";
				} else {
					return "(startswith(" + sparqlish.odataValue(sVersion, sValue, sType, oParameters) + "," + sVariable + "))";
				}
			}
			case "between": {
				return "*ERROR*";
			}
			default:
				throw "illegalFilterOperator";
			}
		}
	};
	sparqlish.odataFilterSetOperator = function(sVersion, sVariable, sOperator, sValue, sType, oParameters) {
		if (jQuery.isEmptyObject(sValue)) {
			return null;
		} else {
			var value1 = sparqlish.deparameterizeValue(sValue, sType, oParameters);
			switch (sOperator) {
			case "eq": {
				return {
					"_class" : "filter",
					"path" : sVariable,
					"operator" : sap.ui.model.FilterOperator.EQ,
					"value1" : value1
				}
			}
			case "ne": {
				return {
					"_class" : "filter",
					"path" : sVariable,
					"operator" : sap.ui.model.FilterOperator.NE,
					"value1" : value1
				}
			}
			case "gt": {
				return {
					"_class" : "filter",
					"path" : sVariable,
					"operator" : sap.ui.model.FilterOperator.GT,
					"value1" : value1
				}
			}
			case "ge": {
				return {
					"_class" : "filter",
					"path" : sVariable,
					"operator" : sap.ui.model.FilterOperator.GE,
					"value1" : value1
				}
			}
			case "lt": {
				return {
					"_class" : "filter",
					"path" : sVariable,
					"operator" : sap.ui.model.FilterOperator.LT,
					"value1" : value1
				}
			}
			case "le": {
				return {
					"_class" : "filter",
					"path" : sVariable,
					"operator" : sap.ui.model.FilterOperator.EQ,
					"value1" : value1
				}
			}
			case "substringof": {
				// TODO
				if (sVersion == "V4") {
					// return "(contains(" + sVariable + "," + sparqlish.odataValue(sVersion, sValue, sType, oParameters) + "))";
				} else {
					return {
						"_class" : "filter",
						"path" : sVariable,
						"operator" : sap.ui.model.FilterOperator.Contains,
						"value1" : utils.stringifyNumeric(value1)
					}
				}
			}
			case "endswith": {
				// TODO
				if (sVersion == "V4") {
					// return "(contains(" + sVariable + "," + sparqlish.odataValue(sVersion, sValue, sType, oParameters) + "))";
				} else {
					return {
						"_class" : "filter",
						"path" : sVariable,
						"operator" : sap.ui.model.FilterOperator.EndsWith,
						"value1" : utils.stringifyNumeric(value1)
					}
				}
			}
			case "startswith": {
				// TODO
				if (sVersion == "V4") {
					return "(contains(" + sVariable + "," + sparqlish.odataValue(sVersion, sValue, sType, oParameters) + "))";
				} else {
					return {
						"_class" : "filter",
						"path" : sVariable,
						"operator" : sap.ui.model.FilterOperator.StartsWith,
						"value1" : utils.stringifyNumeric(value1)
					}
				}
			}
			case "between": {
				return "*ERROR*";
			}
			default:
				throw "illegalFilterOperator";
			}
		}
	};
	sparqlish.odataValue = function(sVersion, sValue, sType, oParameters) {
		/*
		 * Edm.Binary Edm.Boolean Edm.Byte Edm.DateTime Edm.Decimal Edm.Double Edm.Single Edm.Guid Edm.Int16 Edm.Int32
		 * Edm.Int64 Edm.SByte Edm.String Edm.Time Edm.DateTimeOffset Edm.Geography Edm.GeographyPoint
		 * Edm.GeographyLineString Edm.GeographyPolygon Edm.GeographyMultiPoint Edm.GeographyMultiLineString
		 * Edm.GeographyMultiPolygon Edm.GeographyCollection Edm.Geometry Edm.GeometryPoint Edm.GeometryLineString
		 * Edm.GeometryPolygon Edm.GeometryMultiPoint Edm.GeometryMultiLineString Edm.GeometryMultiPolygon
		 * Edm.GeometryCollection Edm.Stream
		 */
		switch (sType) {
		case "Edm.Decimal":
		case "Edm.Double":
		case "Edm.Single":
		case "Edm.Guid":
		case "Edm.Int16":
		case "Edm.Int32":
		case "Edm.Int64":
		case "Edm.SByte": {
			return sparqlish.deparameterizeValue(sValue, sType, oParameters);
		}
		case "Edm.String": {
			return "'" + sparqlish.deparameterizeValue(sValue, sType, oParameters) + "'";
		}
		case "Edm.Time":
		case "Edm.DateTime": {
			if (sVersion == "V4") {
				return sparqlish.deparameterizeValue(sValue, sType, oParameters);
			} else {
				// TODO need to simplify this. The idea is to convert to UTC as this is the lowest common denominator of V2
				// Odata
				// services. Not all (Olingo for example) support timezones.
				var oDateTime = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern : "yyyy-MM-dd'T'HH:mm:ssXXXXX"
				}).parse(sparqlish.deparameterizeValue(sValue, sType, oParameters));
				var sDateTime = "datetime'" + sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern : "yyyy-MM-dd'T'HH:mm:ss",
					UTC : true
				}).format(oDateTime) + "'";
				return sDateTime;
			}
		}
		}
	};
	sparqlish.deparameterizeValue = function(sValue, sType, oParameters) {
		var sPathPattern = /{(.*)}/;
		if (sPathPattern.test(sValue)) {
			var sParam = sPathPattern.exec(sValue)[1];
			for (i = 0; oParameters.length; i++) {
				if ((oParameters[i].name == sParam))
					return oParameters[i].defaultValue;
			}
			return null;
		} else {
			return sValue;
		}
	};
	sparqlish.sparqlValue = function(sValue, sType) {
		/*
		 * Edm.Binary Edm.Boolean Edm.Byte Edm.DateTime Edm.Decimal Edm.Double Edm.Single Edm.Guid Edm.Int16 Edm.Int32
		 * Edm.Int64 Edm.SByte Edm.String Edm.Time Edm.DateTimeOffset Edm.Geography Edm.GeographyPoint
		 * Edm.GeographyLineString Edm.GeographyPolygon Edm.GeographyMultiPoint Edm.GeographyMultiLineString
		 * Edm.GeographyMultiPolygon Edm.GeographyCollection Edm.Geometry Edm.GeometryPoint Edm.GeometryLineString
		 * Edm.GeometryPolygon Edm.GeometryMultiPoint Edm.GeometryMultiLineString Edm.GeometryMultiPolygon
		 * Edm.GeometryCollection Edm.Stream
		 */
		switch (sType) {
		case "Edm.Decimal":
		case "Edm.Double":
		case "Edm.Single":
		case "Edm.Guid":
		case "Edm.Int16":
		case "Edm.Int32":
		case "Edm.Int64":
		case "Edm.SByte": {
			return sValue + sparqlish.sparqlCast(sparqlish.edmToXSD(sType));
		}
		case "Edm.String": {
			return "'" + sValue + "'" + sparqlish.sparqlCast(sparqlish.edmToXSD(sType));
		}
		case "Edm.Time":
		case "Edm.DateTime": {
			return "'" + sValue + "'" + sparqlish.sparqlCast(sparqlish.edmToXSD(sType));
		}
		default:
			return "'" + sValue + "'";
		}

	};
	sparqlish.sparqlCast = function(sXSDtype) {
		if (sXSDtype == "") {
			return "";
		} else {
			return "^^<" + sXSDtype + ">";
		}
	};
	sparqlish.sparqlishKeyFilters = function(oKeyFilters) {
		// TODO update to new format of keys
		var sSparqlishKeyFilters = "";
		for (var key = 0; key < oKeyFilters.length; key++) {
			var fields = Object.keys(oKeyFilters[key])
			if (key > 0) {
				sSparqlishKeyFilters = sSparqlishKeyFilters + " or ";
			}
			if (fields.length > 1) {
				sSparqlishKeyFilters = sSparqlishKeyFilters + "(";
			}
			for (var field = 0; field < fields.length; field++) {
				if (field > 0) {
					sSparqlishKeyFilters = sSparqlishKeyFilters + "and";
				}
				sSparqlishKeyFilters = sSparqlishKeyFilters + oKeyFilters[key][fields[field]];
			}
			if (fields.length > 1) {
				sSparqlishKeyFilters = sSparqlishKeyFilters + ")";
			}
		}
		return sSparqlishKeyFilters;
	};
	sparqlish.odataKeyFilters = function(sVersion, sOdataEntityPath, oKeyFilters, oParameters) {
		var sOdataKeyFilters = "";
		for (var keys = 0; keys < oKeyFilters.length; keys++) {
			if (keys > 0) {
				sOdataKeyFilters = sOdataKeyFilters + "or(";
			} else {
				sOdataKeyFilters = sOdataKeyFilters + "(";
			}
			for (var key = 0; key < oKeyFilters[keys].length; key++) {
				if (key > 0) {
					sOdataKeyFilters = sOdataKeyFilters + "and";
				}
				sOdataKeyFilters = sOdataKeyFilters + "(" + ((sOdataEntityPath.length == 0) ? "" : (sOdataEntityPath + "/")) + oKeyFilters[keys][key].key + " eq "
						+ sparqlish.odataValue(sVersion, oKeyFilters[keys][key].value, oKeyFilters[keys][key].type, oParameters) + ")";
			}
			sOdataKeyFilters = sOdataKeyFilters + ")";
		}
		return jQuery.isEmptyObject(sOdataKeyFilters) ? "" : "(" + sOdataKeyFilters + ")";
	};
	sparqlish.odataKeys = function(sVersion, sOdataEntityPath, oKeyFilters) {
		var oOdataKeys = [];
		for (var keys = 0; keys < oKeyFilters.length; keys++) {
			for (var key = 0; key < oKeyFilters[keys].length; key++) {
				var sNewKey = ((sOdataEntityPath.length == 0) ? "" : (sOdataEntityPath + "/")) + oKeyFilters[keys][key].key;
				if (oOdataKeys.indexOf(sNewKey)) {
					oOdataKeys.push(sNewKey);
				}
			}
		}
		return oOdataKeys.toString();
	};
	sparqlish.entityTypeKeyProperties = function(sEntityType) {
		var oEntityType = oDataMetaModel.getODataEntityType(sEntityType);
		if ((jQuery.isEmptyObject(oEntityType.key) && (!jQuery.isEmptyObject(oEntityType.baseType)))) {
			return sparqlish.entityTypeKeyProperties(oEntityType.baseType);
		} else {
			return oEntityType.key.propertyRef;
		}
		return null;
	};
	sparqlish.labelFromURI = function(sUri) {
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
	sparqlish.extendj = function() {
		for (var i = 1; i < arguments.length; i++)
			for ( var key in arguments[i])
				if (arguments[i].hasOwnProperty(key))
					arguments[0][key] = arguments[i][key];
		return arguments[0];
	};
	sparqlish.repeatString = function(sString, iRepeat) {
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
	sparqlish.edmToXSD = function(sType) {
		switch (sType) {
		case "Edm.String": {
			return "http://www.w3.org/2001/XMLSchema#string";
		}
		case "Edm.DateTime": {
			return "http://www.w3.org/2001/XMLSchema#date";
		}
		case "Edm.Int32": {
			return "http://www.w3.org/2001/XMLSchema#integer";
		}
		default: {
			return "";
		}
		}
	}
})(window);