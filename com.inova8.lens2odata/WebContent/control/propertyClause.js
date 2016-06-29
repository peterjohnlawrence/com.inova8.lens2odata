jQuery.sap.require("sap.ui.unified.MenuItem");
jQuery.sap.require("control.includeOptionalIgnore");
jQuery.sap.require("control.propertyMenu");
jQuery.sap.require("control.dataPropertyFilters");
jQuery.sap.require("control.conceptOperationParameters");
jQuery.sap.require("control.addClauses");
jQuery.sap.require("control.clauses");

sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control
			.extend("control.propertyClause",
					{
						metadata : {
							properties : {
								conjunction : {
									type : "boolean",
									defaultValue : false
								}
							},
							aggregations : {
								_includeOptionalIgnore : {
									type : "control.includeOptionalIgnore",
									multiple : false
								},
								_property : {
									type : "control.propertyMenu",
									multiple : false
								},
								_dataPropertyFilters : {
									type : "control.dataPropertyFilters",
									multiple : false
								},
								_conceptOperationParameters : {
									type : "control.conceptOperationParameters",
									multiple : false
								},
								_addClause : {
									type : "control.addClauses",
									multiple : false
								},
								_clauses : {
									type : "control.clauses",
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
							self.setAggregation("_includeOptionalIgnore", new control.includeOptionalIgnore().bindElement("queryModel>").attachPropertyClauseDeleteRequested(
									function(oEvent) {
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
							self.setAggregation("_property", new control.propertyMenu().bindElement("queryModel>").attachPropertyChanged(function(oEvent) {
								// this.getModel("queryModel").refresh();
								// self.rerender();
								self.firePropertyClauseChanged();
							}));
							self.setAggregation("_conceptOperationParameters", new control.conceptOperationParameters()
									.bindElement("queryModel>propertyClause/operationParameters"));

							self.setAggregation("_dataPropertyFilters", new control.dataPropertyFilters().bindElement("queryModel>propertyClause/dataPropertyFilters")
									.attachDataPropertyFiltersChanged(function(oEvent) {
										// self.rerender();
										self.firePropertyClauseChanged();
									}));
							self.setAggregation("_addClause", new control.addClauses({
								clausesSelected : function(oEvent) {
									utils.addPropertyClauses(self, self.getCurrentQueryContext().propertyClause, jQuery.isEmptyObject(oEvent
											.getParameter("objectPropertyPayload")) ? [] : oEvent.getParameter("objectPropertyPayload").selectedItems, jQuery.isEmptyObject(oEvent
											.getParameter("dataPropertyPayload")) ? [] : oEvent.getParameter("dataPropertyPayload").selectedItems);

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
										return this.getModel("metaModel").getODataInheritedProperty(this.getDomainEntityTypeContext(),
												currentQueryContext.propertyClause.dataProperty);
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
										return this.getModel("metaModel").getODataInheritedNavigationProperty(this.getDomainEntityTypeContext(),
												currentQueryContext.propertyClause.objectProperty);
									} else {
										return null;
									}
								}
							}
						},
						getComplexDataProperty : function() {
							var currentQueryContext = this.getCurrentQueryContext();
							if (jQuery.isEmptyObject(currentQueryContext)) {
								return null;
							} else {
								if (jQuery.isEmptyObject(currentQueryContext.propertyClause)) {
									return null
								} else {
									if (currentQueryContext.propertyClause._class == "ComplexDataPropertyClause") {
										return this.getModel("metaModel").getODataInheritedComplexProperty(this.getDomainEntityTypeContext(),
												currentQueryContext.propertyClause.complexDataProperty);
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
							var oEntityTypeContext = this.getModel("metaModel").getODataEntityType(this.getDomainEntityTypeQName());
							if (jQuery.isEmptyObject(oEntityTypeContext)) {
								return this.getModel("metaModel").getODataComplexType(this.getDomainEntityTypeQName());
							} else {
								return oEntityTypeContext;
							}
						},
						getRangeEntityTypeQName : function() {
							return this.getModel("metaModel").getODataInheritedAssociation(this.getDomainEntityTypeContext(), this.getObjectProperty().name).type;
						},
						getRangeEntityTypeContext : function() {
							return this.getModel("metaModel").getODataEntityType(this.getRangeEntityTypeQName());
						},
						getRangeComplexTypeQName : function() {
							return this.getComplexDataProperty().type;

						},
						getRangeComplexTypeContext : function() {
							return this.getModel("metaModel").getODataEntityType(this.getRangeComplexTypeQName());
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
						renderer : function(oRm, oControl) {
							// TODO oControl.getModel("metaModel").entityTypeKeyProperties("northwind.OrderDetail")
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
										oRm.renderControl(oControl.getAggregation("_conceptOperationParameters"));
										oRm.write("&nbsp;");
										oRm.renderControl(oControl.getAggregation("_addClause"));
										if (sap.ui.getCore().getModel("parametersModel").getProperty("/expandClause")) {
											if ((propertyClause.clauses != undefined) && !(jQuery.isEmptyObject(propertyClause.clauses))) {
												oControl.setAggregation("_clauses", new control.clauses().bindElement("queryModel>propertyClause/clauses"));
												oRm.renderControl(oControl.getAggregation("_clauses"));
											}
										}
									} else if (sPropertyClass == "ComplexDataPropertyClause") {
										oRm.write("&nbsp;");
										var oAddClause = oControl.getAggregation("_addClause");
										oAddClause.setComplex(true);
										oRm.renderControl(oAddClause);
										if (sap.ui.getCore().getModel("parametersModel").getProperty("/expandClause")) {
											if ((propertyClause.clauses != undefined) && !(jQuery.isEmptyObject(propertyClause.clauses))) {
												oControl.setAggregation("_clauses", new control.clauses().bindElement("queryModel>propertyClause/clauses"));
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