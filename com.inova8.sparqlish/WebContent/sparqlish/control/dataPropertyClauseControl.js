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
				this.setAggregation("_dataProperty", new sparqlish.control.dataPropertyControl({
			selected : function(oEvent) {
				self.getAggregation("_dataPropertyFilters").getAggregation("_extendFilter").setVisible(true);
			},
			changed : function(oEvent) {
				var currentModel = this.getModel();
				var currentModelData = currentModel.getData();
				currentModelData.propertyClause.dataPropertytFilters = [];
				currentModel.setData(currentModelData);
				currentModel.refresh();
				self.rerender();
			}
		}).bindElement("/propertyClause") //.bindProperty("dataProperty", "/dataPropertyClause")
		);
		this.setAggregation("_dataPropertyFilters", new sparqlish.control.dataPropertyFiltersControl().bindElement( "/propertyClause/filters") //.bindProperty("dataPropertyFilters", "/dataPropertyClause/filters")
				);
	},
	setDataPropertyClause : function(oDataPropertyClause ) {
		if (oDataPropertyClause.dataProperty == null){
				var currentModel = this.getModel();
				var currentModelData = currentModel.getData();
				currentModelData.propertyClause.dataProperty = "[select data property]";
				currentModel.setData(currentModelData);
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