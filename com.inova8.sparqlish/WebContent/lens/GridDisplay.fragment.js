jQuery.sap.require("sap.ui.table.Table");
jQuery.sap.require("sap.ui.table.VisibleRowCountMode");
sap.ui.jsfragment("lens.GridDisplay", {
	destroyContent : function() {
		sap.ui.commons.Panel(this.createId("fragmentPanel")).destroy();
	},
	createContent : function(oController) {
		/**
		 * Adds a custom sort menu for a given table
		 * 
		 * @param oTable
		 *          Target table to add custom menu
		 * @param oColumn
		 *          Target table column to add custom menu
		 * @param comparator
		 *          Function to compare two values of column oColumn
		 */
		function addColumnSorterAndFilter(oTable, oColumn, comparator) {
			var oCustomMenu = new sap.ui.commons.Menu();

			oCustomMenu.addItem(new sap.ui.commons.MenuItem({
				text : 'Sort ascending',
				icon : "sap-icon://drill-up",
				select : function() {
					var oSorter = new sap.ui.model.Sorter(oColumn.getSortProperty(), false);
					oSorter.fnCompare = comparator;
					oTable.getBinding("rows").sort(oSorter);

					for (var i = 0; i < oTable.getColumns().length; i++)
						oTable.getColumns()[i].setSorted(false);
					oColumn.setSorted(true);
					oColumn.setSortOrder(sap.ui.table.SortOrder.Ascending);
				}
			}));
			oCustomMenu.addItem(new sap.ui.commons.MenuItem({
				text : 'Sort descending',
				icon : "sap-icon://drill-down",
				select : function(oControlEvent) {
					var oSorter = new sap.ui.model.Sorter(oColumn.getSortProperty(), true);
					oSorter.fnCompare = comparator;
					oTable.getBinding("rows").sort(oSorter);

					for (var i = 0; i < oTable.getColumns().length; i++)
						oTable.getColumns()[i].setSorted(false);

					oColumn.setSorted(true);
					oColumn.setSortOrder(sap.ui.table.SortOrder.Descending);
				}
			}));

			oCustomMenu.addItem(new sap.ui.commons.MenuTextFieldItem({
				text : 'Filter',
				icon : "sap-icon://filter",
				select : function(oControlEvent) {
					var filterValue = oControlEvent.getParameters().item.getValue();
					var filterProperty = oControlEvent.getSource().getParent().getParent().mProperties.sortProperty;
					var filters = [];
					if (filterValue.trim() != '') {
						var oFilter1 = new sap.ui.model.Filter(filterProperty, sap.ui.model.FilterOperator.EQ, filterValue);
						filters = [ oFilter1 ];
					}
					oTable.getBinding("rows").filter(filters, sap.ui.model.FilterType.Application);
				}
			}));

			oColumn.setMenu(oCustomMenu);
			return oColumn;
		}
		;
		// Sorter for numerics
		function compareNumbers(value1, value2) {
			if ((value1 == null || value1 == undefined || value1 == '') && (value2 == null || value2 == undefined || value2 == ''))
				return 0;
			if ((value1 == null || value1 == undefined || value1 == ''))
				return -1;
			if ((value2 == null || value2 == undefined || value2 == ''))
				return 1;
			number1 = parseFloat(value1);
			number2 =  parseFloat(value2);
			if (isNaN(number1) ) return -1;
			if (isNaN(number2) ) return 1;
			if (number1 < number2 )
				return -1;
			if (number1 == number2 )
				return 0;
			if (number1 > number2 )
				return 1;
		}
		;
		var oGridDisplayTable;
		var lensFragmentId = this.toLocaleString().split("#fragment").slice(-1)[0];
		// var lensFragment = oController.lenses[oController.focus][oController.entityType][lensFragmentId];
		var lensFragment = oController.lenses[oController.focus][oController.entityType].fragments[lensFragmentId];
		var sparqlEndpoint = oController.lenses.sparqlEndpoint;
		var URL = lensFragment.URL;
		if (URL == undefined)
			URL = sparqlEndpoint;
		var fragmentQuery = lensFragment.fragmentQuery;
		var variableMapping = lensFragment.variableMapping;

		var oGridDisplayPanel = new sap.ui.commons.Panel(this.createId("fragmentPanel"), {
			title : new sap.ui.core.Title().setText(lensFragment.title),
			width : "100%",
			height : "100%"
		});

		fragmentQuery = fragmentQuery.replace(/%entity%/, oController.entity);
		console.debug("SPARQL fragmentQuery=", fragmentQuery);
		var fragmentModel = new sap.ui.model.json.JSONModel();
		var headers = {};
		//headers.Authorization = "Access-Control-Allow-Origin: *";
		headers.Accept = "application/sparql-results+json";
		try {
			fragmentModel.loadData(URL, "query=" + encodeURIComponent(fragmentQuery), false, "POST", false, false, headers);
			var vars = fragmentModel.getData().head.vars;
			if (vars == undefined) {
				throw "No results";
			}
			;
			oGridDisplayTable = new sap.ui.table.Table({
				expandable : true,
			});

			oGridDisplayTable.bindColumns("fragmentModel>/head/vars", function(sId, oContext) {
				var sColumnId = oContext.getObject();
				var columnName = sColumnId;
				var hidden = false;
				var URLDisplayField = null;
				var format = "Text";
				if (variableMapping != undefined) {
					if (variableMapping[sColumnId] != undefined) {
						if (variableMapping[sColumnId].label != undefined)
							columnName = variableMapping[sColumnId].label;
						hidden = variableMapping[sColumnId].hidden;
						URLDisplayField = variableMapping[sColumnId].URLDisplayField;
						format = variableMapping[sColumnId].format;
					}
				}
				var sColumn;

				sColumn = new sap.ui.table.Column({
					label : columnName
				});

				if (hidden)
					sColumn.setVisible(false);
				var sTemplate;

				if (format == "Number") {
					sTemplate = new sap.ui.commons.TextField({
						value : {
							path : "fragmentModel>" + sColumnId + "/value",
							type : new sap.ui.model.type.Float(),
							formatter : lens.LensNumberFormatter
						},
						textAlign : sap.ui.core.HorizontalAlign.Right
					});
					sColumn.setSortProperty("fragmentModel>" + sColumnId + "/value");
					sColumn.setFilterProperty("fragmentModel>" + sColumnId + "/value");
					addColumnSorterAndFilter(oGridDisplayTable, sColumn, compareNumbers);
				} else {
					if (URLDisplayField != undefined) {
						sColumn.setSortProperty("fragmentModel>" + URLDisplayField + "/value");
						sColumn.setFilterProperty("fragmentModel>" + URLDisplayField + "/value");
					} else {
						sColumn.setSortProperty("fragmentModel>" + sColumnId + "/value");
						sColumn.setFilterProperty("fragmentModel>" + sColumnId + "/value");
					}
					sTemplate = new sap.ui.commons.FormattedTextView().bindProperty("tooltip", "fragmentModel>" + sColumnId + "/value").bindProperty("htmlText", {
						parts : [ {
							path : "fragmentModel>" + sColumnId + "/value",
							type : new sap.ui.model.type.String()
						}, {
							path : "fragmentModel>" + sColumnId + "/type",
							type : new sap.ui.model.type.String()
						}, {
							path : "fragmentModel>" + sColumnId + "/datatype",
							type : new sap.ui.model.type.String()
						}, {
							path : "fragmentModel>" + URLDisplayField + "/value",
							type : new sap.ui.model.type.String()
						} ],
						formatter : lens.LensURLFormatter
					});
				}
				;
				// sColumn.setTemplate("fragmentModel>" + sColumnId + "/value");
				sColumn.setTemplate(sTemplate);

				return sColumn;

			});
			oGridDisplayTable.setModel(fragmentModel, "fragmentModel");
			oGridDisplayTable.bindRows("fragmentModel>/results/bindings");
			// oGridDisplayTable.setVisibleRowCount(8);
			oGridDisplayTable.setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Auto);
			oGridDisplayTable.setNavigationMode(sap.ui.table.NavigationMode.Paginator);

			oGridDisplayPanel.addContent(oGridDisplayTable);
		} catch (error) {
			console.log("here in error");
		} finally {
		}

		return oGridDisplayPanel;
	}
});