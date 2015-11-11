jQuery.sap.require("sap.ui.commons.Callout");
jQuery.sap.require("rdfquery");
jQuery.sap.require("lens.QueryWriter");
sap.ui.controller("lens.ResultsView", {
	resultsModel : null,
	resultsTable : null,
	queryData : null,
	modelData : null,
	sparql :null,
	queryView : function() {
		try {
			oFormViewFragment.close();
		} catch (error) {
			// probably never created so cannot close it
		}

		var router = sap.ui.core.UIComponent.getRouterFor(this);
		router.navTo("search", {
			queryName : this.queryName
		}, false);
	},
	onExit : function() {
	},

	onInit : function() {
		// resultsModel = new sap.ui.model.json.JSONModel();
		resultsTable = sap.ui.getCore().byId(this.createId("ResultsTable"));
		queryData = sap.ui.getCore().getModel("queryData");
		modelData = sap.ui.getCore().getModel("modelData");
		resultsModel = sap.ui.getCore().getModel("resultsModel");

		resultsTable.setNavigationMode(sap.ui.table.NavigationMode.Paginator);
		resultsTable.setModel(resultsModel, "resultsModel");

		this.oRouter = sap.ui.core.routing.Router.getRouter("router");
		sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(this.onRouteMatched, this);

	},

	onRouteMatched : function(oEvent) {
		if ("results" !== oEvent.getParameter("name")) {
			return;
		}
		{
			var queryName = oEvent.getParameter("arguments").queryName;
			this.queryName = queryName;
			var query = lens.FindQuery(queryData.getData(), queryName);
			this.sparql = lens.QueryWriter(query, modelData.getData());
			var sparql = this.sparql;
			console.debug("SPARQL query=", this.sparql.sparql);
			try {

				sap.ui.getCore().getModel("resultsModel").attachRequestCompleted(function() {
					onResultsAvailable( sparql,resultsModel);
				}).attachRequestFailed(function() {
					lens.ErrorMessage("Query failed: check URL or availability of SPARQLendpoint");
				});	
				resultsTable.unbindColumns();
				resultsTable.unbindRows();
				resultsModel.loadData(resultsModel.sparqlEndpoint, "query=" + encodeURIComponent(this.sparql.sparql), true, "POST", false, false, resultsModel.headers);

				onResultsAvailable = function( sparql,resultsModel) {
					// create popup, making sure it has the sparql and resultsmodel available
					this.resultsModel = resultsModel;
					this.sparql =sparql;
					// If fragment already exists then destroy and rebuild as we need to align form layout with data
					oFormViewFragment = sap.ui.getCore().byId("FormView");
					if (oFormViewFragment == undefined) {
						oFormViewFragment = sap.ui.jsfragment("lens.FormView", this);
					} else {
						oFormViewFragment.destroy();
						oFormViewFragment = sap.ui.jsfragment("lens.FormView", this);
					}

					resultsTable.bindColumns("resultsModel>/head/vars", function(sId, oContext) {
						var sColumnId = oContext.getObject();
						if (sparql.variableMapping != undefined) {
							if (sparql.variableMapping[sColumnId] != undefined) {
								if (sparql.variableMapping[sColumnId].label != undefined)
									columnName = sparql.variableMapping[sColumnId].label;
								hidden = sparql.variableMapping[sColumnId].hidden;
								URLDisplayField = sparql.variableMapping[sColumnId].URLDisplayField;
								format = sparql.variableMapping[sColumnId].format;
							}
						}
						var sColumn = new sap.ui.table.Column({
							id : sColumnId,
							label : sColumnId,
							sortProperty : "resultsModel>" + sColumnId + "/value",
							autoResizable : true,
							filterProperty : "resultsModel>" + sColumnId + "/value",
							filterType : sap.ui.model.type.HTMLtext // function(convert ){alert(convert); return convert;}
						});
						if (hidden)
							sColumn.setVisible(false);
						var sTemplate = new sap.ui.commons.FormattedTextView().bindProperty("tooltip", "resultsModel>" + sColumnId + "/value").bindProperty("htmlText", {
							parts : [ {
								path : "resultsModel>" + sColumnId + "/value",
								type : new sap.ui.model.type.String()
							}, {
								path : "resultsModel>" + sColumnId + "/type",
								type : new sap.ui.model.type.String()
							}, {
								path : "resultsModel>" + sColumnId + "/datatype",
								type : new sap.ui.model.type.String()
							}, {
								path : "resultsModel>" + URLDisplayField + "/value",
								type : new sap.ui.model.type.String()
							}   ],
							formatter : lens.LensURLFormatter
						});
						//sTemplate.setWrapping(true);
						sColumn.setTemplate("resultsModel>" + sColumnId + "/value");
						sColumn.setTemplate(sTemplate);
					
						
						return sColumn;
					});
					resultsTable.bindRows("resultsModel>/results/bindings");
					resultsTable.attachRowSelectionChange(function(oEvent) {
						sap.ui.getCore().byId(("FormViewForm")).setBindingContext(this.getContextByIndex(oEvent.getParameter("rowIndex")), "resultsModel");
						oFormViewFragment.open();
					});

				}
			} catch (error) {
				lens.ErrorMessage("Query failed: check URL or availability of SPARQLendpoint");
			}
		}
	},

});