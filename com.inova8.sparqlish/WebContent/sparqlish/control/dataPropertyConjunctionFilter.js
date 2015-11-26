jQuery.sap.require("sparqlish.control.dataPropertyFilter");
jQuery.sap.require("sap.ui.core.IconPool");
sap.ui.core.Control.extend("sparqlish.control.dataPropertyConjunctionFilter", {
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
				type : "sparqlish.control.dataPropertyFilter",
				multiple : false
			}
		},
		events : {
			deleted : {
				enablePreventDefault : true
			},
			changed : {
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
						text : '{i18nModel>dataPropertyClauseDELETE}',
						icon : sap.ui.core.IconPool.getIconURI("delete")
					}), new sap.ui.unified.MenuItem({
						text : '{i18nModel>dataPropertyClauseAnd}'
					}), new sap.ui.unified.MenuItem({
						text : '{i18nModel>dataPropertyClauseOr}'
					}) ]
				});
				oConjunctionMenu.attachItemSelect(function(oEvent) {
					var selectedItem = oEvent.getParameter("item").getText();
					if (selectedItem == sap.ui.getCore().getModel("i18nModel").getProperty("dataPropertyClauseDELETE")) {
						// TODO add handler
						me.fireDeleted();
					} else {
						me.getAggregation("_conjunction").setText(selectedItem);
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}).addStyleClass("menuLink"));
		self.setAggregation("_dataPropertyFilter", new sparqlish.control.dataPropertyFilter({
			deleted : function(oEvent) {
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
				oEvent.getSource().getParent().rerender();

			}
		}).bindElement("queryModel>dataPropertyFilter"));
	},
	// setDataPropertyConjunctionFilter : function(oDataPropertyConjunctionFilter) {
	// },
	renderer : function(oRm, oControl) {
//		oRm.addClass("menuLink");
//		oRm.addClass("sapUiSizeCompact");
//		oRm.write("<div ");
//		oRm.writeControlData(oControl);
//		oRm.writeClasses();
//		oRm.write(">");
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_conjunction"));
		oRm.write("&nbsp;");
//		oRm.write("</div>");
		oRm.renderControl(oControl.getAggregation("_dataPropertyFilter"));
	}
});