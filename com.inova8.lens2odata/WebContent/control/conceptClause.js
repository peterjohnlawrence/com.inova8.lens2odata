jQuery.sap.require("control.conceptMenu");
jQuery.sap.require("control.conceptOperationParameters");
jQuery.sap.require("control.addClauses");
jQuery.sap.require("control.includeOptionalIgnore");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	// "use strict";
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
				_conceptOperationParameters : {
					type : "control.conceptOperationParameters",
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
		resetCurrentQueryContext : function(sConcept, oFunctionImport) {
			var currentModelData = this.getCurrentQueryContext();
			currentModelData.concept = sConcept;
			currentModelData.conceptFilters = [];
			currentModelData.clauses = {};
			currentModelData.operationParameters = [];
			if (jQuery.isEmptyObject(oFunctionImport)) {
			} else {
				currentModelData.operationParameters = oFunctionImport.parameter;
			}
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
		init : function() {
			var self = this;
			var fConceptChanged = function(oEvent) {
				var sConcept = oEvent.getParameter("concept");
				var oMetaModel = self.getModel("metaModel");
				var oFunctionImport = oMetaModel.getODataFunctionImport(sConcept);
				self.resetCurrentQueryContext(sConcept, oFunctionImport);
				var oConcept = oMetaModel.getODataEntitySet(sConcept);
				// TODO should this be another published object property?
				self.oEntityTypeModel = new sap.ui.model.json.JSONModel();
				self.oEntityTypeModel.setData(oMetaModel.getODataEntityType(oConcept.entityType));
				self.setModel(self.oEntityTypeModel, "entityTypeModel");
				if (oFunctionImport != null) {
					self.setAggregation("_conceptOperationParameters", new control.conceptOperationParameters().bindElement("queryModel>operationParameters"));
					self.getAggregation("_conceptOperationParameters").setModel(self.oEntityTypeModel, "entityTypeModel");
				} else {
					self.setAggregation("_conceptOperationParameters", null);
				}
				self.getModel("queryModel").refresh();
				self.fireConceptClauseChanged(oEvent);
			};
			self.setAggregation("_concept", new control.conceptMenu({
				conceptChanged : fConceptChanged
			}).bindElement("queryModel>"));

			self.setAggregation("_conceptOperationParameters", new control.conceptOperationParameters().bindElement("queryModel>operationParameters"));
			self.setAggregation("_addClause", new control.addClauses({
				clausesSelected : function(oEvent) {
					utils.addPropertyClauses(self, self.getCurrentQueryContext(self),
							jQuery.isEmptyObject(oEvent.getParameter("objectPropertyPayload")) ? [] : oEvent.getParameter("objectPropertyPayload").selectedItems, jQuery
									.isEmptyObject(oEvent.getParameter("dataPropertyPayload")) ? [] : oEvent.getParameter("dataPropertyPayload").selectedItems);
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
			oRm.renderControl(oControl.getAggregation("_conceptOperationParameters"));
			oRm.write("&nbsp;");
			oRm.renderControl(oControl.getAggregation("_addClause"));
			oRm.write("</div>");
		}
	});
});