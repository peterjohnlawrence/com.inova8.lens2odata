jQuery.sap.require("sparqlish.control.objectPropertyFilterControl");
jQuery.sap.require("sparqlish.control.iconLink");
sap.ui.core.Control.extend("sparqlish.control.objectPropertyFiltersControl", {
	metadata : {
		aggregations : {
			_objectPropertyFilters : {
				type : "sparqlish.control.objectPropertyFilterControl",
				multiple : true
			},
			_extendFilter : {
				type : "sparqlish.control.iconLink",
				multiple : false
			}
		}
	},
	init : function() {
		var self = this;
		self.bindAggregation("_objectPropertyFilters", "queryModel>", new sparqlish.control.objectPropertyFilterControl({
			deleted : function(oEvent) {
				// TODO is this really the best way to delete an element?
				var me = oEvent.getSource();
				var currentModel = me.getModel("queryModel");
				var currentContext = me.getBindingContext("queryModel");
				var path = currentContext.getPath().split("/");
				var index = path[path.length - 1];
				var objectPropertyFiltersContextPath = currentContext.getPath().slice(0, -(1 + index.length))
				var objectPropertyFiltersContext = new sap.ui.model.Context("queryModel", objectPropertyFiltersContextPath);
				var currentModelData = currentModel.getProperty("", objectPropertyFiltersContext);
				currentModelData.splice(index, 1);
				currentModel.refresh();
				// TODO self not safe
				self.getParent().rerender();
			}
		}));
		self.setAggregation("_extendFilter", new sparqlish.control.iconLink({
			visible:true,
			text : "[+]",
			icon : "add-filter",
			tooltip : "Add an object filter value",
			press : function(oEvent) {
				// TODO self not safe
				//var me = oEvent.getSource().getParent();
				var currentModel = self.getModel("queryModel");
				var currentContext = self.getBindingContext("queryModel");
				var currentModelData = currentModel.getProperty("", currentContext);
				if (currentModelData == null) {
					currentModelData = [];
				}
				currentModelData.push({
					CustomerID : "[enter new value]"
				});
				self.getAggregation("_extendFilter").setVisible(true);
				currentModel.refresh();
				self.getParent().rerender();
			}
		}));
	},
	renderer : function(oRm, oControl) {
		var objectPropertyFilters = oControl.getAggregation("_objectPropertyFilters");
		if (objectPropertyFilters != null) {
			for (var i = 0; i < objectPropertyFilters.length; i++) {
				if (i > 0) {
					oRm.write(", ");
				} else {
					oRm.write(" in ");
				}
				oRm.write("&nbsp;");
				oRm.renderControl(objectPropertyFilters[i]);
			}
		}
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_extendFilter"));
	}
});