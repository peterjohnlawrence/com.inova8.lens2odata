jQuery.sap.require("control.dataPropertyFilter");
jQuery.sap.require("sap.ui.core.IconPool");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.dataPropertyConjunctionFilter", {
		metadata : {
			properties : {
			// dataPropertyConjunctionFilter : "object"
			},
			aggregations : {
				_conjunction : {
					type : "sap.m.Link",
					multiple : false
				},
				_dataPropertyFilter : {
					type : "control.dataPropertyFilter",
					multiple : false
				}
			},
			events : {
				deleted : {
					enablePreventDefault : true
				},
				changed : {
					enablePreventDefault : true
				},
				rerender : {
					enablePreventDefault : true
				}
			}
		},
		init : function() {
			var self = this;
			// self.setAggregation("_conjunction", new sap.ui.commons.TextField({value:"{filterConjunction}"}));
			self.setAggregation("_conjunction", new sap.m.Link({
				text : "{queryModel>filterConjunction}",
				tooltip : "Select a conjunction",
				press : function(oEvent) {
					// TODO Need to explicitly find 'this' instead of using self in the case of a aggregation with multiple=true
					var me = oEvent.getSource().getParent();
					var eDock = sap.ui.core.Popup.Dock;
					var oConjunctionMenu = new sap.ui.unified.Menu({
						items : [ new sap.ui.unified.MenuItem({
							text : '{i18nModel>dataPropertyConjunctionFilter.and}'
						}), new sap.ui.unified.MenuItem({
							text : '{i18nModel>dataPropertyConjunctionFilter.or}'
						}), new sap.ui.unified.MenuItem({
							text : '{i18nModel>dataPropertyConjunctionFilter.delete}',
							icon : sap.ui.core.IconPool.getIconURI("delete")
						}) ]
					});
					oConjunctionMenu.attachItemSelect(function(oEvent) {
						var selectedItem = oEvent.getParameter("item").getText();
						if (selectedItem == sap.ui.getCore().getModel("i18nModel").getProperty("dataPropertyConjunctionFilter.delete")) {
							// TODO add handler
							me.fireDeleted();
						} else {
							me.getAggregation("_conjunction").setText(selectedItem);
						}
					}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
				}
			}).addStyleClass("menuLink"));
			self.setAggregation("_dataPropertyFilter", new control.dataPropertyFilter({
				dataPropertyFilterDeleted : function(oEvent) {
					// TODO Should not delete if there are still some conjunctions
					// TODO is this really the best way to delete an element?
					var currentModel = oEvent.getSource().getModel("queryModel");
					var currentContext = oEvent.getSource().getBindingContext("queryModel");
					var path = currentContext.getPath().split("/");
					var index = path[path.length - 1];
					var dataPropertyFiltersContextPath = currentContext.getPath().slice(0, -(1 + index.length))
					var dataPropertyFiltersContext = new sap.ui.model.Context("queryModel", dataPropertyFiltersContextPath);
					var currentModelData = currentModel.getProperty("", dataPropertyFiltersContext);
					// TODO
					currentModelData.dataPropertyfilter = {};
					// currentModel.setData(currentModelData,"queryModel");
					currentModel.refresh();
					self.fireRerender();
					oEvent.getSource().getParent().rerender();

				}
			}).bindElement("queryModel>dataPropertyFilter"));
		},
		// setDataPropertyConjunctionFilter : function(oDataPropertyConjunctionFilter) {
		// },
		renderer : function(oRm, oControl) {
			oRm.write("&nbsp;");
			oRm.renderControl(oControl.getAggregation("_conjunction"));
			oRm.renderControl(oControl.getAggregation("_dataPropertyFilter").setConjunction(true));
		}
	});
});