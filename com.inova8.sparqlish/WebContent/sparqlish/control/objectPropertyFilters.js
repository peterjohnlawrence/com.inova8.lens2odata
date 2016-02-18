jQuery.sap.require("sparqlish.control.objectPropertyFilter");
jQuery.sap.require("sparqlish.control.extendFilter");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("sparqlish.control.objectPropertyFilters", {
		metadata : {
			aggregations : {
				_objectPropertyFilters : {
					type : "sparqlish.control.objectPropertyFilter",
					multiple : true
				},
				_extendFilter : {
					type : "sparqlish.control.extendFilter",
					multiple : false
				}
			}
		},
		getCurrentQueryContext : function() {
			var currentQueryContext = this.getModel("queryModel").getProperty("", this.getBindingContext("queryModel"));
			if (currentQueryContext == undefined) {
				this.getModel("queryModel").setProperty(this.getBindingContext("queryModel").getPath(), []);
				return this.getModel("queryModel").getProperty("", this.getBindingContext("queryModel"));
			} else {
				return currentQueryContext;
			}
		},
		extendFilter : function() {
			var currentQueryContext = this.getCurrentQueryContext();
			//var keyId = this.getModel("metaModel").getODataEntityType(this.getParent().getRangeEntityTypeQName()).key.propertyRef[0].name;
			var keyId = this.getModel("metaModel").getODataEntityType(this.getParent().getRangeEntityTypeQName()).property[0].name;
			var keyProperty = this.getModel("metaModel").getDataProperty(this.getParent().getRangeEntityTypeQName(), keyId);
			currentQueryContext.push([ {
				key : keyId,
				value : "[enter new value]",
				type : keyProperty.type
			} ]);
		},
		init : function() {
			var self = this;
			// TODO should we use a factory function to ensure correct binding of context?
			self.bindAggregation("_objectPropertyFilters", "queryModel>", new sparqlish.control.objectPropertyFilter({
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
			self.setAggregation("_extendFilter", new sparqlish.control.extendFilter({
				visible : true,
				text : "[+]",
				icon : "add-filter",
				tooltip : "{i18nModel>addObjectFilterTooltip}",
				press : function(oEvent) {
					self.extendFilter();
					self.getAggregation("_extendFilter").setVisible(true);
					self.getModel("queryModel").refresh();
					self.getParent().rerender();
				}
			}));
		},
		renderer : function(oRm, oControl) {
			var objectPropertyFilters = oControl.getAggregation("_objectPropertyFilters");
			if (!jQuery.isEmptyObject(objectPropertyFilters)) {
				for (var i = 0; i < objectPropertyFilters.length; i++) {
					if (i > 0) {
						oRm.renderControl(new sap.m.Label().setText(sap.ui.getCore().getModel("i18nModel").getProperty("conceptClauseConjunction")).addStyleClass(
								"conjunctionMenuLink"));
					} else {
						oRm.write("&nbsp;");
						oRm.renderControl(new sap.m.Label().setText(sap.ui.getCore().getModel("i18nModel").getProperty("conceptClauseIn")).addStyleClass(
								"conjunctionMenuLink"));
					}
					oRm.write("&nbsp;");
					oRm.renderControl(objectPropertyFilters[i]);
				}
			}
			oRm.write("&nbsp;");
			oRm.renderControl(oControl.getAggregation("_extendFilter"));
		}
	});
});