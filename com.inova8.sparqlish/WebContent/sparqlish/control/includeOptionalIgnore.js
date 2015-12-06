jQuery.sap.require("sap.ui.unified.MenuItem");
jQuery.sap.require("sap.ui.core.IconPool");
sap.m.Link.extend("sparqlish.control.includeOptionalIgnore", {
	metadata : {
		properties : {
			state : {
				type : "string",
				defaultValue : "include"
			},
			conjunction : {
				type : "boolean",
				defaultValue : false
			}
		},
		aggregations : {
			_includeOptionalIgnore : {
				type : "sap.m.Link",
				multiple : false
			}
		},
		events : {
			propertyClauseDeleteRequested : {
				enablePreventDefault : true
			},
			includeOptionalIgnoreChanged : {
				enablePreventDefault : true
			}
		}
	},
	init : function() {
		var self = this;
		self.setAggregation("_includeOptionalIgnore", new sap.m.Link({
			text : "{= ${queryModel>ignore} ? 'excl':'incl'  }",// "{i18nModel>propertyClauseWith}",
			tooltip : "{i18nModel>propertyClauseTooltipWith}",
			press : function(oEvent) {
				self.oIncludeOptionalIgnoreMenuItemDelete = new sap.ui.unified.MenuItem({
					text : '{i18nModel>propertyClauseDelete}',
					icon : sap.ui.core.IconPool.getIconURI("delete")
				});
				self.oIncludeOptionalIgnoreMenuItemDelete.attachSelect(function(oEvent) {
					self.firePropertyClauseDeleteRequested();
				});
				self.oIncludeOptionalIgnoreMenu = new sap.ui.unified.Menu({
					items : [ new sap.ui.unified.MenuItem({
						text : '{i18nModel>propertyClauseWith}'
					}), new sap.ui.unified.MenuItem({
						text : '{i18nModel>propertyClauseOptionallyWith}'
					}), new sap.ui.unified.MenuItem({
						text : '{i18nModel>propertyClauseIgnoreWith}'
					}) ]
				});
				if (!self.getConjunction()) {
					self.oIncludeOptionalIgnoreMenu.addItem(self.oIncludeOptionalIgnoreMenuItemDelete);
				}
				var eDock = sap.ui.core.Popup.Dock;
				self.oIncludeOptionalIgnoreMenu.attachItemSelect(
						function(oEvent) {
							var sIncludeOptionalIgnore = oEvent.getParameter("item").getText();
							if (sIncludeOptionalIgnore != "DELETE ") {
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
								// TODO is this correct?
								self.fireIncludeOptionalIgnoreChanged();
							//	self.getParent().getParent().rerender()
							}
						}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}).bindElement("queryModel>includeOptionalIgnore").addStyleClass("conjunctionMenuLink"));
	},
	renderer : function(oRm, oControl) {
		// oRm.writeControlData(oControl);
		var oClause = oControl.getModel("queryModel").getProperty("", oControl.getBindingContext("queryModel"));
		var oText = "";
		if (oClause.ignore) {
			oText = sap.ui.getCore().getModel("i18nModel").getProperty("propertyClauseIgnoreWith");
		} else if (oClause.optional) {
			oText = sap.ui.getCore().getModel("i18nModel").getProperty("propertyClauseOptionallyWith");
		} else {
			oText = sap.ui.getCore().getModel("i18nModel").getProperty("propertyClauseWith");
		}
		oRm.renderControl(oControl.getAggregation("_includeOptionalIgnore").setText(oText));
	}
});