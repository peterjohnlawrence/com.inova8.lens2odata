jQuery.sap.require("sap.ui.commons.Button");
sap.ui.jsfragment("sparqlish.query.preview", {
	createContent : function(oController) {
		var myButton = new sap.ui.commons.Button({
			text : "Generate preview SPARQL",
			tooltip : "This will generate the preview query to return the first  records",
			press : function() {
				var iLimit = 5;
				var query = new Query(oController.queryAST.queries[oController.iCurrentQuery]);
				sSparqlEndpoint = "http://localhost:8890/corsparql?default-graph-uri=http%3A%2F%2Fnorthwind.com%2F&format=application%2Fsparql-results%2Bjson";
				var resultsModel = new sap.ui.model.json.JSONModel();
				resultsModel.attachRequestCompleted(function(oEvent) {
					var resultsData = resultsModel.getData();
					for (var i = 0; i < resultsData.head.vars.length; i++) {
						var keys = resultsData.head.vars[i].split("_");
						var root = oController.oViewModel.oData.root;
						var isLabel = false;
						for (var j = 1; j < keys.length; j++) {
							if (keys[j] === "label") {
								isLabel = true;
							} else {
								root = root[keys[j]];
							}
						}
						for (var k; k < iLimit; k++) {
							if (isLabel) {
								root["result_" + k + "_label_value"] = null;
								root["result_" + k + "_label_type"] = null;
								root["result_" + k + "_label_datatype"] = null;
							} else {
								root["result_" + k + "_value"] = null;
								root["result_" + k + "_type"] = null;
								root["result_" + k + "_datatype"] = null;
							}
						}
					}
					if (resultsData.results.bindings.length == 0) {
						alert("#No data:-( \n" + query.sparql());
					} else {
						for (var i = 0; i < resultsData.results.bindings.length; i++) {
							for ( var key in resultsData.results.bindings[i]) {
								var keys = key.split("_");
								var root = oController.oViewModel.oData.root;
								var isLabel = false;
								for (var j = 1; j < keys.length; j++) {
									if (keys[j] === "label") {
										isLabel = true;
									} else {
										root = root[keys[j]];
									}
								}
								if (isLabel) {
									root["result_" + i + "_label_value"] = resultsData.results.bindings[i][key].value;
									root["result_" + i + "_label_type"] = resultsData.results.bindings[i][key].type;
									root["result_" + i + "_label_datatype"] = resultsData.results.bindings[i][key].datatype;
								} else {
									root["result_" + i + "_value"] = resultsData.results.bindings[i][key].value;
									root["result_" + i + "_type"] = resultsData.results.bindings[i][key].type;
									root["result_" + i + "_datatype"] = resultsData.results.bindings[i][key].datatype;
								}
							}
						}
					}
					oController.oViewModel.updateBindings(true);
				});
				resultsModel.loadData(sSparqlEndpoint, "query=" + encodeURIComponent(query.sparql() + " LIMIT " + iLimit), true, "POST", false, false);
			}
		});
		return myButton;
	}
});