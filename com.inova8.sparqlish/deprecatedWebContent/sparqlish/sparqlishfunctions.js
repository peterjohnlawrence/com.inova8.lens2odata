ccConceptValuesLink = function(nLink, oConceptClause) {
	var oConceptValuesLink = new sap.ui.commons.Link({
		text : "[enter value(s)]",
		press : function(oEvent) {
			var eDock = sap.ui.core.Popup.Dock;
			var oConceptValuesMenu = new sap.ui.unified.Menu({
				items : [ new sap.ui.unified.MenuItem({
					text : 'northwind:Order-0' + nLink
				}), new sap.ui.unified.MenuItem({
					text : 'northwind:Order-1' + nLink
				}), new sap.ui.unified.MenuItem({
					text : 'northwind:Order-2' + nLink
				}), new sap.ui.unified.MenuItem({
					text : 'northwind:Order-3' + nLink
				}) ]
			});
			oConceptValuesMenu.attachItemSelect(function(oEvent) {
				oConceptValuesLink.setText(oEvent.getParameter("item").getText());
				var sHtmlText = oConceptClause.getHtmlText() + "<strong> <embed data-index='1'></strong>";
				oConceptClause.setHtmlText(sHtmlText);
				//workaround just for testing
				sap.ui.getCore().byId("myTable").invalidate();
			}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
		}
	})
	return oConceptValuesLink;
};

ccConceptClause = function() {
	var oConceptListLink = new sap.ui.commons.Link({
		text : "[select concept]",
		tooltip : "Select a concept to find",
		press : function(oEvent) {
			var oSource = oEvent.getSource();
			var eDock = sap.ui.core.Popup.Dock;
			var oConceptListMenu = new sap.ui.unified.Menu({
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
			oConceptListMenu.attachItemSelect(function(oEvent) {
				oConceptListLink.setText(oEvent.getParameter("item").getText());
				// now add the ability to add in an 'in' clause'
				var sHtmlText = "<strong>Find <embed data-index='0'> <embed data-index='1'></strong>";
				oConceptClause.setHtmlText(sHtmlText);
				//reset filters
				oConceptClause.nFilters=0;
				//remove controls
				for (var iControl=oConceptClause.getControls().length;  iControl>1; iControl--){
					oConceptClause.removeControl(iControl);
				}
				//workaround just for testing
				sap.ui.getCore().byId("myTable").invalidate();
			}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
		}
	});
	var oConceptClause = new sap.ui.commons.FormattedTextView({
		tooltip : "Concept clause",
		editable : false,
		htmlText :"<strong>Find <embed data-index='0'></strong>",
		controls : [ oConceptListLink, new sap.ui.commons.Link( {
			text : "[+]",
			tooltip : "Add a value for the concept",
			press : function() {
				var sHtmlText =  "<strong>Find <embed data-index='0'> in <embed data-index='2'>";
				oConceptClause.nFilters = oConceptClause.nFilters + 1;
				for (var nLink = 1; nLink < oConceptClause.nFilters; nLink++) {
					sHtmlText = sHtmlText + ", <embed data-index='" + (nLink + 2) + "'>";
				}
				sHtmlText = sHtmlText + "</strong>";
				oConceptClause.addControl(ccConceptValuesLink(oConceptClause.nFilters, oConceptClause));
				oConceptClause.setHtmlText(sHtmlText);
				//workaround just for testing
				sap.ui.getCore().byId("myTable").invalidate();
			}
		}) ]
	});
	oConceptClause.nFilters=0;
	return oConceptClause;
};
ccDataPropertyConjunctionLink = function(nLink, oDataPropertyClause) {
	var oDataPropertyConjunctionLink = new sap.ui.commons.Link({
		text : "[and/or]",
		press : function() {
			var eDock = sap.ui.core.Popup.Dock;
			var oDataPropertyValuesMenu = new sap.ui.unified.Menu({
				items : [ new sap.ui.unified.MenuItem({
					text : 'and'
				}), new sap.ui.unified.MenuItem({
					text : 'or'
				}) ]
			});
			oDataPropertyValuesMenu.attachItemSelect(function(oEvent) {
				oDataPropertyConjunctionLink.setText(oEvent.getParameter("item").getText());
				var sHtmlText = oDataPropertyClause.getHtmlText() + "<strong> <embed data-index='" + (oDataPropertyClause.nFilters * 3 - 1) + "'></strong>";
				oDataPropertyClause.setHtmlText(sHtmlText);
				//workaround just for testing
				sap.ui.getCore().byId("myTable").invalidate();
			}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
		}
	});
	return oDataPropertyConjunctionLink;
};
ccDataPropertyConditionLink = function(nLink, oDataPropertyClause) {
	var oDataPropertyConditionLink = new sap.ui.commons.Link({
		text : "[condition]",
		press : function() {
			var eDock = sap.ui.core.Popup.Dock;
			var oDataPropertyValuesMenu = new sap.ui.unified.Menu({
				items : [ new sap.ui.unified.MenuItem({
					text : 'containing'
				}), new sap.ui.unified.MenuItem({
					text : 'less than'
				}), new sap.ui.unified.MenuItem({
					text : 'greater than'
				}), new sap.ui.unified.MenuItem({
					text : 'equals'
				}) ]
			});
			oDataPropertyValuesMenu.attachItemSelect(function(oEvent) {
				oDataPropertyConditionLink.setText(oEvent.getParameter("item").getText());
				var sHtmlText = oDataPropertyClause.getHtmlText() + "<strong> <embed data-index='" + (oDataPropertyClause.nFilters * 3) + "'></strong>";
				oDataPropertyClause.setHtmlText(sHtmlText);
				//workaround just for testing
				sap.ui.getCore().byId("myTable").invalidate();
			}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
		}
	});
	return oDataPropertyConditionLink;
};
ccDataPropertyValueLink = function(nLink, oDataPropertyClause) {
	var oDataPropertyValueLink = new sap.ui.commons.Link({
		text : "[enter value]",
		press : function() {
			var eDock = sap.ui.core.Popup.Dock;
			var oDataPropertyValuesMenu = new sap.ui.unified.Menu({
				items : [ new sap.ui.unified.MenuItem({
					text : 'Fr'
				}), new sap.ui.unified.MenuItem({
					text : 'Ge'
				}), new sap.ui.unified.MenuItem({
					text : '1997'
				}), new sap.ui.unified.MenuItem({
					text : '2001'
				}) ]
			});
			oDataPropertyValuesMenu.attachItemSelect(function(oEvent) {
				oDataPropertyValueLink.setText(oEvent.getParameter("item").getText());
				var sHtmlText = oDataPropertyClause.getHtmlText() + "<strong> <embed data-index='1'></strong>";
				oDataPropertyClause.setHtmlText(sHtmlText);
				//workaround just for testing
				sap.ui.getCore().byId("myTable").invalidate();
			}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
		}
	});
	return oDataPropertyValueLink;
};

ccDataPropertyClause = function() {
	var oDataPropertyListLink = new sap.ui.commons.Link({
		text : "[select DataProperty]",
		tooltip : "Select a property to retrieve",
		press : function(oEvent) {
			var oSource = oEvent.getSource();
			var eDock = sap.ui.core.Popup.Dock;
			var oDataPropertyListMenu = new sap.ui.unified.Menu({
				items : [ new sap.ui.unified.MenuItem({
					text : 'shipCountry'
				}), new sap.ui.unified.MenuItem({
					text : 'shipDate'
				}), new sap.ui.unified.MenuItem({
					text : 'companyName'
				}), new sap.ui.unified.MenuItem({
					text : 'contactName'
				}) ]
			});
			oDataPropertyListMenu.attachItemSelect(function(oEvent) {
				oDataPropertyListLink.setText(oEvent.getParameter("item").getText());
				// now add the ability to add in an 'in' clause'
				var sHtmlText = "<strong>with <embed data-index='0'> <embed data-index='1'></strong>";
				oDataPropertyClause.setHtmlText(sHtmlText);
				//reset filters
				oDataPropertyClause.nFilters=0;
				//remove controls
				for (var iControl=oDataPropertyClause.getControls().length;  iControl>1; iControl--){
					oDataPropertyClause.removeControl(iControl);
				}
				//workaround just for testing
				sap.ui.getCore().byId("myTable").invalidate();
			}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
		}
	});
	var oDataPropertyClause = new sap.ui.commons.FormattedTextView({
		tooltip : "DataProperty clause",
		editable : false,
		htmlText : "<strong>with <embed data-index='0'> </strong>",
		controls : [
				oDataPropertyListLink,
				new sap.ui.commons.Link({
					text : "[+]",
					tooltip : "Add filter on property value",
					press : function() {
						var sHtmlText = "<strong>with <embed data-index='0'> <embed data-index='2'>";
						oDataPropertyClause.nFilters = oDataPropertyClause.nFilters + 1;
						if (oDataPropertyClause.nFilters > 1) {
							sHtmlText = sHtmlText + " <embed data-index='3'> ";
						}
						for (var nLink = 2; nLink < oDataPropertyClause.nFilters; nLink++) {
							sHtmlText = sHtmlText + " <embed data-index='" + (3 * nLink - 2) + "'> <embed data-index='" + (3 * nLink - 1) + "'> <embed data-index='"
									+ (3 * nLink) + "'>";
						}
						if (oDataPropertyClause.nFilters > 1) {
							sHtmlText = sHtmlText + " <embed data-index='" + (3 * oDataPropertyClause.nFilters - 2) + "'> ";
						}
						sHtmlText = sHtmlText + "</strong>";
						if (oDataPropertyClause.nFilters > 1) {
							oDataPropertyClause.addControl(ccDataPropertyConjunctionLink(oDataPropertyClause.nFilters, oDataPropertyClause));
						}
						oDataPropertyClause.addControl(ccDataPropertyConditionLink(oDataPropertyClause.nFilters, oDataPropertyClause));
						oDataPropertyClause.addControl(ccDataPropertyValueLink(oDataPropertyClause.nFilters, oDataPropertyClause));
						oDataPropertyClause.setHtmlText(sHtmlText);
						//workaround just for testing
						sap.ui.getCore().byId("myTable").invalidate();
					}
				}) ]
	});
	oDataPropertyClause.nFilters=0;
	return oDataPropertyClause;
};

ccObjectPropertyValuesLink = function(nLink, oObjectPropertyClause) {
	var oObjectPropertyValuesLink = new sap.ui.commons.Link({
		text : "[enter value(s)]",
		press : function(oEvent) {
			var eDock = sap.ui.core.Popup.Dock;
			var oObjectValuesMenu = new sap.ui.unified.Menu({
				items : [ new sap.ui.unified.MenuItem({
					text : 'northwind:Customer-0' + nLink
				}), new sap.ui.unified.MenuItem({
					text : 'northwind:Customer-1' + nLink
				}), new sap.ui.unified.MenuItem({
					text : 'northwind:Customer-2' + nLink
				}), new sap.ui.unified.MenuItem({
					text : 'northwind:Customer-3' + nLink
				}) ]
			});
			oObjectValuesMenu.attachItemSelect(function(oEvent) {
				oObjectPropertyValuesLink.setText(oEvent.getParameter("item").getText());
				var sHtmlText = oObjectPropertyClause.getHtmlText() + "<strong> <embed data-index='1'></strong>";
				oObjectPropertyClause.setHtmlText(sHtmlText);
				//workaround just for testing
				sap.ui.getCore().byId("myTable").invalidate();
			}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
		}
	})
	return oObjectPropertyValuesLink;
};

ccObjectPropertyClause = function() {
	var oObjectPropertyListLink = new sap.ui.commons.Link({
		text : "[select ObjectProperty]",
		tooltip : "Select a ObjectProperty to find",
		press : function(oEvent) {
			var oSource = oEvent.getSource();
			var eDock = sap.ui.core.Popup.Dock;
			var oObjectPropertyListMenu = new sap.ui.unified.Menu({
				items : [ new sap.ui.unified.MenuItem({
					text : 'has order'
				}), new sap.ui.unified.MenuItem({
					text : 'has customer'
				}), new sap.ui.unified.MenuItem({
					text : 'has territory'
				}), new sap.ui.unified.MenuItem({
					text : 'has product'
				}) ]
			});
			oObjectPropertyListMenu.attachItemSelect(function(oEvent) {
				oObjectPropertyListLink.setText(oEvent.getParameter("item").getText());
				var sHtmlText = "<strong>with <embed data-index='0'> <embed data-index='1'></strong>";
				oObjectPropertyClause.setHtmlText(sHtmlText);
				//reset filters
				oObjectPropertyClause.nFilters=0;
				//remove controls
				for (var iControl=oObjectPropertyClause.getControls().length;  iControl>1; iControl--){
					oObjectPropertyClause.removeControl(iControl);
				}
				//workaround just for testing
				sap.ui.getCore().byId("myTable").invalidate();
			}).open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
		}
	});
	var oObjectPropertyClause = new sap.ui.commons.FormattedTextView({
		tooltip : "ObjectProperty clause",
		editable : false,
		htmlText : "<strong>with <embed data-index='0'></strong>",
		controls : [ oObjectPropertyListLink, new sap.ui.commons.Link({
			text : "[+]",
			tooltip : "Add a value for the ObjectProperty",
			press : function() {
				var sHtmlText = "<strong>with <embed data-index='0'> in <embed data-index='2'>";
				oObjectPropertyClause.nFilters = oObjectPropertyClause.nFilters + 1;
				for (var nLink = 1; nLink < oObjectPropertyClause.nFilters; nLink++) {
					sHtmlText = sHtmlText + ", <embed data-index='" + (nLink + 2) + "'>";
				}
				sHtmlText = sHtmlText + "</strong>";
				oObjectPropertyClause.addControl(ccObjectPropertyValuesLink(oObjectPropertyClause.nFilters, oObjectPropertyClause));
				oObjectPropertyClause.setHtmlText(sHtmlText);
				//workaround just for testing
				sap.ui.getCore().byId("myTable").invalidate();
			}
		}) ]
	});
	oObjectPropertyClause.nFilters=0;
	return oObjectPropertyClause;
};