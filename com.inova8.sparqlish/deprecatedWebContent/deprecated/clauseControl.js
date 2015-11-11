jQuery.sap.require("sparqlish.control.clausesControl");
jQuery.sap.require("sparqlish.control.includeOptionalIgnore");
sap.ui.core.Control.extend("sparqlish.control.clauseControl", {
	metadata : {
		properties : {},
		aggregations : {
			_includeOptionalIgnore : {
				type : "sparqlish.control.includeOptionalIgnore",
				multiple : false
			},
			_label : {
				type : "sap.ui.commons.TextField",
				multiple : false
			},
			_extendClause : {
				type : "sparqlish.control.iconLink",
				multiple : false
			},
			_clauses : {
				type : "sparqlish.control.clausesControl",
				multiple : false,
				hidden:true
			}
		},
		events : {}
	},
	init : function() {
		var self = this;
		self.setAggregation("_includeOptionalIgnore", new sparqlish.control.includeOptionalIgnore({
			state : "{queryModel>includeOptionalIgnore}"
		}));
		self.setAggregation("_label", new sap.ui.commons.TextField({
			value : "{queryModel>label}",
			tooltip : "Enter value for label",
			width : "auto"
		}));
		self.setAggregation("_extendClause", new sparqlish.control.iconLink({
			text : "[...]",
			icon : "add-process",
			tooltip : "Add another clause",
			press : function(oEvent) {
				// var currentModel = self.getModel();
				// var currentModelData = currentModel.getData();
				// currentModel.setData(currentModelData);
				// currentModel.refresh();
				// self.getParent().rerender();
			}
		}));
//		 self.setAggregation("_clauses", new sparqlish.control.clausesControl({
//		 deleted : function(oEvent) {
//		 // TODO Should not delete if there are still some conjunctions
//		 // TODO is this really the best way to delete an element?
//		 // var path = oEvent.getSource().getBindingContext().getPath().split("/");
//		 // var index = path[path.length - 1];
//		 var currentModel = oEvent.getSource().getModel();
//		 // var currentModelData = currentModel.getData();
//		 // currentModelData.clauses.conjunctionClauses.clause = {};
//		 // currentModel.setData(currentModelData);
//		 // currentModel.refresh();
//		 // self.getParent().rerender();
//		 }
//		 }).bindElement("queryModel>propertyClause/clauses"));
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_expand"));
		oRm.renderControl(oControl.getAggregation("_includeOptionalIgnore"));
		oRm.renderControl(oControl.getAggregation("_label"));
		oRm.renderControl(oControl.getAggregation("_extendClause"));
	}
});