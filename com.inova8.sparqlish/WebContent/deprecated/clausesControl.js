jQuery.sap.require("sparqlish.control.clauseControl");
jQuery.sap.require("sparqlish.control.conjunctionClauseControl");
sap.ui.core.Control.extend("sparqlish.control.clausesControl", {
	metadata : {
		properties : {
//			clauses : "object"
		},
		events : {},
		aggregations : {
			_clause : {
				type : "sparqlish.control.clauseControl",
				multiple : false
			},
			_conjunctionClauses : {
				type : "sparqlish.control.conjunctionClauseControl",
				multiple : true
			}
		}
	},
	init : function() {
		var self = this;
		self.setAggregation("_clause", new sparqlish.control.clauseControl({
//			selected : function(oEvent) {
//				// self.getAggregation("_conjunctionClauses").getAggregation("_extendFilter").setVisible(true);
//			},
//			changed : function(oEvent) {
//				var currentModel = this.getModel();
//				var currentModelData = currentModel.getData();
//				currentModelData.clauses.conjunctionClauses = [];
//				currentModel.setData(currentModelData);
//				currentModel.refresh();
//				self.rerender();
//			}
		}).bindElement("queryModel>clause"));

		self.bindAggregation("_conjunctionClauses", "queryModel>conjunctionClauses", new sparqlish.control.conjunctionClauseControl());

	},

	renderer : function(oRm, oControl) {
		oRm.write("<div>");
		// oRm.writeControlData(oControl);
		oRm.write(" with ");
		oRm.renderControl(oControl.getAggregation("_clause"));
		oRm.write("&nbsp;");
		var oConjunctionClauses = oControl.getAggregation("_conjunctionClauses")
		if (oConjunctionClauses != null) {
			for (var i = 0; i < oConjunctionClauses.length; i++) {
				oRm.write("<br\>");
				oRm.renderControl(oConjunctionClauses[i]);
			}
		}
		oRm.write("&nbsp;");
//		oRm.renderControl(oControl.getAggregation("_extendClause"));
		oRm.write("</div>");
	}
});