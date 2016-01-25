jQuery.sap.require("sparqlish.control.conceptFilter");
jQuery.sap.require("sparqlish.control.extendFilter");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("sparqlish.control.conceptFilters", {
		metadata : {
			aggregations : {
				_conceptFilters : {
					type : "sparqlish.control.conceptFilter",
					multiple : true
				},
				_extendFilter : {
					type : "sparqlish.control.extendFilter",
					multiple : false
				}
			},
			events : {
				conceptFiltersChanged : {
					enablePreventDefault : true
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
			var keyId = this.getModel("metaModel").getODataEntityType(this.getParent().getRangeEntityTypeQName()).key.propertyRef[0].name;
			var keyProperty = this.getModel("metaModel").getDataProperty(this.getParent().getRangeEntityTypeQName(), keyId);
			currentQueryContext.push([ {
				key : keyId,
				value : "[enter new value]",
				type : keyProperty.type
			} ]);
		},
		init : function() {
			var self = this;
			self.bindAggregation("_conceptFilters", "queryModel>", new sparqlish.control.conceptFilter({
				deleted : function(oEvent) {
					// TODO is this really the best way to delete an element?
					var me = oEvent.getSource().me;
					var currentContext = me.getBindingContext("queryModel");
					var currentModelData = me.getModel("queryModel").getProperty("", currentContext);
					var path = currentContext.getPath().split("/");
					var index = path[path.length - 1];
					var conceptFiltersContextPath = currentContext.getPath().slice(0, -(1 + index.length))
					var conceptFiltersContext = new sap.ui.model.Context("queryModel", conceptFiltersContextPath);
					var currentModelData = me.getModel("queryModel").getProperty("", conceptFiltersContext);
					currentModelData.splice(index, 1);

					self.getModel("queryModel").refresh();
					// TODO Required? or rerender
					self.fireConceptFiltersChanged(oEvent);
				}
			}));
			self.setAggregation("_extendFilter", new sparqlish.control.extendFilter({
				text : "add-filter",
				icon : "add-filter",
				tooltip : "Add a filter value",
				visible : true,
				press : function(oEvent) {
					self.extendFilter();
					self.getAggregation("_extendFilter").setVisible(true);

					self.getModel("queryModel").refresh();
					// TODO Required? or rerender
					self.fireConceptFiltersChanged(oEvent);
				}
			}));
		},
		renderer : function(oRm, oControl) {
			var conceptFilters = oControl.getAggregation("_conceptFilters");
			if (!jQuery.isEmptyObject(conceptFilters)) {
				for (var i = 0; i < conceptFilters.length; i++) {
					if (i > 0) {
						oRm.renderControl(new sap.m.Label().setText(sap.ui.getCore().getModel("i18nModel").getProperty("conceptClauseConjunction")).addStyleClass(
								"conjunctionMenuLink"));
					} else {
						oRm.write("&nbsp;");
						oRm.renderControl(new sap.m.Label().setText(sap.ui.getCore().getModel("i18nModel").getProperty("conceptClauseIn")).addStyleClass(
								"conjunctionMenuLink"));
					}
					oRm.renderControl(conceptFilters[i]);
				}
			}
			oRm.write("&nbsp;");
			oRm.renderControl(oControl.getAggregation("_extendFilter"));
		}
	});
});