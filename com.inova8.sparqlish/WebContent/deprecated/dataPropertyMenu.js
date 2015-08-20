// TODO why is this required
jQuery.sap.require("sap.ui.unified.MenuItem");
sap.ui.core.Control.extend("sparqlish.control.dataPropertyMenu", {
	metadata : {
		properties : {
			entityType : "string"
		},
		aggregations : {
			_dataProperty : {
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
			text : "[select data property]",
			tooltip : "Select a dataproperty to find"
		}).addStyleClass("menuLink") ;
		self.oDataPropertyMenu = new sap.ui.unified.Menu({
			items : {
				path : "entityType>/property",
				template : new sap.ui.unified.MenuItem({
					text : "{entityType>name}"
				})
			}
		});
		oLink.attachPress(function(oEvent) {
			var self = oEvent.getSource().getParent();
			var eDock = sap.ui.core.Popup.Dock;
			self.oDataPropertyMenu.open(false, oLink.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, oLink.getDomRef());
		});
		self.oDataPropertyMenu.attachItemSelect(function(oEvent) {
			if (self.getAggregation("_dataProperty").getText() != oEvent.getParameter("item").getText()) {
				self.fireChanged({
					concept : oEvent.getParameter("item").getText()
				});
			}
			self.getAggregation("_dataProperty").setText(oEvent.getParameter("item").getText());
			self.fireSelected({
				concept : oEvent.getParameter("item").getText()
			});
		});

		this.setAggregation("_dataProperty", oLink);
	},
	setEntityType : function(sEntityType,oMetaModel) {
		var currentEntityType = this.getProperty("entityType");
		if (currentEntityType != sEntityType) {
			this.setProperty("entityType", sEntityType);

			this.oMetaModelEntityType = oMetaModel.getODataEntityType(sEntityType);
			this.oEntityTypeModel = new sap.ui.model.json.JSONModel();
			this.oEntityTypeModel.setData(this.oMetaModelEntityType);
			this.oDataPropertyMenu.setModel(this.oEntityTypeModel, "entityType");
		}
	},
	renderer : function(oRm, oControl) {
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.write("class=\"conceptClause\">");
		oRm.renderControl(oControl.getAggregation("_dataProperty"));
		oRm.write("</div>");

	}
});