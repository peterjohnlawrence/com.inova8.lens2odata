jQuery.sap.require("sparqlish.control.objectPropertyControl");
jQuery.sap.require("sparqlish.control.objectPropertyFiltersControl");
sap.ui.core.Control.extend("sparqlish.control.objectPropertyClauseControl", {
	metadata : {
		properties : {
			objectPropertyClause : "object"
		},
		events : {},
		aggregations : {
			_objectProperty : {
				type : "sparqlish.control.objectPropertyControl",
				multiple : false
			},
			_objectPropertyFilters : {
				type : "sparqlish.control.objectPropertyFiltersControl",
				multiple : false
			}
		}
	},
	// set up the inner controls
	init : function() {
		var self = this;
		self.setAggregation("_objectProperty", new sparqlish.control.objectPropertyControl({
			selected : function(oEvent) {
//				self.getAggregation("_objectPropertyFilters").getAggregation("_extendFilter").setVisible(false);
			},
			changed : function(oEvent) {
				var currentModel = this.getModel("queryModel");
				var currentContext = this.getBindingContext("queryModel");
				var currentModelData = currentModel.getProperty("",currentContext);
				currentModelData.objectPropertyFilters = [];
				//currentModel.setData(currentModelData,"queryModel");
				self.getAggregation("_objectPropertyFilters").getAggregation("_extendFilter").setVisible(true);
				currentModel.refresh();
				self.rerender();
			}
		}).bindElement("queryModel>"));
		// TODO
		self.setAggregation("_objectPropertyFilters", new sparqlish.control.objectPropertyFiltersControl().bindElement( "queryModel>objectPropertyFilters"));
	},
	setObjectPropertyClause : function(oObjectPropertyClause) {
		if (oObjectPropertyClause.objectProperty == null){
				var currentModel = this.getModel("queryModel");
				var currentContext = this.getBindingContext("queryModel");
				var currentModelData = currentModel.getProperty("",currentContext);
				currentModelData.objectProperty = "[select object property]";
				currentModel.refresh();
		}
	},
	renderer : function(oRm, oControl) {
		oRm.addClass("objectPropertyClause");
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.write(">");
		oRm.write(sap.ui.getCore().getModel("i18nModel").getProperty("objectPropertyClauseWith"));
		oRm.renderControl(oControl.getAggregation("_objectProperty"));
		oRm.renderControl(oControl.getAggregation("_objectPropertyFilters"));
		oRm.write("</div>");
	}
});