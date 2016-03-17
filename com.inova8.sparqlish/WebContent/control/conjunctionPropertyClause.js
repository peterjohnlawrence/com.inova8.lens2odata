jQuery.sap.require("sap.ui.unified.MenuItem");
// jQuery.sap.require("control.addClause");
jQuery.sap.require("control.propertyClause");

sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.conjunctionPropertyClause", {
		metadata : {
			properties : {},
			aggregations : {
				_conjunction : {
					type : "sap.m.Link",
					multiple : false
				},
				_propertyClause : {
					type : "control.propertyClause",
					multiple : false
				}
			},
			events : {
				conjunctionPropertyClauseChanged : {
					enablePreventDefault : true
				}
			}
		},
		getConjunctionClausesContext : function() {
			var re = /\/[0123456789]*\/$/;
			var sPath = this.getBindingContext("queryModel").getPath().replace(re, "");
			return this.getModel("queryModel").getProperty(sPath);
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
			// var oClausesContext = this.getParent().getCurrentQueryContext();
			// var oClausesContext = this.getCurrentQueryContext();
			var oClausesContext = this.getConjunctionClausesContext();
			if (!jQuery.isEmptyObject(oClausesContext)) {
				// Find which one we are deleting
				var index = oClausesContext.indexOf(this.getCurrentQueryContext());
				oClausesContext.splice(index, 1);
				// Now delete any conjunctionClauses if empty
				if (oClausesContext.length == 0) {
					// Now remove conjunctionClauses
					delete this.getConjunctionClausesContext();
				}
			} else {
				// Nothing to delete ... but some kind of problem if we got here
			}
			this.fireConjunctionPropertyClauseChanged();
		},
		init : function() {
			var self = this;
			self.setAggregation("_conjunction", new sap.m.Link({
				text : "{queryModel>conjunction}",
				tooltip : "Select a conjunction",
				press : function(oEvent) {
					// TODO Need to explicitly find 'this' instead of using self in the case of a aggregation with multiple=true
					var me = oEvent.getSource().getParent();
					var eDock = sap.ui.core.Popup.Dock;
					self.oConjunctionMenuItemDelete = new sap.ui.unified.MenuItem({
						text : '{i18nModel>conjunctionPropertyClause.delete}',
						icon : sap.ui.core.IconPool.getIconURI("delete")
					});
					self.oConjunctionMenuItemDelete.attachSelect(function(oEvent) {
						self.deleteConjunctionClause();
					});
					var oConjunctionMenu = new sap.ui.unified.Menu({
						items : [ new sap.ui.unified.MenuItem({
							text : '{i18nModel>conjunctionPropertyClause.and}'
						}), 
//						new sap.ui.unified.MenuItem({
//							text : '{i18nModel>conjunctionPropertyClause.or}'
//						}), 
						self.oConjunctionMenuItemDelete ]
					});
					oConjunctionMenu.attachItemSelect(function(oEvent) {
						var selectedItem = oEvent.getParameter("item").getText();
						if (selectedItem == "DELETE ") {
							// TODO do nothing
							// self.deleteConjunctionClause();
						} else {
							me.getAggregation("_conjunction").setText(selectedItem);
						}
					}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
				}
			}).addStyleClass("conjunctionMenuLink"));
			self.setAggregation("_propertyClause", new control.propertyClause({}).bindElement("queryModel>clause").setConjunction(true)
					.attachPropertyClauseChanged(function(oEvent) {
						self.fireConjunctionPropertyClauseChanged();
					})
			// .attachDeleted(function(oEvent) {
			// self.deleteConjunctionClause();
			// })
			);
		},
		renderer : function(oRm, oControl) {

			oRm.addClass("propertyClauseContainer");
			oRm.write("<div ");
			oRm.writeClasses();
			oRm.write(">");

			oRm.addClass("propertyConjunctionContainer");
			// oRm.addClass("propertyClause");
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");

			oRm.renderControl(oControl.getAggregation("_conjunction"));
			oRm.write("&nbsp;");
			oRm.renderControl(oControl.getAggregation("_propertyClause").setConjunction(true));

		}
	});
});