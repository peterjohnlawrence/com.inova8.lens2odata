sap.ui.core.Control.extend("sparqlish.control.objectPropertyClauseControl", {
	metadata : {
		properties : {
			objectPropertyClause : "object"
		},
		events : {},
		aggregations : {
			_objectProperty : {
				type : "sparqlish.control.objectPropertyControl",
				multiple : false,
				visibility : "hidden"
			},
			_objectPropertyFilters : {
				type : "sparqlish.control.objectPropertyFiltersControl",
				multiple : false,
				visibility : "hidden"
			}
		}
	},
	// set up the inner controls
	init : function() {
		var self = this;
		self.setAggregation("_objectProperty", new sparqlish.control.objectPropertyControl({
			selected : function(oEvent) {
				self.getAggregation("_objectPropertyFilters").getAggregation("_extendFilter").setVisible(true);
			},
			changed : function(oEvent) {
				var currentModel = this.getModel("queryModel");
				var currentContext = this.getBindingContext("queryModel");
				var currentModelData = currentModel.getProperty("",currentContext);
				currentModelData.objectPropertyFilters = [];
				//currentModel.setData(currentModelData,"queryModel");
				currentModel.refresh();
				self.rerender();
			}
		}).bindElement("queryModel>propertyClause"));
		// TODO
		self.setAggregation("_objectPropertyFilters", new sparqlish.control.objectPropertyFiltersControl().bindElement( "queryModel>propertyClause"));
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
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.write("class=\"objectPropertyClause\"> with ");
		oRm.renderControl(oControl.getAggregation("_objectProperty"));
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_objectPropertyFilters"));
		oRm.write("</div>");
	}
});