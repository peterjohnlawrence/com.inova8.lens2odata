jQuery.sap.require("control.conceptMenu");
jQuery.sap.require("control.conceptFilters");
jQuery.sap.require("control.addClauses");
jQuery.sap.require("control.includeOptionalIgnore");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	//"use strict";
	return Control.extend("control.conceptClause", {
		metadata : {
			properties : {},
			events : {
				changedClause : {
					enablePreventDefault : true
				}
			},
			aggregations : {
				_concept : {
					type : "control.conceptMenu",
					multiple : false
				},
				_conceptFilters : {
					type : "control.conceptFilters",
					multiple : false
				},
				_addClause : {
					type : "control.addClauses",
					multiple : false
				}
			},
			events : {
				conceptClauseChanged : {
					enablePreventDefault : true
				}
			}
		},
		getCurrentQueryContext : function() {
			return this.getModel("queryModel").getProperty("", this.getBindingContext("queryModel"));
		},
		resetCurrentQueryContext : function() {
			var currentModelData = this.getCurrentQueryContext();
			currentModelData.conceptFilters = [];
			// TODO remove any clauses based on old concept ... start again
			currentModelData.clauses = {};
		},
		getConcept : function() {
			var currentContext = this.getBindingContext("queryModel");
			var currentModelData = this.getModel("queryModel").getProperty("", currentContext);
			return this.getModel("metaModel").getODataEntitySet(currentModelData.concept);
		},
		getRangeEntityTypeQName : function() {
			return this.getConcept().entityType;
		},
		getRangeEntityTypeContext : function() {
			return this.getModel("metaModel").getODataEntityType(this.getConcept().entityType);
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
					currentModelData.clauses.conjunctionClauses[0].clause.propertyClause.type = this.getModel("metaModel").getODataInheritedProperty(this.getRangeEntityTypeContext(),
							property).type;
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
		init : function() {
			var self = this;
			var fConceptChanged = function(oEvent) {
				self.resetCurrentQueryContext();
				// Now find corresponding entityType of concept to setup model
				var sConcept = oEvent.getParameter("concept");
				var oMetaModel = self.getModel("metaModel");
				var oConcept = oMetaModel.getODataEntitySet(sConcept);
				// TODO should this be another published object property?
				self.oEntityTypeModel = new sap.ui.model.json.JSONModel();
				self.oEntityTypeModel.setData(oMetaModel.getODataEntityType(oConcept.entityType));
				self.setModel(self.oEntityTypeModel, "entityTypeModel");
//TODO temporarily removed as difficult to support entity selection
//				self.getAggregation("_conceptFilters").setModel(self.oEntityTypeModel, "entityTypeModel");
//				self.getAggregation("_conceptFilters").getAggregation("_extendFilter").setVisible(true);
				self.getModel("queryModel").refresh();
				self.fireConceptClauseChanged(oEvent);
			};
			self.setAggregation("_concept", new control.conceptMenu({
				conceptChanged : fConceptChanged
			}).bindElement("queryModel>"));
//TODO temporarily removed as difficult to support entity selection
//			self.setAggregation("_conceptFilters", new control.conceptFilters().bindElement("queryModel>conceptFilters").attachConceptFiltersChanged(
//					function() {
//						self.rerender();
//					}));
			self.setAggregation("_addClause", new control.addClauses({
				clausesSelected : function(oEvent) {
					var currentModelData = self.getCurrentQueryContext(self)
					// Now insert a first clause and move existing first clause if it exists into the first element of the array
					// of
					// conjunctionClauses
					var selectedObjectProperties = (oEvent.getParameter("objectPropertyPayload")) ? oEvent.getParameter("objectPropertyPayload").selectedItems : []; // oEvent.getSource().oObjectPropertyList.getSelectedItems()
					var selectedDataProperties = (oEvent.getParameter("dataPropertyPayload")) ? oEvent.getParameter("dataPropertyPayload").selectedItems : []; // oEvent.getSource().oDataPropertyList.getSelectedItems()

					for (var i = 0; i < selectedDataProperties.length; i++) {
						var dataProperty = selectedDataProperties[i].columnKey;// getText();
						self.addClause(currentModelData, "DataPropertyClause", dataProperty);
					}
					for (var i = 0; i < selectedObjectProperties.length; i++) {
						var objectProperty = selectedObjectProperties[i].columnKey;// getText();
						self.addClause(currentModelData, "ObjectPropertyClause", objectProperty);
					}
					self.fireConceptClauseChanged(oEvent);
				}
			}).bindElement("entityTypeModel>"));
		},

		renderer : function(oRm, oControl) {
			oRm.addClass("conceptClauseContainer");
			// oRm.addClass("conceptClause");
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");
			var oFind = new sap.m.Label().setText(sap.ui.getCore().getModel("i18nModel").getProperty("conceptClause.find")).addStyleClass("conjunctionMenuLink");
			oRm.renderControl(oFind);
			oRm.write("&nbsp;");
			oRm.renderControl(oControl.getAggregation("_concept"));
//TODO temporarily removed as difficult to support entity selection
//			oRm.renderControl(oControl.getAggregation("_conceptFilters"));
			oRm.write("&nbsp;");
			oRm.renderControl(oControl.getAggregation("_addClause"));
			oRm.write("</div>");
		}
	});
});