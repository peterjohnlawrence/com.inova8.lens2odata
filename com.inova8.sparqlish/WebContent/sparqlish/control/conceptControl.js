sap.ui.core.Control.extend("sparqlish.control.conceptControl", {
	metadata : {
		properties : {
			concept : "object"
		},
		aggregations : {
			_concept : {
				type : "sap.ui.commons.Link",
				multiple : false,
				visibility : "hidden"
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
		this.setAggregation("_concept", new sap.ui.commons.Link({
			text : "[select concept]",
			tooltip : "Select a concept to find",
			press : function(oEvent) {
				var oSource = oEvent.getSource();
				var eDock = sap.ui.core.Popup.Dock;
				var oConceptMenu = new sap.ui.unified.Menu({
					items : [ new sap.ui.unified.MenuItem({
						text : 'Order'
					}), new sap.ui.unified.MenuItem({
						text : 'Customer'
					}), new sap.ui.unified.MenuItem({
						text : 'Territory'
					}), new sap.ui.unified.MenuItem({
						text : 'Product'
					}) ]
				});
				oConceptMenu.attachItemSelect(function(oEvent) {
					if(self.getAggregation("_concept").getText()!=oEvent.getParameter("item").getText()){
						self.fireChanged({concept:oEvent.getParameter("item").getText()});
					}
					self.getAggregation("_concept").setText(oEvent.getParameter("item").getText());
					self.getProperty("concept").concept = oEvent.getParameter("item").getText();
					self.fireSelected({concept:oEvent.getParameter("item").getText()});
				}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
			}
		}));
	},
	setConcept : function(oConcept) {
		this.setProperty("concept", oConcept, true);
		if (oConcept.concept == null) {
			this.getAggregation("_concept").setText("[select concept]");
		} else {
			this.getAggregation("_concept").setText(oConcept.concept);
		}
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_concept"));
	}
});