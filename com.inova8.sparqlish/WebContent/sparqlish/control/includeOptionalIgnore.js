// TODO why is this required
jQuery.sap.require("sap.ui.unified.MenuItem");
jQuery.sap.require("sap.ui.core.IconPool");
sap.ui.commons.Link.extend("sparqlish.control.includeOptionalIgnore", {
	metadata : {
		properties : {
			state : {
				type : "string",
				defaultValue : "include"
			}
		},
		aggregations : {
			_includeOptionalIgnore : {
				type : "sap.ui.commons.Link",
				multiple : false
			}
		},
		events : {
			selected : {
				enablePreventDefault : true
			},
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
		self.setAggregation("_includeOptionalIgnore", new sap.ui.commons.Link({
			text : "{i18nModel>propertyClauseWith}",
			tooltip : "{i18nModel>propertyClauseTooltipWith}",
			press : function(oEvent) {
				self.oIincludeOptionalIgnoreMenuItemDelete = new sap.ui.unified.MenuItem({
					text : '{i18nModel>propertyClauseDelete}',
					icon : sap.ui.core.IconPool.getIconURI("delete")
				});
				self.oIincludeOptionalIgnoreMenuItemDelete.attachSelect(function(oEvent) {
					self.fireDeleted();
				});
				var oIincludeOptionalIgnoreMenu = new sap.ui.unified.Menu({
					items : [ self.oIincludeOptionalIgnoreMenuItemDelete, new sap.ui.unified.MenuItem({
						text : '{i18nModel>propertyClauseWith}'
					}), new sap.ui.unified.MenuItem({
						text : '{i18nModel>propertyClauseOptionallyWith}'
					}), new sap.ui.unified.MenuItem({
						text : '{i18nModel>propertyClauseIgnoreWith}'
					}) ]
				});
				var eDock = sap.ui.core.Popup.Dock;
				oIincludeOptionalIgnoreMenu
						.attachItemSelect(
								function(oEvent) {
									var sIncludeOptionalIgnore = oEvent.getParameter("item").getText();
									if (self.getAggregation("_includeOptionalIgnore").getText() != sIncludeOptionalIgnore) {
										self.fireChanged({
											conjunction : sIncludeOptionalIgnore
										});
									} else {
										self.fireSelected({
											conjunction : sIncludeOptionalIgnore
										});
									}
									self.getAggregation("_includeOptionalIgnore").setText(sIncludeOptionalIgnore);

									var currentModel = self.getModel("queryModel");
									var currentContext = self.getBindingContext("queryModel");
									var currentModelData = currentModel.getProperty("", currentContext);
									switch (sIncludeOptionalIgnore) {
									case sap.ui.getCore().getModel("i18nModel").getProperty("propertyClauseWith"):
										currentModelData.ignore = false;
										currentModelData.optional = false;
										currentModelData.includeOptionalIgnore = "include";
										self.getAggregation("_includeOptionalIgnore").setTooltip(sap.ui.getCore().getModel("i18nModel").getProperty("propertyClauseTooltipWith"));
										break;
									case sap.ui.getCore().getModel("i18nModel").getProperty("propertyClauseOptionallyWith"):
										currentModelData.ignore = false;
										currentModelData.optional = true;
										currentModelData.includeOptionalIgnore = "optional";
										self.getAggregation("_includeOptionalIgnore").setTooltip(
												sap.ui.getCore().getModel("i18nModel").getProperty("propertyClauseTooltipOptionallyWith"));
										break;
									case sap.ui.getCore().getModel("i18nModel").getProperty("propertyClauseIgnoreWith"):
										currentModelData.ignore = true;
										currentModelData.optional = false;
										currentModelData.includeOptionalIgnore = "ignore";
										self.getAggregation("_includeOptionalIgnore").setTooltip(
												sap.ui.getCore().getModel("i18nModel").getProperty("propertyClauseTooltipIgnoreWith"));
										break;
									}
									currentModel.refresh();
								}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}).bindElement("queryModel>includeOptionalIgnore").addStyleClass("menuLink"));
	},
	renderer : function(oRm, oControl) {
		//oRm.writeControlData(oControl);
		oRm.renderControl(oControl.getAggregation("_includeOptionalIgnore"));
	}
});