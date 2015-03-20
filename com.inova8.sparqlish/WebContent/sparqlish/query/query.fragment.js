jQuery.sap.require("sap.ui.commons.Button");
sap.ui.jsfragment("sparqlish.query.query", {
	createContent : function(oController) {
		var myButton = new sap.ui.commons.Button({
			text : "Generate query SPARQL",
			tooltip : "This will generate the query to return full results",
			press : function() {
				var query = new Query(oController.queryAST.queries[oController.iCurrentQuery]);
				alert(query.sparql());
			}
		});
		return myButton;
	}
});