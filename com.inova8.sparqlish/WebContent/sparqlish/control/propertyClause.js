jQuery.sap.require("sap.ui.unified.MenuItem");
jQuery.sap.require("sparqlish.control.includeOptionalIgnore");
jQuery.sap.require("sparqlish.control.propertyMenu");
jQuery.sap.require("sparqlish.control.objectPropertyFilters");
jQuery.sap.require("sparqlish.control.dataPropertyFilters");
jQuery.sap.require("sparqlish.control.addClauses");
jQuery.sap.require("sparqlish.control.clauses");

sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("sparqlish.control.propertyClause", {
		metadata : {
			properties : {
				conjunction : {
					type : "boolean",
					defaultValue : false
				}
			},
			aggregations : {
				_includeOptionalIgnore : {
					type : "sparqlish.control.includeOptionalIgnore",
					multiple : false
				},
				_property : {
					type : "sparqlish.control.propertyMenu",
					multiple : false
				},
				_objectPropertyFilters : {
					type : "sparqlish.control.objectPropertyFilters",
					multiple : false
				},
				_dataPropertyFilters : {
					type : "sparqlish.control.dataPropertyFilters",
					multiple : false
				},
				_addClause : {
					type : "sparqlish.control.addClauses",
					multiple : false
				},
				_clauses : {
					type : "sparqlish.control.clauses",
					multiple : false
				}
			},
			events : {
				propertyClauseChanged : {
					enablePreventDefault : true
				}
			}
		},
		init : function() {
			var self = this;
			self.setAggregation("_includeOptionalIgnore", new sparqlish.control.includeOptionalIgnore().bindElement("queryModel>")
					.attachPropertyClauseDeleteRequested(function(oEvent) {
						if (self.getParent().sParentAggregationName == "_conjunctionPropertyClauses") {
							self.getParent().deleteConjunctionClause();
						} else {
							self.deleteClause();
						}
						self.firePropertyClauseChanged();
					}).attachIncludeOptionalIgnoreChanged(function(oEvent) {
						// self.rerender();
						self.firePropertyClauseChanged();
					}));
			self.setAggregation("_property", new sparqlish.control.propertyMenu().bindElement("queryModel>").attachPropertyChanged(function(oEvent) {
				//this.getModel("queryModel").refresh();
				// self.rerender();
				self.firePropertyClauseChanged();
			}));
//TODO temporarily removed as difficult to support entity selection
//			self.setAggregation("_objectPropertyFilters", new sparqlish.control.objectPropertyFilters()
//					.bindElement("queryModel>propertyClause/objectPropertyFilters"));
			self.setAggregation("_dataPropertyFilters", new sparqlish.control.dataPropertyFilters().bindElement("queryModel>propertyClause/dataPropertyFilters")
					.attachDataPropertyFiltersChanged(function(oEvent) {
						//self.rerender();
						self.firePropertyClauseChanged();
					}));
			self.setAggregation("_addClause", new sparqlish.control.addClauses({
				clausesSelected : function(oEvent) {

					var currentModelData = self.getCurrentQueryContext().propertyClause;
					// Now insert a first clause and move existing first clause if it exists into the first element of the
					// array of conjunctionClauses
					var selectedObjectProperties = oEvent.getParameter("objectPropertyPayload").selectedItems;// oEvent.getSource().oObjectPropertyList.getSelectedItems()
					var selectedDataProperties = oEvent.getParameter("dataPropertyPayload").selectedItems;// oEvent.getSource().oDataPropertyList.getSelectedItems()

					for (var i = 0; i < selectedDataProperties.length; i++) {
						var dataProperty = selectedDataProperties[i].columnKey;// getText();
						self.addClause(currentModelData, "DataPropertyClause", dataProperty);
					}
					for (var i = 0; i < selectedObjectProperties.length; i++) {
						var objectProperty = selectedObjectProperties[i].columnKey;// getText();
						self.addClause(currentModelData, "ObjectPropertyClause", objectProperty);
					}
					self.getModel("queryModel").refresh();
					self.firePropertyClauseChanged();
				}
			}).bindElement("queryModel>"));
		},
		getClausesContext : function() {
			var reClause = /\/clause\/$/;
			var reConjunctionClause = /conjunctionClauses\/[0123456789]*\/clause$/;
			this.sPath = this.getBindingContext("queryModel").getPath();
			// TODO should be string.includes() if supported
			if (this.sPath.search(reConjunctionClause) != -1) {
				this.sPath = this.getBindingContext("queryModel").getPath().replace(reConjunctionClause, "");
			} else {
				this.sPath = this.getBindingContext("queryModel").getPath().replace(reClause, "");
			}
			return this.getModel("queryModel").getProperty(this.sPath);
		},
		getCurrentQueryContext : function() {
			return this.getModel("queryModel").getProperty("", this.getBindingContext("queryModel"));
		},
		getDataProperty : function() {
			var currentQueryContext = this.getCurrentQueryContext();
			if (jQuery.isEmptyObject(currentQueryContext)) {
				return null;
			} else {
				if (jQuery.isEmptyObject(currentQueryContext.propertyClause)) {
					return null;
				} else {
					if (currentQueryContext.propertyClause._class == "DataPropertyClause") {
						return this.getModel("metaModel").getODataInheritedProperty(this.getDomainEntityTypeContext(), currentQueryContext.propertyClause.dataProperty);
						//return this.getModel("metaModel").getDataProperty(this.getDomainEntityTypeQName(), currentQueryContext.propertyClause.dataProperty);
					} else {
						return null;
					}
				}
			}
		},
		getObjectProperty : function() {
			var currentQueryContext = this.getCurrentQueryContext();
			if (jQuery.isEmptyObject(currentQueryContext)) {
				return null;
			} else {
				if (jQuery.isEmptyObject(currentQueryContext.propertyClause)) {
					return null
				} else {
					if (currentQueryContext.propertyClause._class == "ObjectPropertyClause") {
						return this.getModel("metaModel").getODataInheritedNavigationProperty(this.getDomainEntityTypeContext(), currentQueryContext.propertyClause.objectProperty);
						//return this.getModel("metaModel").getNavigationProperty(this.getDomainEntityTypeQName(), currentQueryContext.propertyClause.objectProperty);
					} else {
						return null;
					}
				}
			}
		},
		getDomainEntityTypeQName : function() {
			return this.getModel("metaModel").entityTypeQName(this.getModel("queryModel"), this.getBindingContext("queryModel"));
		},
		getDomainEntityTypeContext : function() {
				return this.getModel("metaModel").getODataEntityType(this.getDomainEntityTypeQName());
		},
		getRangeEntityTypeQName : function() {
			return this.getModel("metaModel").getODataInheritedAssociation(this.getDomainEntityTypeContext(),this.getObjectProperty().name).type;
			//return this.getModel("metaModel").getODataAssociationEnd(this.getDomainEntityTypeContext(),this.getObjectProperty().name).type;
		},
		getRangeEntityTypeContext : function() {
				return this.getModel("metaModel").getODataEntityType(this.getRangeEntityTypeQName());
		},
		deleteClause : function() {
			// TODO This only works when we have a Query object, not when we have a QueryClause object
			// var oClausesContext = this.getParent().getCurrentQueryContext();
			this.oClausesContext = this.getClausesContext();
			if (!jQuery.isEmptyObject(this.oClausesContext.conjunctionClauses)) {
				// get first conjunction clause and move up to this clause
				this.oClausesContext.clause = this.oClausesContext.conjunctionClauses[0].clause;
				this.oClausesContext.conjunctionClauses.splice(0, 1);
				// Now delete any conjunctionClauses if empty
				if (this.oClausesContext.conjunctionClauses.length == 0) {
					// Now remove conjunctionClauses
					delete this.oClausesContext.conjunctionClauses;
				}
			} else {
				// Just delete this one and only one clause
				// delete oClausesContext.clause;
				delete this.oClausesContext.clause;
				delete this.oClausesContext._class;
			}
			this.getParent().rerender();
		},
		addClause : function(currentModelData, clauseClass, property) {
			var clauseProperty = (clauseClass == "DataPropertyClause") ? "dataProperty" : "objectProperty";
			if (jQuery.isEmptyObject(currentModelData.clauses) || jQuery.isEmptyObject(currentModelData.clauses.clause)) {
				// No dependent clauses at all so start element
				currentModelData.clauses = {};
				currentModelData.clauses._class = "Clauses";
				currentModelData.clauses.clause = {};
				currentModelData.clauses.clause._class = "Clause";
				currentModelData.clauses.clause.ignore = false;
				currentModelData.clauses.clause.optional = false;
				currentModelData.clauses.clause.propertyClause = {};
				currentModelData.clauses.clause.propertyClause._class = clauseClass;
				currentModelData.clauses.clause.propertyClause[clauseProperty] = property;
				if (clauseClass == "DataPropertyClause") {
					currentModelData.clauses.clause.propertyClause.type = this.getModel("metaModel").getODataInheritedProperty(this.getRangeEntityTypeContext(), property).type;
					currentModelData.clauses.clause.propertyClause.dataPropertyFilters = {};
					currentModelData.clauses.clause.propertyClause.dataPropertyFilters._class = "DataPropertyFilters";
				} else {
					// add type = __metadata
					currentModelData.clauses.clause.propertyClause.multiplicity = this.getModel("metaModel").getODataInheritedAssociation(this.getRangeEntityTypeContext(),
							property).multiplicity;
					currentModelData.clauses.clause.propertyClause.objectPropertyFilters = [];
				}

			} else if (!jQuery.isEmptyObject(currentModelData.clauses.conjunctionClauses)) {
				// Conjunction clauses exist so add at the end of the array
				var last = currentModelData.clauses.conjunctionClauses.length;

				currentModelData.clauses.conjunctionClauses[last] = {};
				currentModelData.clauses.conjunctionClauses[last]._class = "ConjunctionClause";
				currentModelData.clauses.conjunctionClauses[last].conjunction = "and";
				currentModelData.clauses.conjunctionClauses[last].clause = {};
				currentModelData.clauses.conjunctionClauses[last].clause._class = "Clause";
				currentModelData.clauses.conjunctionClauses[last].clause.ignore = false;
				currentModelData.clauses.conjunctionClauses[last].clause.optional = false;
				currentModelData.clauses.conjunctionClauses[last].clause.propertyClause = {};
				currentModelData.clauses.conjunctionClauses[last].clause.propertyClause._class = clauseClass;
				currentModelData.clauses.conjunctionClauses[last].clause.propertyClause[clauseProperty] = property;
				if (clauseClass == "DataPropertyClause") {
					currentModelData.clauses.conjunctionClauses[last].clause.propertyClause.type = this.getModel("metaModel").getODataInheritedProperty(
							this.getRangeEntityTypeContext(), property).type;
					currentModelData.clauses.conjunctionClauses[last].clause.propertyClause.dataPropertyFilters = {};
					currentModelData.clauses.conjunctionClauses[last].clause.propertyClause.dataPropertyFilters._class = "DataPropertyFilters";
				} else {
					// add type = __metadata
					currentModelData.clauses.conjunctionClauses[last].clause.propertyClause.multiplicity = this.getModel("metaModel").getODataInheritedAssociation(
							this.getRangeEntityTypeContext(), property).multiplicity;
					currentModelData.clauses.conjunctionClauses[last].clause.propertyClause.objectPropertyFilters = [];
				}
			} else {
				// Must be the first of a ConjunctionClause
				currentModelData.clauses.conjunctionClauses = [];

				currentModelData.clauses.conjunctionClauses[0] = {};
				currentModelData.clauses.conjunctionClauses[0]._class = "ConjunctionClause";
				currentModelData.clauses.conjunctionClauses[0].conjunction = "and";
				currentModelData.clauses.conjunctionClauses[0].clause = {};
				currentModelData.clauses.conjunctionClauses[0].clause._class = "Clause";
				currentModelData.clauses.conjunctionClauses[0].clause.ignore = false;
				currentModelData.clauses.conjunctionClauses[0].clause.optional = false;
				currentModelData.clauses.conjunctionClauses[0].clause.propertyClause = {};
				currentModelData.clauses.conjunctionClauses[0].clause.propertyClause._class = clauseClass;
				currentModelData.clauses.conjunctionClauses[0].clause.propertyClause[clauseProperty] = property;
				if (clauseClass == "DataPropertyClause") {
					currentModelData.clauses.conjunctionClauses[0].clause.propertyClause.type = this.getModel("metaModel").getODataInheritedProperty(
							this.getRangeEntityTypeContext(), property).type;
					currentModelData.clauses.conjunctionClauses[0].clause.propertyClause.dataPropertyFilters = {};
					currentModelData.clauses.conjunctionClauses[0].clause.propertyClause.dataPropertyFilters._class = "DataPropertyFilters";
				} else {
					// add type = __metadata
					currentModelData.clauses.conjunctionClauses[0].clause.propertyClause.multiplicity = this.getModel("metaModel").getODataInheritedAssociation(
							this.getRangeEntityTypeContext(), property).multiplicity;
					currentModelData.clauses.conjunctionClauses[0].clause.propertyClause.objectPropertyFilters = [];
				}
			}
		},

		renderer : function(oRm, oControl) {
			//TODO oControl.getModel("metaModel").entityTypeKeyProperties("northwind.OrderDetail")
			var currentModel = oControl.getModel("queryModel");
			var currentContext = oControl.getBindingContext("queryModel");
			var currentContextClause = currentModel.getProperty("", currentContext);
			if (!jQuery.isEmptyObject(currentContextClause)) {
				var propertyClause = currentModel.getProperty("", currentContext).propertyClause;
				if (!jQuery.isEmptyObject(propertyClause)) {

					if (!oControl.getConjunction()) {
						oRm.addClass("propertyClauseContainer");
						oRm.write("<div ");
						oRm.writeClasses();
						oRm.write(">");

						oRm.addClass("propertyConjunctionContainer");
						oRm.write("<div ");
						oRm.writeControlData(oControl);
						oRm.writeClasses();
						oRm.write(">");
					}
					oRm.renderControl(oControl.getAggregation("_includeOptionalIgnore").setConjunction(oControl.getConjunction()));
					oRm.write("&nbsp;");
					oRm.write("</div>");
					oRm.addClass("propertyContainer");
					if (currentContextClause.ignore)
						oRm.addClass("strikethrough");
					oRm.write("<div ");
					oRm.writeControlData(oControl);
					oRm.writeClasses();
					oRm.write(">");
					oRm.renderControl(oControl.getAggregation("_property").addStyleClass("objectPropertyMenuLink"));
					var sPropertyClass = propertyClause._class;
					if (sPropertyClass == "ObjectPropertyClause") {
						//TODO temporarily removed as difficult to support entity selection
						//oRm.renderControl(oControl.getAggregation("_objectPropertyFilters"));
						oRm.write("&nbsp;");
						oRm.renderControl(oControl.getAggregation("_addClause"));
						// TODO need to remove remnants
						// oRm.renderControl(oControl.getAggregation("_dataPropertyFilters"));
						if (sap.ui.getCore().getModel("parametersModel").getProperty("/expandClause")) {
							if ((propertyClause.clauses != undefined) && !(jQuery.isEmptyObject(propertyClause.clauses))) {
								oControl.setAggregation("_clauses", new sparqlish.control.clauses().bindElement("queryModel>propertyClause/clauses"));
								oRm.renderControl(oControl.getAggregation("_clauses"));
							}
						}
					} else {
						oRm.renderControl(oControl.getAggregation("_dataPropertyFilters"));
						oRm.write("&nbsp;");
					}
					oRm.write("</div>");
					oRm.write("</div>");
				}

			}
		}
	});
});