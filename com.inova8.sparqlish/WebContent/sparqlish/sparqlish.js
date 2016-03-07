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
						// TODO
						sPath = sPath || "/";
						this.oAST = oAST || this.oAST;

						this.oClauseReferences = [];
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
							this.sLabel = (jQuery.isEmptyObject(this.oAST["label"])) ? labelFromURI(this.sConcept) : this.oAST["label"];
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
							var sValues = sparqlKeyFilters(sContext, this.oConceptFilters);
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
						var sValues = sparqlKeyFilters(sContext, this.oConceptFilters);
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
						var sValues = sparqlKeyFilters(sContext, this.oConceptFilters);
						if (!jQuery.isEmptyObject(this.oClauses)) {
							return ("{" + sContext + " a " + this.sConcept + ". OPTIONAL{" + sContext + " rdfs:label " + sContext + sLabelPostfix + "}" + sValues + "}\n" + this.oClauses
									.sparql());
						} else {
							return ("{" + sContext + " a " + this.sConcept + ". OPTIONAL{" + sContext + " rdfs:label " + sContext + sLabelPostfix + "}" + sValues + "}\n");
						}
					},
					sparqlish : function() {
						if (!jQuery.isEmptyObject(this.oConceptFilters)) {
							return "Find <embed data-index='0'>" + labelFromURI(this.sConcept) + " in " + sparqlishKeyFilters(this.oConceptFilters);
						} else {
							return "Find " + labelFromURI(this.sConcept);
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
						try {
							this.oClauseReferences[0] = this;
							// TODO
							var entitySetType = this.oDataMetaModel.getODataEntitySet(this.sConcept);
							var entityType = this.oDataMetaModel.getODataEntityType(entitySetType.entityType);
							var oViewModel = {
								"root" : {}
							};
							if (!jQuery.isEmptyObject(this.oClauses)) {
								// TODO when do we need to prefix resultContext with /d ?
								extendj(oViewModel.root, this.oClauses.viewModel(this.sPath, this.oClauseReferences, entityType.name, "", "{path}/{=P0}"), 0);// "/d/results/{=P0}"),
								// 0);
							}
							extendj(oViewModel.root, {
								"path" : this.sPath,
								"resultsPath" : "",
								"resultsContext" : "{path}/{=P0}",// "/d/results/{=P0}",
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
						return this.sConcept + "()";
					},
					odataFilter : function(sVersion) {
						var sClausesFilter = "";
						if (!jQuery.isEmptyObject(this.oClauses)) {
							sClausesFilter = this.oClauses.odataFilter(sVersion, this.oAST.parameters);
						}
						if (!jQuery.isEmptyObject(this.oConceptFilters)) {
							var sOdataKeyFilters = odataKeyFilters(sVersion, this.oContext.sOdataEntityPath, this.oConceptFilters, this.oAST.parameters);
							if (sClausesFilter != "") {
								return jQuery.isEmptyObject(sOdataKeyFilters) ? "$filter=(" + sClausesFilter + ")" : "$filter=((" + sOdataKeyFilters + ")and(" + sClausesFilter
										+ "))";
							} else {
								return jQuery.isEmptyObject(sOdataKeyFilters) ? "" : "$filter=(" + sOdataKeyFilters + ")";
							}
						} else {
							if (sClausesFilter != "") {
								return "$filter=(" + sClausesFilter + ")";
							} else {
								return "";
							}
						}
					},
					odataSelect : function(sVersion) {
						var sSelect = "";
						if (!jQuery.isEmptyObject(this.oClauses)) {
							sSelect = this.oClauses.odataSelect(sVersion);
						}
						if (!jQuery.isEmptyObject(this.oConceptFilters)) {
							var sOdataKeys = odataKeys(sVersion, this.oContext.sOdataEntityPath, this.oConceptFilters);
							if (sSelect != "") {
								return jQuery.isEmptyObject(sOdataKeys) ? "$select=" + sSelect : "$select=" + sOdataKeys + "," + sSelect;
							} else {
								return jQuery.isEmptyObject(sOdataKeys) ? "" : "$select=" + sOdataKeys;
							}
						} else {
							if (sSelect != "") {
								return "$select=" + sSelect;
							} else {
								return "";
							}
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
									return "$expand=" + sOdataExpand;
								}
							}
						} else
							return "";
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
					odataURI : function(sVersion) {
						sVersion = sVersion || defaultVersion;
						return this.odataPath(sVersion) + "?" + this.odataFilter(sVersion) + "&" + this.odataExpand(sVersion) + "&" + this.odataSelect(sVersion) + "&"
								+ this.odataOptions(sVersion);
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
				extendj(oViewModel, oConjunctionClause);
			}
		}
		if (!jQuery.isEmptyObject(this.oClause)) {
			extendj(oViewModel, {
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
						sOdataFilter = sOdataFilter + odataClauseConjunction(this.oConjunctionClauses[i].sConjunction) + sOdataConjunctionClauseFilter;
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
	odataSelect : function(sVersion) {
		if (!jQuery.isEmptyObject(this.oClause)) {
			var sOdataSelect = this.oClause.odataSelect(sVersion);
			if (!jQuery.isEmptyObject(this.oConjunctionClauses)) {
				for (var i = 0; i < this.oConjunctionClauses.length; i++) {
					var sOdataConjunctionSelect = this.oConjunctionClauses[i].odataSelect(sVersion);
					if (sOdataConjunctionSelect != "") {
						if (sOdataSelect != "") {
							sOdataSelect = sOdataSelect + "," + sOdataConjunctionSelect;
						} else {
							sOdataSelect = sOdataConjunctionSelect
						}
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
			var sOdataExpand = this.oClause.odataExpand(sVersion);
			if (!jQuery.isEmptyObject(this.oConjunctionClauses)) {
				for (var i = 0; i < this.oConjunctionClauses.length; i++) {
					var sOdataConjunctionExpand = this.oConjunctionClauses[i].odataExpand(sVersion);

					if (sOdataConjunctionExpand != "") {
						if (sOdataExpand != "") {
							sOdataExpand = sOdataExpand + "," + sOdataConjunctionExpand;
						} else {
							sOdataExpand = sOdataConjunctionExpand;
						}
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
			var sOdataExpandSelect = this.oClause.odataExpandSelect(sVersion);
			(sOdataExpandSelect == "") ? "" : sOdataExpandSelect + "($select=xx)";
			if (!jQuery.isEmptyObject(this.oConjunctionClauses)) {
				for (var i = 0; i < this.oConjunctionClauses.length; i++) {
					var sOdataConjunctionExpandSelect = this.oConjunctionClauses[i].odataExpandSelect(sVersion);
					if (sOdataConjunctionExpandSelect != "") {
						if (sOdataExpandSelect != "") {
							sOdataExpandSelect = sOdataExpandSelect + "," + sOdataConjunctionExpandSelect;
						} else {
							sOdataExpandSelect = sOdataConjunctionExpandSelect;
						}
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
			var sOdataSelectForExpand = this.oClause.odataSelectForExpand(sVersion);
			if (!jQuery.isEmptyObject(this.oConjunctionClauses)) {
				for (var i = 0; i < this.oConjunctionClauses.length; i++) {
					var sOdataConjunctionSelect = this.oConjunctionClauses[i].odataSelectForExpand(sVersion);
					if (sOdataConjunctionSelect != "") {
						sOdataSelectForExpand = sOdataSelectForExpand + "," + this.oConjunctionClauses[i].odataSelectForExpand(sVersion);
					}
				}
				return sOdataSelectForExpand;
			} else {
				return sOdataSelectForExpand;
			}
		} else {
			return "";
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
			this.bIgnore = (oAST["ignore"] == "true") ? true : false;
			this.bOptional = (oAST["optional"] == "true") ? true : false;
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
		var sSparql = repeatString("\t", this.oContext.iLevel);
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
			extendj(oViewModel, this.oPropertyClause.viewModel(sPath + "clause/propertyClause/", oClauseReferences, sKeyVariable, sResultsPath, sResultsContext,
			// extendj(oViewModel, this.oPropertyClause.viewModel(sPath + "propertyClause/", oClauseReferences, sKeyVariable,
			// sResultsPath, sResultsContext,
			iIndex));
			if (jQuery.isEmptyObject(this.oPropertyClause.oPropertyClause.sDataProperty)) {
				// assume it must be an objectProperty
				this.sNameVariable = sPrefix + this.oContext.sObject + sLabelPostfix;
				this.sField = this.oPropertyClause.oPropertyClause.sObjectProperty;
				this.sType = metadata;
			} else {
				this.sField = this.oPropertyClause.oPropertyClause.sDataProperty;
				this.sType = this.oPropertyClause.oPropertyClause.oAST.type;
			}
			this.sKeyVariable = sKeyVariable + ":" + this.sField;
			this.sResultsPath = sResultsPath + "/" + this.sField;
		}
		extendj(oViewModel, {
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
		return (sparqlClauseConjunction(this.sConjunction) + "\n" + this.oClause.sparql());
	},
	sparqlish : function() {
		return (this.sConjunction + " " + this.oClause.sparqlish());
	},
	viewModel : function(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex) {
		var oViewModel = {};
		extendj(oViewModel, this.oClause.viewModel(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex));
		extendj(oViewModel, {
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
			return /* odataClauseConjunction(this.sConjunction) + */this.oClause.odataFilter(sVersion, oParameters);
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
				this.sLabel = labelFromURI(this.oPropertyClause.sDataProperty);
			} else if (oAST["_class"] == "ObjectPropertyClause") {
				this.oPropertyClause = new ObjectPropertyClause(this.oDataMetaModel, oAST, oContext);
				this.sLabel = labelFromURI(this.oPropertyClause.sObjectProperty);
			} else if (oAST["_class"] == "InverseObjectPropertyClause") {
				this.oPropertyClause = new InverseObjectPropertyClause(this.oDataMetaModel, oAST, oContext);
				this.sLabel = labelFromURI(this.oPropertyClause.sInverseObjectProperty);
			} else if (oAST["_class"] == "OperationClause") {
				this.oPropertyClause = new OperationClause(this.oDataMetaModel, oAST, oContext);
				this.sLabel = labelFromURI(this.oPropertyClause.sOperationProperty);
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
	}
});
sap.ui.base.Object.extend("DataPropertyClause", {
	constructor : function(oDataMetaModel, oAST, oContext) {
		this.oDataMetaModel = oDataMetaModel;
		this.oAST = oAST;
		try {
			if (oAST["_class"] != "DataPropertyClause")
				throw "notDataPropertyClauseException";
			this.sDataProperty = oAST["dataProperty"];
			if (!jQuery.isEmptyObject(oAST["dataPropertyFilters"])) {
				this.oFilters = new DataPropertyFilters(this.oDataMetaModel, oAST["dataPropertyFilters"], oContext);
			} else {
				this.oFilters = null;
			}
			this.oContext = oContext;
			if (this.oContext.sOdataEntityPath == "") {
				this.oContext.sOdataEntityPath = this.sDataProperty;
			} else {
				this.oContext.sOdataEntityPath = this.oContext.sOdataEntityPath + "/" + this.sDataProperty;
			}
		} catch (e) {
			jQuery.sap.log.error(e);
			throw (e);
		}
	},
	sparql : function() {
		var sSparql = "{" + sPrefix + this.oContext.sSubject + " " + this.sDataProperty + " " + sPrefix /* ?o */+ this.oContext.sObject + " . "
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
		var sSparqlish = labelFromURI(this.sDataProperty);
		if (!jQuery.isEmptyObject(this.oFilters)) {
			return sSparqlish + this.oFilters.sparqlish();
		} else {
			return sSparqlish;
		}
	},
	viewModel : function(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex) {
		return {
			"keyVariable" : sKeyVariable + ":" + this.sDataProperty,
			"resultsPath" : sResultsPath + "/" + this.sDataProperty,
			"resultsContext" : sResultsContext + "/" + this.sDataProperty,
			"field" : this.sDataProperty,
			// TODO
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
		return this.sDataProperty;
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
			}
			if (!jQuery.isEmptyObject(oAST["conjunctionFilters"])) {
				this.oConjunctionFilters = [];
				for (var i = 0; i < oAST["conjunctionFilters"].length; i++) {
					this.oConjunctionFilters[i] = new ConjunctionFilter(this.oDataMetaModel, oAST["conjunctionFilters"][i], oContext);
				}
			} else {
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
		// TODO why empty when filter on a conjunctionProperty ... sometimes
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
			this.sOperator = oAST["operator"];
			this.sValue = oAST["value"];
			this.sDatatype = oAST["datatype"];
			this.sType = oAST["type"];
		} catch (e) {
			jQuery.sap.log.error(e);
			throw (e);
		}
	},
	sparql : function() {
		var sSparql = sparqlFilterOperator(sPrefix /* ?o */+ this.oContext.sObject, this.sOperator, this.sValue, this.sType);
		return sSparql;
	},
	sparqlish : function() {
		var sSparqlish = this.sOperator + " " + this.sValue;
		return sSparqlish;
	},
	odataFilter : function(sVersion, oParameters) {
		var sOdataFilter = odataFilterOperator(sVersion, this.oContext.sOdataEntityPath, this.sOperator, this.sValue, this.sType, oParameters);
		return sOdataFilter;
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
		return " " + sparqlFilterConjunction(this.sFilterConjunction) + " " + this.oFilter.sparql();
	},
	sparqlish : function() {
		return " " + this.sFilterConjunction + " " + this.oFilter.sparqlish();
	},
	odataFilter : function(sVersion, oParameters) {
		return odataFilterConjunction(sVersion, this.sFilterConjunction) + this.oFilter.odataFilter(sVersion, oParameters);
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
			this.sObjectProperty = oAST["objectProperty"];
			if (!jQuery.isEmptyObject(oAST["objectPropertyFilters"])) {
				this.oObjectPropertyFilters = oAST["objectPropertyFilters"];
			} else {
				this.oObjectPropertyFilters = null;
			}
			this.oContext = oContext;
			if (this.oContext.sOdataEntityPath == "") {
				this.oContext.sOdataEntityPath = this.sObjectProperty;
			} else {
				this.oContext.sOdataEntityPath = this.oContext.sOdataEntityPath + "/" + this.sObjectProperty;
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
		var sSparql = "{" + sPrefix + this.oContext.sSubject + " " + this.sObjectProperty + " " + sPrefix + this.oContext.sObject + ". OPTIONAL{" + sPrefix
				+ this.oContext.sObject + " rdfs:label " + sPrefix + this.oContext.sObject + sLabelPostfix + "}";
		sSparql = sSparql + sparqlKeyFilters(sPrefix + this.oContext.sObject, this.oObjectPropertyFilters);
		if (!jQuery.isEmptyObject(this.oClauses)) {
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
		if (!jQuery.isEmptyObject(this.oObjectPropertyFilters)) {
			return labelFromURI(this.sObjectProperty) + " in " + sparqlishKeyFilters(this.oObjectPropertyFilters);
		} else {
			return labelFromURI(this.sObjectProperty);
		}
	},
	viewModel : function(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex) {
		var oViewModel = {};
		var sContext = "";
		if (this.oAST.multiplicity === "*")
			sContext = "/results/{=P" + iClauseIndex + "}";
		if (!jQuery.isEmptyObject(this.oClauses)) {
			extendj(oViewModel, this.oClauses.viewModel(sPath, oClauseReferences, sKeyVariable + ":" + this.sObjectProperty, sResultsPath + "/"
					+ this.sObjectProperty, sResultsContext + "/" + this.sObjectProperty + sContext, iClauseIndex));
		}
		extendj(oViewModel, {
			"path" : sPath,
			"sparqlish" : this.sparqlish(),
			"keyVariable" : sKeyVariable + ":" + this.sObjectProperty,
			"resultsPath" : sResultsPath + "/" + this.sObjectProperty,
			"resultsContext" : sResultsContext + "/" + this.sObjectProperty + sContext,
			"field" : this.sObjectProperty,
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
				sOdataFilter = "(" + odataKeyFilters(sVersion, this.oContext.sOdataEntityPath, this.oObjectPropertyFilters, oParameters) + ")and" + sOdataFilter;
			} else {
				sOdataFilter = "(" + odataKeyFilters(sVersion, this.oContext.sOdataEntityPath, this.oObjectPropertyFilters, oParameters) + ")";
			}
		}
		return sOdataFilter;
	},
	odataSelect : function(sVersion) {
		if ((sVersion == "V4") && (this.oContext.iLevel >= 0)) {
			return "";
		} else {
			var sOdataSelect = "";
			if (!jQuery.isEmptyObject(this.oClauses) && !jQuery.isEmptyObject(this.oClauses.oClause)) {
				sOdataSelect = this.oClauses.odataSelect(sVersion);
			}
			if (!jQuery.isEmptyObject(this.oObjectPropertyFilters) && (this.oObjectPropertyFilters.length > 0)) {
				if (sOdataSelect != "") {
					sOdataSelect = odataKeys(sVersion, this.oContext.sOdataEntityPath, this.oObjectPropertyFilters) + "," + sOdataSelect;
				} else {
					sOdataSelect = odataKeys(sVersion, this.oContext.sOdataEntityPath, this.oObjectPropertyFilters);
				}
			} else if (!(!jQuery.isEmptyObject(this.oClauses) && !jQuery.isEmptyObject(this.oClauses.oClause))) {
				// TODO must be an object property without any properties so need to add its subject, but only applicable to
				// OlingoToSparql.
				// so shuld detect the Key of the entity type and add to the select
				// oDataMetaModel.getODataEntityType("NorthwindModel.Order_Detail").key.propertyRef is an array of keys
				// oDataMetaModel.getODataEntityType("NorthwindModel.Order_Detail").key.propertyRef[0].name value of property
				if (sOdataSelect != "") {
					sOdataSelect = this.oContext.sOdataEntityPath + "," + sOdataSelect;
				} else {
					sOdataSelect = this.oContext.sOdataEntityPath;
				}
			}
			return sOdataSelect;
		}
	},
	odataExpand : function(sVersion) {
		var sPathExpand = "";
		if (!jQuery.isEmptyObject(this.oClauses)) {
			sPathExpand = this.oClauses.odataExpand(sVersion);
		}
		if (sPathExpand == "") {
			return this.sObjectProperty;
		} else {
			return this.sObjectProperty + "," + this.sObjectProperty + "/" + sPathExpand;
		}
	},
	odataExpandSelect : function(sVersion) {
		var sOdataExpandSelect = "";
		var sOdataSelect = "";
		if (!jQuery.isEmptyObject(this.oClauses)) {
			sOdataExpandSelect = this.oClauses.odataExpandSelect(sVersion);
			sOdataSelect = this.oClauses.odataSelectForExpand(sVersion);
			if (!jQuery.isEmptyObject(this.oObjectPropertyFilters)) {
				sOdataSelect = odataKeys(sVersion, "", this.oObjectPropertyFilters) + "," + sOdataSelect;
			}
		}
		if (sOdataExpandSelect == "") {
			return this.sObjectProperty + "($select=" + sOdataSelect + ")";
		} else {
			return this.sObjectProperty + "($select=" + sOdataSelect + ")," + this.sObjectProperty + "($expand=" + sOdataExpandSelect + ")";
		}
	},
	odataSelectForExpand : function(sVersion) {
		return "";
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
			this.sInverseObjectProperty = oAST["inverseObjectProperty"];

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
		var sSparql = "{" + sPrefix + this.oContext.sObject + " " + this.sInverseObjectProperty + " " + sPrefix + this.oContext.sSubject + ". OPTIONAL{" + sPrefix
				+ this.oContext.sObject + " rdfs:label " + sPrefix + this.oContext.sObject + sLabelPostfix + "}";
		if (!jQuery.isEmptyObject(this.oClauses)) {
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
	viewModel : function(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex) {
		var oViewModel = {};
		if (!jQuery.isEmptyObject(this.oClauses)) {
			extendj(oViewModel, this.oClauses.viewModel(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex));
		}
		extendj(oViewModel, {
			"path" : sPath,
			"sparqlish" : this.sparqlish()
		});
		return oViewModel;
	},
	odataFilter : function(sVersion, oParameters) {
		return "";
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
			this.sOperation = oAST["operation"];

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
		var sSparql = "{" + sPrefix + this.oContext.sObject + " " + this.sOperation + " " + sPrefix + this.oContext.sSubject;
		if (!jQuery.isEmptyObject(this.oClauses)) {
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
	viewModel : function(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex) {
		var oViewModel = {};
		if (!jQuery.isEmptyObject(this.oClauses)) {
			extendj(oViewModel, this.oClauses.viewModel(sPath, oClauseReferences, sKeyVariable, sResultsPath, sResultsContext, iClauseIndex));
		}
		extendj(oViewModel, {
			"path" : sPath,
			"sparqlish" : this.sparqlish()
		});
		return oViewModel;
	},
	odataFilter : function(sVersion, oParameters) {
		return "";
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

sparqlClauseConjunction = function(sConjunction) {
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
sparqlKeyFilters = function(sVariable, oFilters) {
	var sSparql = "";
	if (!jQuery.isEmptyObject(oFilters)) {
		sSparql = sSparql + "VALUES(" + sVariable + "){";
		for (var i = 0; i < oFilters.length; i++) {
			sSparql = sSparql + "(" + sparqlValue(oFilters[i][0].value, oFilters[i][0].type) + ")"
		}
		sSparql = sSparql + "}";
	}
	return sSparql;
};
odataClauseConjunction = function(sConjunction) {
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
sparqlFilterConjunction = function(sConjunction) {
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
odataFilterConjunction = function(sVersion, sConjunction) {
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
sparqlFilterOperator = function(sVariable, sOperator, sValue, sType) {
	var sSparqlValue = sparqlValue(sValue, sType);
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
odataFilterOperator = function(sVersion, sVariable, sOperator, sValue, sType, oParameters) {
	if (jQuery.isEmptyObject(sValue)) {
		return "";
	} else {
		switch (sOperator) {
		case "eq": {
			return "(" + sVariable + " eq " + odataValue(sVersion, sValue, sType, oParameters) + ")";
		}
			;
		case "ne": {
			return "(" + sVariable + " ne " + odataValue(sVersion, sValue, sType, oParameters) + ")";
		}
			;
		case "gt": {
			return "(" + sVariable + " gt " + odataValue(sVersion, sValue, sType, oParameters) + ")";
		}
			;
		case "ge": {
			return "(" + sVariable + " ge " + odataValue(sVersion, sValue, sType, oParameters) + ")";
		}
			;
		case "lt": {
			return "(" + sVariable + " lt " + odataValue(sVersion, sValue, sType, oParameters) + ")";
		}
			;
		case "le": {
			return "(" + sVariable + " le " + odataValue(sVersion, sValue, sType, oParameters) + ")";
		}
			;
		case "substringof": {
			// TODO
			if (sVersion == "V4") {
				return "(contains(" + sVariable + "," + odataValue(sVersion, sValue, sType, oParameters) + "))";
			} else {
				return "(substringof(" + odataValue(sVersion, sValue, sType, oParameters) + "," + sVariable + "))";
			}
		}
			;
		case "endswith": {
			// TODO
			if (sVersion == "V4") {
				return "(contains(" + sVariable + "," + odataValue(sVersion, sValue, sType, oParameters) + "))";
			} else {
				return "(endswith(" + odataValue(sVersion, sValue, sType, oParameters) + "," + sVariable + "))";
			}
		}
			;
		case "startswith": {
			// TODO
			if (sVersion == "V4") {
				return "(contains(" + sVariable + "," + odataValue(sVersion, sValue, sType, oParameters) + "))";
			} else {
				return "(startswith(" + odataValue(sVersion, sValue, sType, oParameters) + "," + sVariable + "))";
			}
		}
			;
		case "between": {
			return "*ERROR*";
		}
			;
			// case "gt": {
			// return "(" + sVariable + " gt " + odataValue(sVersion, sValue, sType, oParameters) + ")";
			// }
			// ;
			// case "lt": {
			// return "(" + sVariable + " lt " + odataValue(sVersion, sValue, sType, oParameters) + ")";
			// }
			// ;
		default:
			throw "illegalFilterOperator";
		}
	}
};
odataValue = function(sVersion, sValue, sType, oParameters) {
	/*
	 * Edm.Binary Edm.Boolean Edm.Byte Edm.DateTime Edm.Decimal Edm.Double Edm.Single Edm.Guid Edm.Int16 Edm.Int32
	 * Edm.Int64 Edm.SByte Edm.String Edm.Time Edm.DateTimeOffset Edm.Geography Edm.GeographyPoint Edm.GeographyLineString
	 * Edm.GeographyPolygon Edm.GeographyMultiPoint Edm.GeographyMultiLineString Edm.GeographyMultiPolygon
	 * Edm.GeographyCollection Edm.Geometry Edm.GeometryPoint Edm.GeometryLineString Edm.GeometryPolygon
	 * Edm.GeometryMultiPoint Edm.GeometryMultiLineString Edm.GeometryMultiPolygon Edm.GeometryCollection Edm.Stream
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
		return deparamterizeValue(sValue, sType, oParameters);
	}
	case "Edm.String": {
		return "'" + deparamterizeValue(sValue, sType, oParameters) + "'";
	}
	case "Edm.Time":
	case "Edm.DateTime": {
		if (sVersion == "V4") {
			return deparamterizeValue(sValue, sType, oParameters);
		} else {
			// TODO need to simplify this. The idea is to convert to UTC as this is the lowest common denominator of V2 Odata
			// services. Not all (Olingo for example) support timezones.
			var oDateTime = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern : "yyyy-MM-dd'T'HH:mm:ssXXXXX"
			}).parse(deparamterizeValue(sValue, sType, oParameters));
			var sDateTime = "datetime'" + sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern : "yyyy-MM-dd'T'HH:mm:ss",
				UTC : true
			}).format(oDateTime) + "'";
			return sDateTime;
		}
	}
	}
};
deparamterizeValue = function(sValue, sType, oParameters) {
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
sparqlValue = function(sValue, sType) {
	/*
	 * Edm.Binary Edm.Boolean Edm.Byte Edm.DateTime Edm.Decimal Edm.Double Edm.Single Edm.Guid Edm.Int16 Edm.Int32
	 * Edm.Int64 Edm.SByte Edm.String Edm.Time Edm.DateTimeOffset Edm.Geography Edm.GeographyPoint Edm.GeographyLineString
	 * Edm.GeographyPolygon Edm.GeographyMultiPoint Edm.GeographyMultiLineString Edm.GeographyMultiPolygon
	 * Edm.GeographyCollection Edm.Geometry Edm.GeometryPoint Edm.GeometryLineString Edm.GeometryPolygon
	 * Edm.GeometryMultiPoint Edm.GeometryMultiLineString Edm.GeometryMultiPolygon Edm.GeometryCollection Edm.Stream
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
		return sValue + sparqlCast(edmToXSD(sType));
	}
	case "Edm.String": {
		return "'" + sValue + "'" + sparqlCast(edmToXSD(sType));
	}
	case "Edm.Time":
	case "Edm.DateTime": {
		return "'" + sValue + "'" + sparqlCast(edmToXSD(sType));
	}
	default:
		return "'" + sValue + "'";
	}

};
sparqlCast = function(sXSDtype) {
	if (sXSDtype == "") {
		return "";
	} else {
		return "^^<" + sXSDtype + ">";
	}
};
sparqlishKeyFilters = function(oKeyFilters) {
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
odataKeyFilters = function(sVersion, sOdataEntityPath, oKeyFilters, oParameters) {
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
					+ odataValue(sVersion, oKeyFilters[keys][key].value, oKeyFilters[keys][key].type, oParameters) + ")";
		}
		sOdataKeyFilters = sOdataKeyFilters + ")";
	}
	return jQuery.isEmptyObject(sOdataKeyFilters) ? "" : "(" + sOdataKeyFilters + ")";
};
odataKeys = function(sVersion, sOdataEntityPath, oKeyFilters) {
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
entityTypeKeyProperties = function(sEntityType) {
	var oEntityType = oDataMetaModel.getODataEntityType(sEntityType);
	if ((jQuery.isEmptyObject(oEntityType.key) && (!jQuery.isEmptyObject(oEntityType.baseType)))) {
		return entityTypeKeyProperties(oEntityType.baseType);
	} else {
		return oEntityType.key.propertyRef;
	}
	return null;
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
edmToXSD = function(sType) {
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