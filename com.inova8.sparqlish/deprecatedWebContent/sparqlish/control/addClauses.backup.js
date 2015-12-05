jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("sap.ui.ux3.ToolPopup");
jQuery.sap.require("sap.ui.commons.Panel");
sap.ui.commons.Link.extend("sparqlish.control.addClauses", {
	metadata : {
		properties : {},
		aggregations : {
			_icon : {
				type : "sap.ui.core.Icon",
				multiple : false
			}
		},
		events : {
			pressed : {
				enablePreventDefault : true
			}
		}
	},
	initData : function() {
		var self = this;
		// create Property lists
		self.oToolPopup.destroyContent();
		self.oObjectPropertyList = new sap.ui.commons.ListBox({
			items : {
				path : "entityTypeModel>/navigationProperty",
				template : new sap.ui.core.ListItem({
					text : "{entityTypeModel>name}"
				})
			}
		});
		self.oObjectPropertyList.setAllowMultiSelect(true);
		self.oDataPropertyList = new sap.ui.commons.ListBox({
			items : {
				path : "entityTypeModel>/property",
				template : new sap.ui.core.ListItem({
					text : "{entityTypeModel>name}"
				})
			}
		});
		self.oDataPropertyList.setAllowMultiSelect(true);
		self.oToolPopup.addContent(self.oObjectPropertyList);
		self.oToolPopup.addContent(self.oDataPropertyList);
		self.oToggleDataPropertiesCheckBox.setPressed(false);
		self.oToggleObjectPropertiesCheckBox.setPressed(false);

	},
	init : function() {
		var self = this;
		self.oAddClauseLink = new sap.ui.core.Icon({
			src : sap.ui.core.IconPool.getIconURI("add-process"),
			tooltip : "{i18nModel>addClauseTooltip}"
		}).setColor(sap.ui.core.IconColor.Neutral);

		// create the core panel for the popup
		// self.oClausePanel = new sap.ui.commons.Panel();
		// self.oClausePanel.setShowCollapseIcon(false);
		self.oSaveButton = new sap.ui.commons.Button({
			text : "{i18nModel>addClauses}"
		});
		self.oSaveButton.attachPress(function(oEvent) {
			self.oToolPopup.close();
			self.firePressed();
		});

		self.oToggleDataPropertiesCheckBox = new sap.ui.commons.ToggleButton({
			text : "{i18nModel>toogleDataProperties}"
		});
		self.oToggleDataPropertiesCheckBox.attachPress(function(oEvent) {
			if (oEvent.getSource().getPressed()) {
				for (var i = 0; i < self.oDataPropertyList.getItems().length; i++) {
					self.oDataPropertyList.addSelectedIndex(i);
				}
			} else {
				self.oDataPropertyList.clearSelection();
			}
		});
		self.oToggleObjectPropertiesCheckBox = new sap.ui.commons.ToggleButton({
			text : "{i18nModel>toogleObjectProperties}"
		});
		self.oToggleObjectPropertiesCheckBox.attachPress(function(oEvent) {
			if (oEvent.getSource().getPressed()) {
				for (var i = 0; i < self.oObjectPropertyList.getItems().length; i++) {
					self.oObjectPropertyList.addSelectedIndex(i);
				}
			} else {
				self.oObjectPropertyList.clearSelection();
			}
		});

		self.oToolPopup = new sap.ui.ux3.ToolPopup();
		self.oToolPopup.addContent(self.oClausePanel);
		self.oToolPopup.bindElement("queryModel>");
		self.oToolPopup.setOpener(self.oAddClauseLink);
		self.oToolPopup.setAutoClose(true);

		self.oToolPopup.addButton(self.oSaveButton);
		self.oToolPopup.addButton(self.oToggleDataPropertiesCheckBox);
		self.oToolPopup.addButton(self.oToggleObjectPropertiesCheckBox);

		self.oAddClauseLink.attachPress(function(oEvent) {
			// This would be used for just pressing the addlink. Need to show menu of clauses to add
			// self.firePressed();

			var self = oEvent.getSource().getParent();
			// Setup property menu according to current model context if not already set
			var oEntityTypeContext = self.getParent().getRangeEntityTypeContext();
			var sEntityTypeQName = self.getParent().getRangeEntityTypeQName();

			self.oEntityTypeModel = new sap.ui.model.json.JSONModel();
			self.oEntityTypeModel.setData(oEntityTypeContext);

			self.oToolPopup.setModel(self.oEntityTypeModel, "entityTypeModel");
			self.initData();
			if (self.oToolPopup.isOpen()) {
				self.oToolPopup.close();
			} else {
				self.oToolPopup.open();
			}
		});
		self.setAggregation("_icon", self.oAddClauseLink);
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_icon"));
	}
});