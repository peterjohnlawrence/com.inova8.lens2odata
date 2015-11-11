sap.ui.core.Control.extend("sparqlish.control.queryClausePreview", {
	metadata : {
		properties : {
			resultsPath : {
				type : "object"
			}
		},
		events : {},
		aggregations : {
			_preview : {
				type : "sap.ui.core.Control",
				multiple : false
			}
		}
	},
	setResultsPath : function(oResultsPath) {
		this.setProperty("resultsPath", oResultsPath);

	},
	init : function() {
		var self = this;
		// self.oTextView = new sap.ui.commons.TextView({
		// text : {
		// path : self.getProperty("resultsPath"),
		// type : new sap.ui.model.type.String()
		// }
		// });
		// self.setAggregation("_preview", self.oTextView);
	},
	renderer : function(oRm, oControl) {
		if (!jQuery.isEmptyObject(oControl.getResultsPath())) {
			// oControl.setBindingContext(new sap.ui.model.Context(oResultsModel, oControl.getResultsPath()["resultsPath"]),
			// "resultsModel")
			// oControl.oTextView = new sap.ui.commons.TextView()//
			// .setBindingContext(oControl.getBindingContext("resultsModel"))
			switch (oControl.getResultsPath()["type"]) {
			case "__metadata":
				oControl.oLink = new sap.ui.commons.Link();
				oControl.oLink.bindProperty("text", {
					path : "resultsModel>" + oControl.getResultsPath()["resultsPath"] + "/__metadata/uri"
				}).bindProperty("href", {
					path : "resultsModel>" + oControl.getResultsPath()["resultsPath"] + "/__metadata/uri"
				})
				oControl.setAggregation("_preview", oControl.oLink);
				break;
			case "Edm.DateTime":
				oControl.oTextView = new sap.ui.commons.TextView()
				oControl.oTextView.bindProperty("text", {
					path : "resultsModel>" + oControl.getResultsPath()["resultsPath"],
					formatter : function(value) {
						if (value != null) {
							return new Date(parseInt(value.substr(6)));
						} else {
							return null;
						}
					}
				});
				oControl.setAggregation("_preview", oControl.oTextView);
				break;
			default:
				oControl.oTextView = new sap.ui.commons.TextView()
				oControl.oTextView.bindProperty("text", {
					path : "resultsModel>" + oControl.getResultsPath()["resultsPath"],
					type : new sap.ui.model.type.String()
				});
				oControl.setAggregation("_preview", oControl.oTextView);
			}

			oRm.renderControl(oControl.getAggregation("_preview"));
		}
	}
});