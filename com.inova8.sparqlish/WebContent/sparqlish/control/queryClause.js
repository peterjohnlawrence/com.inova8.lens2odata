jQuery.sap.require("sparqlish.control.queryControl");
sap.ui.core.Control.extend("sparqlish.control.queryClause", {
	metadata : {
		properties : {
			clausePath : {
				type : "string"
			}
		},
		events : {},
		aggregations : {
			_queryControl : {
				type : "sparqlish.control.queryControl",
				multiple : false
			}
		}
	},
	init : function() {
		var self = this;
		self.setAggregation("_queryControl", new sparqlish.control.queryControl());
	},
	setClausePath : function(sClausePath) {
		if (sClausePath != null) {
			this.setProperty("clausePath", sClausePath);
			this.getAggregation("_queryControl").bindElement(sClausePath);
	//		this.bindElement(sClausePath);
		}
		return this;
	},
	renderer : function(oRm, oControl) {
		if (oControl.getClausePath() != undefined) {
			 oControl.getAggregation("_queryControl").bindElement(oControl.getClausePath());
			oRm.addClass("queryClause");
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_queryControl"));
			oRm.write("</div>");
		}
	}
});