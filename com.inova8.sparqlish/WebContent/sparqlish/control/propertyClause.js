jQuery.sap.require("sap.ui.unified.MenuItem");
jQuery.sap.require("sparqlish.control.includeOptionalIgnore");
jQuery.sap.require("sparqlish.control.propertyMenu");
jQuery.sap.require("sparqlish.control.objectPropertyFilters");
jQuery.sap.require("sparqlish.control.dataPropertyFilters");
jQuery.sap.require("sparqlish.control.addClauses");
jQuery.sap.require("sparqlish.control.clauses");
sap.ui.core.Control.extend("sparqlish.control.propertyClause",
		{
			metadata : {
				properties : {},
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
					selected : {
						enablePreventDefault : true
					},
					deleted : {
						enablePreventDefault : true
					},
					changed : {
						enablePreventDefault : true
					},
					changedClause : {
						enablePreventDefault : true
					}
				}
			},

			getCurrentQueryContext : function() {
				return this.getModel("queryModel").getProperty("", this.getBindingContext("queryModel"));
			},
			getDataProperty : function() {
				var currentQueryContext = this.getCurrentQueryContext();
				if (currentQueryContext == undefined) {
					return null;
				} else {
					if (currentQueryContext.propertyClause == undefined) {
						return null;
					} else {
						return getProperty(this.getModel("metaModel"),this.getDomainEntityTypeQName(), currentQueryContext.propertyClause.dataProperty);
					}
				}
			},
			getObjectProperty : function() {
				var currentQueryContext = this.getCurrentQueryContext();
				if (currentQueryContext == undefined) {
					return null;
				} else {
					if (currentQueryContext.propertyClause == undefined) {
						return null
					} else {
						return getNavigationProperty(this.getModel("metaModel"),this.getDomainEntityTypeQName(), currentQueryContext.propertyClause.objectProperty);
					}
				}
			},
			// TODO oMetaModel declaration -- Where??
			getDomainEntityTypeQName : function() {
				return entityTypeQName(this.getModel("queryModel"), oMetaModel, this.getBindingContext("queryModel"));
			},
			getDomainEntityTypeContext : function() {
				return oMetaModel.getODataEntityType(this.getDomainEntityTypeQName());
			},
			getRangeEntityTypeQName : function() {
				return oMetaModel.getODataEntitySet(this.getObjectProperty().toRole).entityType;
			},
			getRangeEntityTypeContext : function() {
				return oMetaModel.getODataEntityType(this.getRangeEntityTypeQName());
			},
			deleteClause : function() {
				var oClausesContext = this.getParent().getCurrentQueryContext();
				if (!jQuery.isEmptyObject(oClausesContext.conjunctionClauses)) {
					// get first conjunction clause and move up to this clause
					oClausesContext.clause = oClausesContext.conjunctionClauses[0].clause;
					oClausesContext.conjunctionClauses.splice(0, 1);
					// Now delete any conjunctionClauses if empty
					if (oClausesContext.conjunctionClauses.length == 0) {
						// Now remove conjunctionClauses
						delete oClausesContext.conjunctionClauses;
					}
				} else {
					// Just delete this one and only one clause
					delete oClausesContext.clause;
				}
				this.getParent().rerender();
				// Goodbye
				// this.destroy();
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
						currentModelData.clauses.clause.propertyClause.type= getProperty(this.getModel("metaModel"),this.getRangeEntityTypeQName(),property).type; 
						currentModelData.clauses.clause.propertyClause.dataPropertyFilters = {};
						currentModelData.clauses.clause.propertyClause.dataPropertyFilters._class = "DataPropertyFilters";
					} else {
						//add type = __metadata
						//add multiplicity
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
						currentModelData.clauses.conjunctionClauses[last].clause.propertyClause.type= getProperty(this.getModel("metaModel"),this.getRangeEntityTypeQName(),property).type; 
						currentModelData.clauses.conjunctionClauses[last].clause.propertyClause.dataPropertyFilters = {};
						currentModelData.clauses.conjunctionClauses[last].clause.propertyClause.dataPropertyFilters._class = "DataPropertyFilters";
					} else {
						//add type = __metadata
						//add multiplicity
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
						currentModelData.clauses.conjunctionClauses[0].clause.propertyClause.type= getProperty(this.getModel("metaModel"),this.getRangeEntityTypeQName(),property).type; 
						currentModelData.clauses.conjunctionClauses[0].clause.propertyClause.dataPropertyFilters = {};
						currentModelData.clauses.conjunctionClauses[0].clause.propertyClause.dataPropertyFilters._class = "DataPropertyFilters";
					} else {
						//add type = __metadata
						//add multiplicity
						currentModelData.clauses.conjunctionClauses[0].clause.propertyClause.objectPropertyFilters = [];
					}
				}
			}, // set up the inner controls
			init : function() {
				var self = this;
				self.setAggregation("_includeOptionalIgnore", new sparqlish.control.includeOptionalIgnore().bindElement("queryModel>").attachDeleted(function(oEvent) {
					if (self.getParent().sParentAggregationName == "_conjunctionPropertyClauses") {
						self.getParent().deleteConjunctionClause();
					} else {
						self.deleteClause();
					}
				}));
				self.setAggregation("_property", new sparqlish.control.propertyMenu().bindElement("queryModel>").attachChanged(function(oEvent) {
					this.getModel("queryModel").refresh();
				}));
				// TODO defer binding until required?
				self.setAggregation("_objectPropertyFilters", new sparqlish.control.objectPropertyFilters()
						.bindElement("queryModel>propertyClause/objectPropertyFilters"));
				// TODO defer binding until required?
				self.setAggregation("_dataPropertyFilters", new sparqlish.control.dataPropertyFilters().bindElement("queryModel>propertyClause/dataPropertyFilters"));
				self.setAggregation("_addClause", new sparqlish.control.addClauses({
					pressed : function(oEvent) {

						var currentModelData = self.getCurrentQueryContext().propertyClause;
						// Now insert a first clause and move existing first clause if it exists into the first element of the
						// array of conjunctionClauses
						var selectedObjectProperties = oEvent.getSource().oObjectPropertyList.getSelectedItems()
						var selectedDataProperties = oEvent.getSource().oDataPropertyList.getSelectedItems()

						for (var i = 0; i < selectedDataProperties.length; i++) {
							var dataProperty = selectedDataProperties[i].getText();
							self.addClause(currentModelData, "DataPropertyClause", dataProperty);
						}
						for (var i = 0; i < selectedObjectProperties.length; i++) {
							var objectProperty = selectedObjectProperties[i].getText();
							self.addClause(currentModelData, "ObjectPropertyClause", objectProperty);
						}
						self.getModel("queryModel").refresh();
						self.getParent().rerender();
						self.fireChangedClause();
					}
				}).bindElement("queryModel>"));
			},
			renderer : function(oRm, oControl) {
				var currentModel = oControl.getModel("queryModel");
				var currentContext = oControl.getBindingContext("queryModel");
				var currentContextClause = currentModel.getProperty("", currentContext);
				if (currentContextClause != undefined) {

					oRm.addClass("propertyClause");
					oRm.write("<div ");
					oRm.writeControlData(oControl);
					oRm.writeClasses();
					oRm.write(">");

					var propertyClause = currentModel.getProperty("", currentContext).propertyClause;
					if (propertyClause != undefined) {
						oRm.renderControl(oControl.getAggregation("_includeOptionalIgnore"));
						oRm.write("&nbsp;");
						oRm.renderControl(oControl.getAggregation("_property"));
						var sPropertyClass = propertyClause._class;
						if (sPropertyClass == "ObjectPropertyClause") {
							oRm.renderControl(oControl.getAggregation("_objectPropertyFilters"));
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
					}
					oRm.write("</div>");
				}
			}
		});