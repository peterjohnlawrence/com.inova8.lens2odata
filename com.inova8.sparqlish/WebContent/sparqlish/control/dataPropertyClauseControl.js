sap.ui.core.Control.extend("sparqlish.control.dataPropertyClauseControl", {
	metadata : {
		properties : {
			dataPropertyClause : "object"
		},
		events : {},
		aggregations : {
			_dataProperty : {
				type : "sparqlish.control.dataPropertyControl",
				multiple : false
			},
			_dataPropertyFilters : {
				type : "sparqlish.control.dataPropertyFiltersControl",
				multiple : false
			}
		}
	},
	// set up the inner controls
	init : function() {
		var self = this;
		self.setAggregation("_dataProperty", new sparqlish.control.dataPropertyControl({
			selected : function(oEvent) {
				self.getAggregation("_dataPropertyFilters").getAggregation("_extendFilter").setVisible(true);
			},
			changed : function(oEvent) {
				var currentModel = this.getModel("queryModel");
				var currentContext = this.getBindingContext("queryModel");
				var currentModelData = currentModel.getProperty("", currentContext);
				currentModelData.dataPropertyFilters = [];
				// currentModel.setData(currentModelData,"queryModel");
				currentModel.refresh();
				self.rerender();
			}
		}).bindElement("queryModel>"));
		self.setAggregation("_dataPropertyFilters", new sparqlish.control.dataPropertyFiltersControl().bindElement("queryModel>dataPropertyFilters"));
	},
	setDataPropertyClause : function(oDataPropertyClause) {
		if (oDataPropertyClause.dataProperty == null) {
			var currentModel = this.getModel("queryModel");
			var currentContext = this.getBindingContext("queryModel");
			var currentModelData = currentModel.getProperty("", currentContext);
			currentModelData.dataProperty = "[select data property]";
			// currentModel.setData(currentModelData,"queryModel");
			currentModel.refresh();
		}
	},
	renderer : function(oRm, oControl) {
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.write("class=\"dataPropertyClause\"> with ");
		oRm.renderControl(oControl.getAggregation("_dataProperty"));
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_dataPropertyFilters"));
		oRm.write("</div>");
	}
});