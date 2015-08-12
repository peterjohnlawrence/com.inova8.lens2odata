jQuery.sap.require("sparqlish.control.conceptControl");
jQuery.sap.require("sparqlish.control.conceptFiltersControl");
sap.ui.core.Control.extend("sparqlish.control.conceptClauseControl", {
	metadata : {
		properties : {
			entityType : "string",
			conceptClause : "object"
		},
		events : {},
		aggregations : {
			_concept : {
				type : "sparqlish.control.conceptControl",
				multiple : false
			},
			_conceptFilters : {
				type : "sparqlish.control.conceptFiltersControl",
				multiple : false
			}
		}
	},
	init : function() {
		var self = this;
		self.setAggregation("_concept", new sparqlish.control.conceptControl({
			selected : function(oEvent) {
				self.getAggregation("_conceptFilters").getAggregation("_extendFilter").setVisible(true);
			},
			changed : function(oEvent) {
				var self = oEvent.getSource().getParent();
				var currentModel = this.getModel("queryModel");
				var currentContext = this.getBindingContext("queryModel");
				var currentModelData = currentModel.getProperty("", currentContext);
				currentModelData.conceptFilters = [];

				// Now find corresponding entityType of concept to setup model
				var sConcept = oEvent.getParameter("concept");
				var oMetaModel = this.getModel("metaModel");
				var sEntityType = oMetaModel.getODataEntitySet(sConcept).entityType;
				self.setProperty("entityType", sEntityType);
				self.oEntityTypeModel = new sap.ui.model.json.JSONModel();
				self.oEntityTypeModel.setData(oMetaModel.getODataEntityType(sEntityType));
				self.setModel(self.oEntityTypeModel, "entityTypeModel");
				self.getAggregation("_conceptFilters").setModel(self.oEntityTypeModel, "entityTypeModel");

				self.getAggregation("_conceptFilters").getAggregation("_extendFilter").setVisible(true);
				currentModel.refresh();
				self.rerender();
			}
		}).bindElement("queryModel>"));
		self.setAggregation("_conceptFilters", new sparqlish.control.conceptFiltersControl().bindElement("queryModel>"));
		//TODO how do we know what concept the control is initialized with?
//				var sConcept = "Orders";
//				var oMetaModel = sap.ui.getCore().getModel("metaModel");
//				var sEntityType = oMetaModel.getODataEntitySet(sConcept).entityType;
//				//self.setProperty("entityType", sEntityType);
//				self.setEntityType( sEntityType,oMetaModel);
//				self.oEntityTypeModel = new sap.ui.model.json.JSONModel();
//				self.oEntityTypeModel.setData(oMetaModel.getODataEntityType(sEntityType));
//				self.setModel(self.oEntityTypeModel, "entityTypeModel");
//				self.getAggregation("_conceptFilters").setModel(self.oEntityTypeModel, "entityTypeModel");
	},
	setConceptClause : function(oConceptClause) {
		try {
			if (oConceptClause.concept == null) {
				var currentModel = this.getModel("queryModel");
				var currentContext = this.getBindingContext("queryModel");
				var currentModelData = currentModel.getProperty("", currentContext);
				currentModelData.concept = "[select concept]";
				// currentModel.setData(currentModelData,"queryModel");
				currentModel.refresh();
			}
		} catch (e) {
			jQuery.sap.log.error(e);
		}
	},
		setEntityType : function(sEntityType, oMetaModel) {
		try {
			var oEntityType = entityTypeContext(this.getModel("queryModel"), oMetaModel,this.getBindingContext("queryModel"));
			var currentEntityType = this.getProperty("entityType");
			if (currentEntityType != oEntityType.name) {
				this.setEntityType( oEntityType.name);

				this.oMetaModelEntityType = oEntityType;
				this.oEntityTypeModel = new sap.ui.model.json.JSONModel();
				this.oEntityTypeModel.setData(this.oMetaModelEntityType);
				this.oPropertyMenu.setModel(this.oEntityTypeModel, "entityTypeModel");

				this.oPropertyMenuItemObjectProperty.setText(this.oMetaModelEntityType.name + " " + sap.ui.getCore().getModel("i18n").getProperty("propertyMenuLink"));
				this.oPropertyMenuItemDataProperty.setText(this.oMetaModelEntityType.name + " "
						+ sap.ui.getCore().getModel("i18n").getProperty("propertyMenuAttribute"));
				this.rerender();
			}
		} catch (e) {
			jQuery.sap.log.error(e);
		}
	},
	renderer : function(oRm, oControl) {

		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.write(">");
		oRm.write(sap.ui.getCore().getModel("i18n").getProperty("conceptClauseFind"));
		oRm.renderControl(oControl.getAggregation("_concept"));
		oRm.renderControl(oControl.getAggregation("_conceptFilters"));
		oRm.write("</div>");
	}
});