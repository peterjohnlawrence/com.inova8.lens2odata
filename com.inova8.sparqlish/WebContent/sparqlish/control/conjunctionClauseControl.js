// TODO why is this required
jQuery.sap.require("sap.ui.unified.MenuItem");
jQuery.sap.require("sparqlish.control.addClause");
sap.ui.core.Control.extend("sparqlish.control.conjunctionClauseControl", {
	metadata : {
		properties : {},
		aggregations : {
			_conjunction : {
				type : "sap.ui.commons.Link",
				multiple : false
			},
			_propertyClause : {
				type : "sparqlish.control.propertyClauseControl",
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
		self.setAggregation("_conjunction", new sap.ui.commons.Link({
			text : "{queryModel>conjunction}",
			tooltip : "Select a conjunction",
			press : function(oEvent) {
				// var oSource = oEvent.getSource();
				// TODO Need to explicitly find 'this' instead of using self in the case of a aggregation with multiple=true
				var me = oEvent.getSource().getParent();
				var eDock = sap.ui.core.Popup.Dock;
				self.oConjunctionMenuItemDelete = new sap.ui.unified.MenuItem({
					text : '{i18nModel>conjunctionClauseDelete}',
					icon : sap.ui.core.IconPool.getIconURI("delete")
				});
				self.oConjunctionMenuItemDelete.attachSelect(function(oEvent) {
					// TODO need to destroy data not the control
					me.destroyAggregation("_conjunction");
					me.destroyAggregation("_propertyClause");
					me.fireDeleted();
				});
				var oConjunctionMenu = new sap.ui.unified.Menu({
					items : [ self.oConjunctionMenuItemDelete, new sap.ui.unified.MenuItem({
						text : '{i18nModel>conjunctionClauseAnd}'
					}), new sap.ui.unified.MenuItem({
						text : '{i18nModel>conjunctionClauseOr}'
					}) ]
				});
				oConjunctionMenu.attachItemSelect(function(oEvent) {
					var selectedItem = oEvent.getParameter("item").getText();
					me.getAggregation("_conjunction").setText(selectedItem);
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}).addStyleClass("menuLink"));
		self.setAggregation("_propertyClause", new sparqlish.control.propertyClauseControl({}).bindElement("queryModel>clause"));
	},
	renderer : function(oRm, oControl) {

		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl.getAggregation("_conjunction"));
		oRm.write("&nbsp;");
		oRm.renderControl(oControl.getAggregation("_propertyClause"));
		oRm.write("</div>");
	}
});