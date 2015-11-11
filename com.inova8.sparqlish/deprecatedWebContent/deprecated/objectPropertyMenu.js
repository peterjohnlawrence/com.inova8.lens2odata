// TODO why is this required
jQuery.sap.require("sap.ui.unified.MenuItem");
sap.ui.core.Control.extend("sparqlish.control.objectPropertyMenu", {
	metadata : {
		properties : {
			entityType : "string"
		},
		aggregations : {
			_objectProperty : {
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
			text : "[select object property]",
			tooltip : "Select a navigation property to find"
		}).addStyleClass("menuLink") ;
		self.oObjectPropertyMenu = new sap.ui.unified.Menu({
			items : {
				path : "entityType>/navigationProperty",
				template : new sap.ui.unified.MenuItem({
					text : "{entityType>name}"
				})
			}
		});
		oLink.attachPress(function(oEvent) {
			var self = oEvent.getSource().getParent();
			var eDock = sap.ui.core.Popup.Dock;
			self.oObjectPropertyMenu.open(false, oLink.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, oLink.getDomRef());
		});
		self.oObjectPropertyMenu.attachItemSelect(function(oEvent) {
			if (self.getAggregation("_objectProperty").getText() != oEvent.getParameter("item").getText()) {
				self.fireChanged({
					concept : oEvent.getParameter("item").getText()
				});
			}
			self.getAggregation("_objectProperty").setText(oEvent.getParameter("item").getText());
			self.fireSelected({
				concept : oEvent.getParameter("item").getText()
			});
		});

		this.setAggregation("_objectProperty", oLink);
	},
	setEntityType : function(sEntityType, oMetaModel) {
		var currentEntityType = this.getProperty("entityType");
		if (currentEntityType != sEntityType) {
			this.setProperty("entityType", sEntityType);

			this.oMetaModelEntityType = oMetaModel.getODataEntityType(sEntityType);
			this.oEntityTypeModel = new sap.ui.model.json.JSONModel();
			this.oEntityTypeModel.setData(this.oMetaModelEntityType);
			this.oObjectPropertyMenu.setModel(this.oEntityTypeModel, "entityType");
		}
	},
	renderer : function(oRm, oControl) {
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.write("class=\"conceptClause\">");
		oRm.renderControl(oControl.getAggregation("_objectProperty"));
		oRm.write("</div>");
	}
});