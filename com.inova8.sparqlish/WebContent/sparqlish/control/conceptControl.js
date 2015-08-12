//TODO why is this required
jQuery.sap.require("sap.ui.unified.MenuItem");
sap.ui.core.Control.extend("sparqlish.control.conceptControl", {
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
		var oLink = new sap.ui.commons.Link({
			text : "{queryModel>concept}",
			tooltip : "Select a concept to find"
		});

		var oConceptMenu = new sap.ui.unified.Menu({
			items : {
				path : "entityContainer>/entitySet",
				template : new sap.ui.unified.MenuItem({
					text : "{entityContainer>name}"
				})
			}
		});

		oLink.attachPress(function(oEvent) {
			var oSource = oEvent.getSource();
			var eDock = sap.ui.core.Popup.Dock;
			oConceptMenu.open(false, oLink.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, oLink.getDomRef());
		});
		oConceptMenu.attachItemSelect(function(oEvent) {
			if (self.getAggregation("_concept").getText() != oEvent.getParameter("item").getText()) {
				self.fireChanged({
					concept : oEvent.getParameter("item").getText()
				});
			}
			self.getAggregation("_concept").setText(oEvent.getParameter("item").getText());
			self.fireSelected({
				concept : oEvent.getParameter("item").getText()
			});
		});

		this.setAggregation("_concept", oLink);

	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_concept"));
	}
});