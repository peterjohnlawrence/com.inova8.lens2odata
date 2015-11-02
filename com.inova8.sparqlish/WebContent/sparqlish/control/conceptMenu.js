jQuery.sap.require("sap.ui.commons.ListBox");
jQuery.sap.require("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.ux3.ToolPopup");
sap.ui.core.Control.extend("sparqlish.control.conceptMenu", {
	metadata : {
		aggregations : {
			_concept : {
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
		self.oConceptLink = new sap.ui.commons.Link({
			text : "{queryModel>concept}",
			tooltip : "Select a concept to find"
		});
		self.oConceptLink.addStyleClass("menuLink");

		self.oConceptList = new sap.ui.commons.ListBox({
			items : {
				path : "entityContainer>/entitySet",
				template : new sap.ui.core.ListItem({
					text : "{entityContainer>name}"
				})
			}
		});

		self.oConceptPopup = new sap.ui.ux3.ToolPopup();
		self.oConceptPopup.addContent(self.oConceptList);
		self.oConceptPopup.setOpener(self.oConceptLink);
		self.oConceptPopup.setAutoClose(true);

		self.oConceptLink.attachPress(function(oEvent) {
			if (self.oConceptPopup.isOpen()) {
				self.oConceptPopup.close();
			} else {
				self.oConceptPopup.open();
			}
		});
		self.conceptSelect = function(oEvent) {
			if (self.getAggregation("_concept").getText() != oEvent.getParameter("selectedItem").getText()) {
				self.fireChanged({
					concept : oEvent.getParameter("selectedItem").getText()
				});
			}
			self.getAggregation("_concept").setText(oEvent.getParameter("selectedItem").getText());
			self.fireSelected({
				concept : oEvent.getParameter("selectedItem").getText()
			});
			//Now close popup since select completed
			self.oConceptPopup.close();
		};
		self.oConceptList.attachSelect(self.conceptSelect);
		self.setAggregation("_concept", self.oConceptLink);
	},
	renderer : function(oRm, oControl) {
		// TODO really this should be done on a binding change event but where is it?
		if (oControl.getAggregation("_concept").getText() == "") {
			// not yet defined so lets bind to the first concept in collection
			oControl.getAggregation("_concept").setText(oControl.getModel("entityContainer").getProperty("/entitySet/0/name"));
		}
		oRm.renderControl(oControl.getAggregation("_concept"));
	}
});