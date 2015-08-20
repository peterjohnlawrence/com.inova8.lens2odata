jQuery.sap.require("sparqlish.control.dataPropertyControl");
jQuery.sap.require("sparqlish.control.dataPropertyFiltersControl");
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
//				self.getAggregation("_dataPropertyFilters").getAggregation("_extendFilter").setVisible(false);
			},
			changed : function(oEvent) {
				var currentModel = this.getModel("queryModel");
				var currentContext = this.getBindingContext("queryModel");
				var currentModelData = currentModel.getProperty("", currentContext);
				currentModelData.dataPropertyFilters = [];
				// currentModel.setData(currentModelData,"queryModel");
				self.getAggregation("_dataPropertyFilters").getAggregation("_extendFilter").setVisible(true);
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
			self.getAggregation("_dataPropertyFilters").getAggregation("_extendFilter").setVisible(true);
			currentModel.refresh();
		}
	},
	renderer : function(oRm, oControl) {
		oRm.addClass("dataPropertyClause");
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.write(">");
		oRm.write(sap.ui.getCore().getModel("i18nModel").getProperty("dataPropertyClauseWith"));
		oRm.renderControl(oControl.getAggregation("_dataProperty"));
		oRm.renderControl(oControl.getAggregation("_dataPropertyFilters"));
		oRm.write("</div>");
	}
});