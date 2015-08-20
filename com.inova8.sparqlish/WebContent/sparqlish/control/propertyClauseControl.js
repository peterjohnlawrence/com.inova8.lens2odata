// TODO why is this required
jQuery.sap.require("sap.ui.unified.MenuItem");
jQuery.sap.require("sparqlish.control.includeOptionalIgnore");
jQuery.sap.require("sparqlish.control.propertyMenu");
jQuery.sap.require("sparqlish.control.objectPropertyFiltersControl");
jQuery.sap.require("sparqlish.control.dataPropertyFiltersControl");
jQuery.sap.require("sparqlish.control.addClause");
sap.ui.core.Control.extend("sparqlish.control.propertyClauseControl",
		{
			metadata : {
				properties : {
					entityTypeQName : {
						type : "string"
					},
					entityTypeContext : {
						type : "object"
					},
					dataProperty : {
						type : "object"
					},
					objectProperty : {
						type : "object"
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
						type : "sparqlish.control.objectPropertyFiltersControl",
						multiple : false
					},
					_dataPropertyFilters : {
						type : "sparqlish.control.dataPropertyFiltersControl",
						multiple : false
					},
					_addClause : {
						type : "sparqlish.control.addClause",
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
					}
				}
			},
			// set up the inner controls
			init : function() {
				var self = this;
				self.setAggregation("_includeOptionalIgnore", new sparqlish.control.includeOptionalIgnore().bindElement("queryModel>"));
				self.setAggregation("_property", new sparqlish.control.propertyMenu().bindElement("queryModel>").attachChanged(function(oEvent) {
					// TODO is this always correct
					var self = oEvent.getSource().getParent();
					if (oEvent.getParameter("objectProperty") != undefined) {
						self.setObjectProperty(getNavigationProperty(self.getEntityTypeQName(), oEvent.getParameter("objectProperty")));
					} else if (oEvent.getParameter("dataProperty") != undefined) {
						self.setDataProperty(getProperty(self.getEntityTypeQName(), oEvent.getParameter("dataProperty")));
					} else {
						jQuery.sap.log.error("Invalid property selected");
					}
					self.getAggregation("_objectPropertyFilters").getAggregation("_extendFilter").setVisible(true);
					self.getAggregation("_dataPropertyFilters").getAggregation("_extendFilter").setVisible(true);
				}));
				// TODO defer binding until required?
				self.setAggregation("_objectPropertyFilters", new sparqlish.control.objectPropertyFiltersControl()
						.bindElement("queryModel>propertyClause/objectPropertyFilters"));
				// TODO defer binding until required?
				self.setAggregation("_dataPropertyFilters", new sparqlish.control.dataPropertyFiltersControl()
						.bindElement("queryModel>propertyClause/dataPropertyFilters"));
				self.setAggregation("_addClause", new sparqlish.control.addClause({
					pressed : function(oEvent) {
						alert("clause");
					}
				}).bindElement("queryModel>"));
			},
			_initializeClause : function() {
				// TODO initialize the matadata/properties particularly when no property set and on initialization
				var oEntityTypeContext = this.getEntityTypeContext();
				var sEntityTypeQName;
				// The following initializes the clauseControl's entityTypeContext, entityTypeQName, objectProperty, and
				// dataProperty if not already set.
				if (oEntityTypeContext == undefined) {
					// initialize shared data from model
					sEntityTypeQName = entityTypeQName(this.getModel("queryModel"), oMetaModel, this.getBindingContext("queryModel"));
					oEntityTypeContext = oMetaModel.getODataEntityType(sEntityTypeQName);
					this.setEntityTypeContext(oEntityTypeContext);
					this.setEntityTypeQName(sEntityTypeQName);
				}
				var oDataProperty = this.getDataProperty();
				var oObjectProperty = this.getObjectProperty();
				if ((oDataProperty == undefined) && (this.getObjectProperty() == undefined)) {
					// initialize shared data from model
					var clause = this.getModel("queryModel").getProperty(this.getBindingContext("queryModel").getPath());
					// TODO is this sufficient?
					if(clause._class == "ConjunctionClause"){
						clause = clause.clause;
					}
					// TODO only change this if it is not set properly
					clause._class = "Clause";
					clause.ignore = (clause.ignore == undefined) ? false : clause.ignore;
					clause.optional = (clause.optional == undefined) ? false : clause.optional;
					clause.includeOptionalIgnore = (clause.ignore == undefined) ? "include" : clause.includeOptionalIgnore;
								
					var propertyClause = clause.propertyClause;
					if ((propertyClause == undefined) || (jQuery.isEmptyObject(propertyClause))) {
						oDataProperty = oEntityTypeContext.property[0];
						clause.propertyClause = {
							"_class" : "DataPropertyClause",
							"dataProperty" : oDataProperty.name,
							"dataPropertyFilters" : {}
						};
						this.setDataProperty(oDataProperty);
						this.getAggregation("_property").getAggregation("_property").setText(oDataProperty.name);
					} else if (propertyClause._class == "ObjectPropertyClause") {
						objectProperty = propertyClause.objectProperty;
						oObjectProperty = getNavigationProperty(sEntityTypeQName, objectProperty);
						this.setObjectProperty(oObjectProperty);
						this.getAggregation("_property").getAggregation("_property").setText(oObjectProperty.name);
					} else {
						dataProperty = propertyClause.dataProperty;
						oDataProperty = getProperty(sEntityTypeQName, dataProperty);
						this.setDataProperty(oDataProperty);
						this.getAggregation("_property").getAggregation("_property").setText(oDataProperty.name);
					}
				}
			},
			renderer : function(oRm, oControl) {
				oControl._initializeClause();
				oRm.addClass("conceptClause");
				oRm.write("<div ");
				oRm.writeControlData(oControl);
				oRm.writeClasses();
				oRm.write(">");
				oRm.renderControl(oControl.getAggregation("_includeOptionalIgnore"));
				oRm.write("&nbsp;");
				oRm.renderControl(oControl.getAggregation("_property"));
				var currentModel = oControl.getModel("queryModel");
				var currentContext = oControl.getBindingContext("queryModel");
				var propertyClause = currentModel.getProperty("", currentContext).propertyClause;
				if (propertyClause != undefined) {
					var sPropertyClass = propertyClause._class;
					if (sPropertyClass == "ObjectPropertyClause") {
						oRm.renderControl(oControl.getAggregation("_objectPropertyFilters"));
						// TODO need to remove remnants
						//oRm.renderControl(oControl.getAggregation("_dataPropertyFilters"));
					} else {
						oRm.renderControl(oControl.getAggregation("_dataPropertyFilters"));
						// TODO need to remove remnants
						//oRm.renderControl(oControl.getAggregation("_objectPropertyFilters"));
					}
				}
				oRm.write("&nbsp;");
				oRm.renderControl(oControl.getAggregation("_addClause"));
				oRm.write("</div>");
			}
		});