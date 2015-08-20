// TODO why is this required
jQuery.sap.require("sap.ui.unified.MenuItem");
jQuery.sap.require("sap.ui.core.IconPool");
sap.ui.core.Control.extend("sparqlish.control.propertyMenu", {
	metadata : {
		properties : {
			entityType : {type: "string", defaultValue:"undefined"}
		},
		aggregations : {
			_properties : {
				type : "sap.ui.commons.Link",
				multiple : false
			}
		},
		events : {
			selected : {
				enablePreventDefault : true
			},
			unselected : {
				enablePreventDefault : true
			},
			changed : {
				enablePreventDefault : true
			}
		}
	},
	init : function() {
		var self = this;
		var oLink = new sap.ui.commons.Link({
			text : "[select property]",
			tooltip : "Select a property to find"
		}).addStyleClass("menuLink") ;
		var oObjectPropertyMenu = new sap.ui.unified.Menu({
			items : {
				path : "entityType>/navigationProperty",
				template : new sap.ui.unified.MenuItem({
					text : "{entityType>name}"
				})
			}
		});
		var oDataPropertyMenu = new sap.ui.unified.Menu({
			items : {
				path : "entityType>/property",
				template : new sap.ui.unified.MenuItem({
					text : "{entityType>name}"
				})
			}
		});
		var oPropertiesMenuItemDelete = new sap.ui.unified.MenuItem("delete", {
			text : "Delete",
			icon : sap.ui.core.IconPool.getIconURI("delete")
		});
		self.oPropertiesMenuItemObjectProperty = new sap.ui.unified.MenuItem();
		self.oPropertiesMenuItemObjectProperty.setText(this.getEntityType() + " " + sap.ui.getCore().getModel("i18nModel").getProperty("propertyMenuLink"));
		self.oPropertiesMenuItemDataProperty = new sap.ui.unified.MenuItem();
		self.oPropertiesMenuItemDataProperty.setText(this.getEntityType() + " " + sap.ui.getCore().getModel("i18nModel").getProperty("propertyMenuAttribute"));
	  self.oPropertiesMenu = new sap.ui.unified.Menu();
		self.oPropertiesMenu.addItem(oPropertiesMenuItemDelete).addItem(self.oPropertiesMenuItemObjectProperty).addItem(self.oPropertiesMenuItemDataProperty);
		self.oPropertiesMenuItemObjectProperty.setSubmenu(oObjectPropertyMenu);
		self.oPropertiesMenuItemDataProperty.setSubmenu(oDataPropertyMenu);

		oLink.attachPress(function(oEvent) {
			var self = oEvent.getSource().getParent();
			var eDock = sap.ui.core.Popup.Dock;
			self.oPropertiesMenu.open(false, oLink.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, oLink.getDomRef());
		});
		self.oPropertiesMenu.attachItemSelect(function(oEvent) {
			if (self.get_properties().getText() != oEvent.getParameter("item").getText()) {
				self.fireChanged({
					concept : oEvent.getParameter("item").getText()
				});
			}
			self.get_properties().setText(oEvent.getParameter("item").getText());
			self.fireSelected({
				concept : oEvent.getParameter("item").getText()
			});
		});

		self.set_properties(oLink);
	},
	setEntityType : function(sEntityType, oMetaModel) {
		try {
			var currentEntityType = this.getEntityType();
			if (currentEntityType != sEntityType) 
			{
				this.setProperty("entityType", sEntityType);

				this.oMetaModelEntityType = oMetaModel.getODataEntityType(sEntityType);
				this.oEntityTypeModel = new sap.ui.model.json.JSONModel();
				this.oEntityTypeModel.setData(this.oMetaModelEntityType);
				this.oPropertiesMenu.setModel(this.oEntityTypeModel, "entityType");

				this.oPropertiesMenuItemObjectProperty
						.setText(this.oMetaModelEntityType.name + " " + sap.ui.getCore().getModel("i18nModel").getProperty("propertyMenuLink")).rerender();
				this.oPropertiesMenuItemDataProperty.setText(this.oMetaModelEntityType.name + " "
						+ sap.ui.getCore().getModel("i18nModel").getProperty("propertyMenuAttribute")).rerender();

			}
		} catch (e) {
			jQuery.sap.log.error(e);
		}
	},
	renderer : function(oRm, oControl) {
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl.get_properties());
		oRm.write("</div>");

	}
});