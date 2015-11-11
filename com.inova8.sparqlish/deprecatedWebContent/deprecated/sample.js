jQuery.sap.require("sparqlish.control.conceptMenu");
jQuery.sap.require("sparqlish.control.conceptFilters");
jQuery.sap.require("sparqlish.control.addClause");
sap.ui.core.Control.extend("sparqlish.control.conceptClause", {
	metadata : {
		properties : {
			concept : "object"
		},
		events : {},
		aggregations : {
			_concept : {
				type : "sparqlish.control.conceptMenu",
				multiple : false
			},
			_conceptFilters : {
				type : "sparqlish.control.conceptFilters",
				multiple : false
			},
			_addClause : {
				type : "sparqlish.control.addClause",
				multiple : false
			}
		}
	},
	init : function() {
		var self = this;
		var conceptSelect =function(oEvent){

				var currentModel = self.getModel("queryModel");
				var currentContext = self.getBindingContext("queryModel");
				var currentModelData = currentModel.getProperty("", currentContext);
				currentModelData.conceptFilters = [];
				currentModelData.clauses = {};
				var sConcept = oEvent.getParameter("concept");
				var oMetaModel = self.getModel("metaModel");
				var oConcept=oMetaModel.getODataEntitySet(sConcept);
				self.setConcept( oConcept);
				self.oEntityTypeModel = new sap.ui.model.json.JSONModel();
				self.oEntityTypeModel.setData(oMetaModel.getODataEntityType(oConcept.entityType));
				self.setModel(self.oEntityTypeModel, "entityTypeModel");
				self.getAggregation("_conceptFilters").setModel(self.oEntityTypeModel, "entityTypeModel");

				self.getAggregation("_conceptFilters").getAggregation("_extendFilter").setVisible(true);
				currentModel.refresh();
				self.rerender();	
		};
		self.setAggregation("_concept", new sparqlish.control.conceptMenu({
			selected : function(oEvent) {
				self.getAggregation("_conceptFilters").getAggregation("_extendFilter").setVisible(true);
			},
			changed : conceptSelect
		}).bindElement("queryModel>"));
		self.setAggregation("_conceptFilters", new sparqlish.control.conceptFilters().bindElement("queryModel>"));
		self.setAggregation("_addClause", new sparqlish.control.addClause({
			pressed : function(oEvent) {
				alert("concept");
			}
		}).bindElement("queryModel>"));
	},

	renderer : function(oRm, oControl) {
		oRm.addClass("conceptClause");
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.write(">");
		oRm.write(sap.ui.getCore().getModel("i18nModel").getProperty("conceptClauseFind"));
		oRm.renderControl(oControl.getAggregation("_concept"));
		oRm.renderControl(oControl.getAggregation("_conceptFilters"));
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_addClause"));
		oRm.write("</div>");
	}
});