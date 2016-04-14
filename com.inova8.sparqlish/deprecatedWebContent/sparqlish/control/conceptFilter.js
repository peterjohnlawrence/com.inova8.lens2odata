jQuery.sap.require("sap.ui.commons.ListBox");
jQuery.sap.require("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.ux3.ToolPopup");
jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("control.extendFilter");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.conceptFilter", {
		metadata : {
			aggregations : {
				_conceptFilter : {
					type : "sap.m.Link",
					multiple : false
				}
			},
			events : {
				deleted : {
					enablePreventDefault : true
				}
			}
		},
		init : function() {
			var self = this;

			self.oConceptFilterLink = new sap.m.Link({
				text : '{queryModel>0/value}',
				tooltip : "Select a value",

			});
			self.oConceptFilterLink.addStyleClass("menuLink");

			self.oConceptFilterList = new sap.ui.commons.ListBox({
				/*
				 * Required for a data driven list path : "entityContainer>/entitySet", template : new sap.ui.core.ListItem({
				 * text : "{entityContainer>name}" })
				 */
				items : [
				// new sap.ui.core.ListItem({
				// text : '{i18nModel>conceptFilterDELETE}',
				// icon : sap.ui.core.IconPool.getIconURI("delete")
				// }),
				new sap.ui.core.ListItem({
					text : 'northwind:Order-0'
				}), new sap.ui.core.ListItem({
					text : 'northwind:Order-1'
				}), new sap.ui.core.ListItem({
					text : 'northwind:Order-2'
				}), new sap.ui.core.ListItem({
					text : 'northwind:Order-3'
				}) ]
			});
			self.oConceptFilterDelete = new control.extendFilter({
				icon : "delete"
			});
			self.oConceptFilterPopup = new sap.ui.ux3.ToolPopup();
			self.oConceptFilterPopup.addContent(self.oConceptFilterDelete);
			self.oConceptFilterPopup.addContent(self.oConceptFilterList);

			self.oConceptFilterPopup.setOpener(self.oConceptFilterLink);
			self.oConceptFilterPopup.setAutoClose(true);

			self.oConceptFilterLink.attachPress(function(oEvent) {
				// Save me as the origin of this later for use later when we want to update me.
				self.me = oEvent.getSource().getParent();
				if (self.oConceptFilterPopup.isOpen()) {
					self.oConceptFilterPopup.close();
				} else {
					self.oConceptFilterPopup.setOpener(oEvent.getSource());
					self.oConceptFilterPopup.open();
				}
			});
			self.oConceptFilterDelete.attachPress(function(oEvent) {
				self.oConceptFilterList.clearSelection();
				self.fireDeleted();
				// Now close popup since delete completed
				self.oConceptFilterPopup.close();
			});
			self.oConceptFilterList.attachSelect(function(oEvent) {
				var selectedItem = oEvent.getParameter("selectedItem").getText();
				self.me.getAggregation("_conceptFilter").setText(selectedItem);
				// Now close popup since select completed
				self.oConceptFilterPopup.close();
			});
			self.setAggregation("_conceptParameters", self.oConceptFilterLink)
		},
		renderer : function(oRm, oControl) {
			oRm.write("&nbsp;");
			oRm.renderControl(oControl.getAggregation("_conceptParameters"));
		}
	});
});