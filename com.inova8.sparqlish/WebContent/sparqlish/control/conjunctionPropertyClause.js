jQuery.sap.require("sap.ui.unified.MenuItem");
jQuery.sap.require("sparqlish.control.addClause");
jQuery.sap.require("sparqlish.control.propertyClause");
sap.ui.core.Control.extend("sparqlish.control.conjunctionPropertyClause", {
	metadata : {
		properties : {},
		aggregations : {
			_conjunction : {
				type : "sap.ui.commons.Link",
				multiple : false
			},
			_propertyClause : {
				type : "sparqlish.control.propertyClause",
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
			changedClause : {
				enablePreventDefault : true
			}
		}
	},
	getCurrentQueryContext : function() {
		return this.getModel("queryModel").getProperty("", this.getBindingContext("queryModel"));
	},
	getDataProperty : function() {
		return this.getAggregation("_propertyClause").getDataProperty();
	},
	getObjectProperty : function() {
		return this.getAggregation("_propertyClause").getObjectProperty();
	},
	getDomainEntityTypeQName : function() {
		return this.getAggregation("_propertyClause").getDomainEntityTypeQName();
	},
	getDomainEntityTypeContext : function() {
		return this.getAggregation("_propertyClause").getDomainEntityTypeContext();
	},
	getRangeEntityTypeQName : function() {
		return this.getAggregation("_propertyClause").getRangeEntityTypeQName();
	},
	getRangeEntityTypeContext : function() {
		return this.getAggregation("_propertyClause").getRangeEntityTypeContext();
	},
	deleteConjunctionClause : function() {
		var oClausesContext = this.getParent().getCurrentQueryContext();
		if (!jQuery.isEmptyObject(oClausesContext.conjunctionClauses)) {
			// Find which one we are deleting
			var index = oClausesContext.conjunctionClauses.indexOf(this.getCurrentQueryContext());
			oClausesContext.conjunctionClauses.splice(index, 1);
			// Now delete any conjunctionClauses if empty
			if (oClausesContext.conjunctionClauses.length == 0) {
				// Now remove conjunctionClauses
				delete oClausesContext.conjunctionClauses;
			}
		} else {
			// Nothing to delete ... but some kind of problem if we got here
		}
		this.getParent().rerender();
		// Goodbye
		this.destroy();
	},
	init : function() {
		var self = this;
		self.setAggregation("_conjunction", new sap.ui.commons.Link({
			text : "{queryModel>conjunction}",
			tooltip : "Select a conjunction",
			press : function(oEvent) {
				// TODO Need to explicitly find 'this' instead of using self in the case of a aggregation with multiple=true
				var me = oEvent.getSource().getParent();
				var eDock = sap.ui.core.Popup.Dock;
				self.oConjunctionMenuItemDelete = new sap.ui.unified.MenuItem({
					text : '{i18nModel>conjunctionClauseDelete}',
					icon : sap.ui.core.IconPool.getIconURI("delete")
				});
				self.oConjunctionMenuItemDelete.attachSelect(function(oEvent) {
					self.deleteConjunctionClause();
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
					if (selectedItem == "DELETE ") {
						self.deleteConjunctionClause();
					} else {
						me.getAggregation("_conjunction").setText(selectedItem);
					}
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}).addStyleClass("menuLink"));
		self.setAggregation("_propertyClause", new sparqlish.control.propertyClause({}).bindElement("queryModel>clause").attachChangedClause(function(oEvent) {
			oEvent.getSource().getParent().fireChangedClause();
		}).attachDeleted(function(oEvent) {
			self.deleteConjunctionClause();
		}));
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