previewResults = function() {
	var query = new Query(oQueryModel.getData());
	var odataURL = sUrl + query.odataURI() + "&$format=json";
	odataResults = new sap.ui.model.json.JSONModel({});
	odataResults.loadData(odataURL);
	odataResults.attachRequestCompleted(function(oEvent) {
		if (oEvent.getParameter("success")) {
			try {
				var nResults = 0;
				var sBindPath = null;
				if (jQuery.isEmptyObject(odataResults.getData().d.results)) {
					if (odataResults.getData().d.length > 0) {
						sBindPath = "/d/0";
					} else {
						throw "No results returned";
					}
				} else {
					nResults = odataResults.getData().d.results.length;
					sBindPath = "/d/results/0";
				}
				oTable.setModel(odataResults, "resultsModel");

			} catch (err) {

			}
		} else {
			// Failed request

		}
	})
}