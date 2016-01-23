jQuery.sap.require("sap.ui.model.type.Date");
sap.ui.core.Control.extend("sparqlish.control.queryClausePreview", {
	metadata : {
		properties : {
			viewContext : {
				type : "object"
			},
			path : {
				type : "string"
			}
		},
		events : {},
		aggregations : {
			_preview : {
				type : "sap.ui.core.Control",
				multiple : false
			},
			_paginator : {
				type : "sap.ui.commons.Paginator",
				multiple : false
			}
		}
	},
	setViewContext : function(oViewContext) {
		this.setProperty("viewContext", oViewContext);

	},
	init : function() {
		var self = this;
		this.oDateTimeFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
			pattern : sap.ui.getCore().getModel("i18nModel").getProperty("Edm.DateTime")
		});
		this.oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
			pattern : sap.ui.getCore().getModel("i18nModel").getProperty("Edm.Date")
		});
	},
	renderer : function(oRm, oControl) {
		// Only required if we want the controls to be on the same line

		if (!jQuery.isEmptyObject(oControl.getViewContext())) {
			var oResultsModel = oControl.getModel("resultsModel");
			if (!jQuery.isEmptyObject(oResultsModel.getData())) {
				var sCurrentResultsContext = oControl.getViewContext()["resultsContext"];
				if (!jQuery.isEmptyObject(oResultsModel) && !jQuery.isEmptyObject(sCurrentResultsContext)) {

					// Get the context path calculated from the values in the paginators section of the results model
					// If this preview adds a new paginator then we are forced to revisit this after we have created it
					var oPaginators = oResultsModel.getProperty("/paginators");
					for ( var sPaginatorIndex in oPaginators) {
						sCurrentResultsContext = sCurrentResultsContext.replace("{=" + sPaginatorIndex + "}", oPaginators[sPaginatorIndex].currentPage - 1);
					}

					// Build paginator if required
					if (oControl.getViewContext()["type"] === "__metadata") {
						if (oControl.getViewContext()["multiplicity"] === "*") {
							if (!jQuery.isEmptyObject(oResultsModel)) {
								var sCurrentResultsLength = 1
								try {
									// TODO is this really the best we can do!
									sCurrentResultsLength = oControl.getModel("resultsModel").getProperty(sCurrentResultsContext.replace(/\/[={P0123456789}]+$/i, "")).length;
								} catch (e) {
								}
								var sPaginatorIndex = "P" + oControl.getViewContext()["index"];

								var oPaginator = sap.ui.getCore().byId(sPaginatorIndex);
								if (jQuery.isEmptyObject(oPaginator)) {
									oPaginator = new sap.ui.commons.Paginator(sPaginatorIndex);
									oPaginator.attachPage(function(oEvent) {
										oResultsModel.refresh(true);
										oEvent.getSource().getParent().getParent().rerender();
									});
									if (jQuery.isEmptyObject(oResultsModel.getProperty("/paginators"))) {
										oResultsModel.setProperty("/paginators", {});
									}
									if (jQuery.isEmptyObject(oResultsModel.getProperty("/paginators/" + sPaginatorIndex))) {
										oResultsModel.setProperty("/paginators/" + sPaginatorIndex, {
											"currentPage" : 1,
											"numberOfPages" : sCurrentResultsLength
										});
									}
								}
								oResultsModel.setProperty("/paginators/" + sPaginatorIndex + "/numberOfPages", sCurrentResultsLength);
								oPaginator.bindProperty("numberOfPages", {
									path : "resultsModel>/paginators/" + sPaginatorIndex + "/numberOfPages"
								});
								oPaginator.bindProperty("currentPage", {
									path : "resultsModel>/paginators/" + sPaginatorIndex + "/currentPage"
								});
								oControl.setAggregation("_paginator", oPaginator);
							}
						}
					}

					// Get the context path calculated from the values in the paginators section of the results model
					// Revisiting after having created the paginators
					var oPaginators = oResultsModel.getProperty("/paginators");
					for ( var sPaginatorIndex in oPaginators) {
						sCurrentResultsContext = sCurrentResultsContext.replace("{=" + sPaginatorIndex + "}", oPaginators[sPaginatorIndex].currentPage - 1);
					}
					// Build the display content
					switch (oControl.getViewContext()["type"]) {
					case "__metadata":
						oControl.oLink = new sap.m.Link().addStyleClass("resultValue");
						oControl.oLink.bindProperty("text", {
							parts : [ {
								path : "resultsModel>" + sCurrentResultsContext + "/__metadata/uri",
								type : new sap.ui.model.type.String()
							} ],
							formatter : function(uri) {
								return jQuery.isEmptyObject(uri) ? "" : uri.split("/").pop();
							}
						// path : "resultsModel>" + sCurrentResultsContext + "/__metadata/uri"
						}).bindProperty("href", {
							path : "resultsModel>" + sCurrentResultsContext + "/__metadata/uri"
						});
						oControl.setAggregation("_preview", oControl.oLink);
						break;
					case "Edm.DateTime":
						oControl.oTextView = new sap.m.Text().addStyleClass("resultValue");
						oControl.oTextView.bindProperty("text", {
							path : "resultsModel>" + sCurrentResultsContext,
							formatter : function(value) {
								if (value != null) {
									if (typeof (value) == 'string') {
										// TODO when the Odata atom/xml response or json does not annotate the type of the response
										value = oControl.oDateTimeFormat.parse(value);
									}
									return oControl.oDateTimeFormat.format(value);
								} else {
									return null;
								}
							}
						});
						oControl.setAggregation("_preview", oControl.oTextView);
						break;
					case "Edm.Stream":
						oControl.oTextView = new sap.m.Image();
						oControl.oTextView.bindProperty("src", {
							path : "resultsModel>" + sCurrentResultsContext
						});
						oControl.setAggregation("_preview", oControl.oTextView);
						break;
					default:
						oControl.oTextView = new sap.m.Text().addStyleClass("resultValue").setWrapping(false);
						oControl.oTextView.bindProperty("text", {
							path : "resultsModel>" + sCurrentResultsContext,
							type : new sap.ui.model.type.String()
						});
						oControl.setAggregation("_preview", oControl.oTextView);
					}
					if ((oControl.getViewContext()["multiplicity"] === "*") && (oControl.getAggregation("_paginator").getProperty("numberOfPages") > 1)) {
						oRm.write("<div ");
						oRm.writeControlData(oControl);
						oRm.writeClasses();
						oRm.write(">");
						oRm.renderControl(oControl.getAggregation("_paginator"));
						oRm.write("</div>");
					}
					oRm.addClass("resultValue");
					oRm.addClass("sapUiSizeCompact");
					oRm.write("<div ");
					oRm.writeControlData(oControl);
					oRm.writeClasses();
					oRm.write(">");
					oRm.renderControl(oControl.getAggregation("_preview"));
					oRm.write("</div>");
				}
			}
		}
	}
});