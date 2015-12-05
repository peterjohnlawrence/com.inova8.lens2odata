jQuery.sap.require("sap.ui.commons.Button");
sap.ui.jsfragment("sparqlish.query.odata", {
	createContent : function(oController) {
		var myButton = new sap.ui.commons.Button({
			text : "Generate query OData",
			tooltip : "This will generate the query to return full results",
			press : function() {
				var query = new Query(oController.queryAST.queries[oController.iCurrentQuery]);
				alert(oController.sUrl + query.odataURI());
			}
		});
		return myButton;
	}
});