jQuery.sap.require("sap.ui.unified.Menu");
jQuery.sap.require("sap.ui.unified.MenuItem");
sap.ui.jsfragment("sparqlish.menu.facetQuery", {
	createContent : function(oController) {
		// Create the menu
		var oFacetQueryMenu = new sap.ui.unified.Menu("facetQueryMenu", {
			tooltip : "Menu containing value facet browsing options"
		});
		// Create the items and add them to the menu
		var oFacetQueryMenuItem1 = new sap.ui.unified.MenuItem("facetQueryMenuItem1", {
			text : "Facet for Query",
			select : function(oEvent) {
				alert(oController.queries.oQueries[oController.iCurrentQuery].oClauseReferences[oEvent.getSource().getBindingContext().getProperty("index")].facetQuery());
			}
		});
		oFacetQueryMenu.addItem(oFacetQueryMenuItem1);
		var oFacetQueryMenuItem2 = new sap.ui.unified.MenuItem("facetQueryMenuItem2", {
			text : "Facet for Variable",
			select : function(oEvent) {
				alert(oController.queries.oQueries[oController.iCurrentQuery].oClauseReferences[oEvent.getSource().getBindingContext().getProperty("index")].facetQuery());
			}
		});
		oFacetQueryMenu.addItem(oFacetQueryMenuItem2);
		return oFacetQueryMenu;
	}
});
;