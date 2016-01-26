jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sparqlish.sparqlish")
jQuery.sap.require("sparqlish.control.queryClause");
jQuery.sap.require("sparqlish.control.queryClausePreview");
jQuery.sap.require("sparqlish.control.serviceQueryMenu");
jQuery.sap.require("sap.ui.table.TreeTable");
jQuery.sap.require("sap.m.Toolbar");
jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.ui.core.IconPool");

jQuery.sap.declare("Components.searchForm.Component");

sap.ui.core.UIComponent.extend("Components.searchForm.Component", {
	metadata : {
		// manifest : "json",
		properties : {
			title : "string",
			metaModel : "object",
			query : "string"
		},
		events : {
			serviceChanged : {
				enablePreventDefault : true
			},
			queryChanged : {
				enablePreventDefault : true
			}
		}
	}
});

Components.searchForm.Component.prototype.createContent = function() {
	var self = this;

	this.oFormPanel = new sap.ui.commons.Panel({
		title : new sap.ui.core.Title().setText("Search Display Form"),
		width : "100%",
		showCollapseIcon : false,
		borderDesign : sap.ui.commons.enums.BorderDesign.Box
	// height : "500px"
	});

	this.createServiceMenu();
	this.createQueryMenu();
	this.createSearchButton();

	// this.oFormPanel.addButton(new sap.ui.commons.Button({
	// icon : sap.ui.core.IconPool.getIconURI("settings"),
	// press : function(oEvent) {
	// sap.m.MessageToast.show("settings for form")
	// }
	// }));
	var oParameterFormLayout = new sap.ui.layout.form.GridLayout({
		singleColumn : false
	});

	this.oParameterContainer = new sap.ui.layout.form.FormContainer({
		expandable : true
	});
	this.oParameterForm = new sap.ui.layout.form.Form({
		layout : oParameterFormLayout,
		width : "100%",
		formContainers : this.oParameterContainer
	});
	this.oFormPanel.addContent(this.oParameterForm);

	var oFormLayout = new sap.ui.layout.form.GridLayout({
		singleColumn : false
	});
	this.oFormContainer = new sap.ui.layout.form.FormContainer({
		expandable : true
	});

	this.oForm = new sap.ui.layout.form.Form({
		layout : oFormLayout,
		width : "100%",
		formContainers : this.oFormContainer
	});
	this.oFormPanel.addContent(this.oForm);

	return this.oFormPanel;
};
Components.searchForm.Component.prototype.createSearchButton = function() {
	var self = this;
	self.oPreview = new sap.m.Button({
		text : "{i18nModel>preview}",
		icon : sap.ui.core.IconPool.getIconURI("search"),
		press : function(oEvent) {
			var queryPath = self.oQuerySelect.getSelectedItem().getBindingContext("serviceQueriesModel").getPath();
			var queryAST = sap.ui.getCore().getModel("serviceQueriesModel").getProperty(queryPath);
			var query = new Query(sap.ui.getCore().getModel("metaModel"), queryAST);
			self.renderResults(query)
		}
	});
	this.oFormPanel.addContent(self.oPreview);
};
Components.searchForm.Component.prototype.createServiceMenu = function() {
	var self = this;
	this.oServiceSelect = new sap.m.ActionSelect({
		tooltip : "{i18nModel>serviceSelectTooltip}",
		items : {
			path : "serviceQueriesModel>/services",
			sorter : {
				path : "serviceQueriesModel>name"
			},
			template : new sap.ui.core.ListItem({
				key : "{serviceQueriesModel>serviceUrl}",
				text : "{serviceQueriesModel>name}"
			})
		},
		change : function(oEvent) {
			self.oQuerySelect.bindItems({
				path : "serviceQueriesModel>" + oEvent.getParameter("selectedItem").getBindingContext("serviceQueriesModel") + "/queries",
				sorter : {
					path : "serviceQueriesModel>name"
				},
				template : new sap.ui.core.ListItem({
					key : "{serviceQueriesModel>name}",
					text : "{serviceQueriesModel>name}"
				})
			});
			self.oQuerySelect.setSelectedItem(self.oQuerySelect.getFirstItem());
			// Load new metamodel

		}
	}).addStyleClass("menuText").attachChange(function(oEvent) {
		self.fireServiceChanged({
		// service :
		// self.getModel("serviceQueriesModel").getProperty(self.oServiceSelect.getSelectedItem().getBindingContext("serviceQueriesModel").getPath()),
		// query :
		// self.getModel("serviceQueriesModel").getProperty(self.oQuerySelect.getSelectedItem().getBindingContext("serviceQueriesModel").getPath())
		})
	});
	this.oFormPanel.addContent(self.oServiceSelect);
};
Components.searchForm.Component.prototype.createQueryMenu = function() {
	var self = this;
	self.oQuerySelect = new sap.m.ActionSelect({
		tooltip : "{i18nModel>querySelectTooltip}",
		items : {
			path : "serviceQueriesModel>/services/0/queries",
			sorter : {
				path : "serviceQueriesModel>name"
			},
			template : new sap.ui.core.ListItem({
				key : "{serviceQueriesModel>serviceUrl}",
				text : "{serviceQueriesModel>name}"
			})
		},
		change : function(oEvent) {
			// To do set the parameters form
			// Clear the results form
			var servicePath = self.oServiceSelect.getSelectedItem().getBindingContext("serviceQueriesModel").getPath();
			var queryPath = oEvent.getParameter("selectedItem").getBindingContext("serviceQueriesModel").getPath();
			self.fireQueryChanged({

				service : sap.ui.getCore().getModel("serviceQueriesModel").getProperty(servicePath),
				query : sap.ui.getCore().getModel("serviceQueriesModel").getProperty(queryPath)
			})
		}
	}).addStyleClass("menuText");
	this.oFormPanel.addContent(self.oQuerySelect);
};
Components.searchForm.Component.prototype.renderResults = function(query) {
	var self = this;
	var odataResults = new sap.ui.model.json.JSONModel({});
	var odataURL = query || self.getProperty("query");
	self.oForm.setBusy(true).setBusyIndicatorDelay(0);
	odataResults.loadData(odataURL);
	odataResults.attachRequestCompleted(function(oEvent) {
		if (oEvent.getParameter("success")) {
			// try {
			var nResults = 0;
			var oRecordTemplate = null;
			var sBindPath = null;
			if (jQuery.isEmptyObject(odataResults.getData().d.results)) {
				if (odataResults.getData().d.length > 0) {
					oRecordTemplate = odataResults.getData().d[0];
					sBindPath = "/d";
				} else {
					throw "No results returned";
				}
			} else {
				nResults = odataResults.getData().d.results.length;
				oRecordTemplate = odataResults.getData().d.results[0];
				sBindPath = "/d/results";
			}
			self.oFormPanel.getTitle().setText((jQuery.isEmptyObject(self.getProperty("title"))) ? oRecordTemplate.__metadata.type : self.getProperty("title"));
			self.oFormPanel.setModel(odataResults);
			var oMetaModel = self.getMetaModel();// sap.ui.getCore().getModel("metaModel");
			var oPrimaryEntityType = oMetaModel.getODataEntityType(oRecordTemplate.__metadata.type);
			self.oFormContainer.destroyFormElements();
			self.bindFormFields(oMetaModel, "d", oRecordTemplate, oPrimaryEntityType.name, sBindPath, 0, 0);
			self.oForm.bindElement(sBindPath);
		} else {
			// Failed request
			self.oFormPanel.getTitle().setText(JSON.stringify(oEvent.getParameter("errorobject")));
			self.oFormContainer.destroyFormElements();
		}
		self.oFormPanel.addStyleClass("sapUiNoContentPadding");
		self.oForm.setBusy(false);
	});
	return this;
};

Components.searchForm.Component.prototype.nextFormElement = function(sLabel, nLevel, bObjectProperty, oField) {
	nLevel < 0 ? nLevel = 0 : nLevel = nLevel;
	oField.setLayoutData(new sap.ui.layout.form.GridElementData({
		hCells : (12 - nLevel).toString()
	}));
	for (var i = 0; i < nLevel * 5; i++)
		sLabel = "\u00a0" + sLabel;
	var oFormElement = new sap.ui.layout.form.FormElement({
		label : new sap.ui.commons.Label({
			text : sLabel,
			textAlign : sap.ui.core.TextAlign.Left,
			width : "100%",
			design : bObjectProperty ? sap.ui.commons.LabelDesign.Bold : sap.ui.commons.LabelDesign.Standard,
			layoutData : new sap.ui.layout.form.GridElementData({
				hCells : (4 + nLevel).toString()
			})
		}),
		fields : [ oField ]
	});
	this.oFormContainer.addFormElement(oFormElement);
	return oFormElement;
};

Components.searchForm.Component.prototype.bindFormFields = function(oMetaModel, sColumn, oTemplate, sCurrentLabel, sCurrentPath, nStartRow, nLevel, bResults) {
	bResults = typeof bResults === 'undefined' ? true : bResults;
	var sEntityType;
	var oEntityType;
	var nRow = nStartRow;
	var elementCollection = [];
	var paginatorCollection = [];
	var innerPaginatorCollection = [];
	var oDateTimeFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
		pattern : sap.ui.getCore().getModel("i18n").getProperty("Edm.DateTime")
	});
	var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
		pattern : sap.ui.getCore().getModel("i18n").getProperty("Edm.Date")
	});
	if (!jQuery.isEmptyObject(oTemplate.__metadata)) {
		sEntityType = oTemplate.__metadata.type;
		oEntityType = oMetaModel.getODataEntityType(sEntityType);
	}
	for ( var column in oTemplate) {
		var sPathPrefix = (bResults) ? "" : sCurrentPath + "/";
		if (column == "__metadata") {
			var sMetaLabel = sCurrentLabel;
			if (bResults) {
				oPaginator = new sap.ui.commons.Paginator({
					currentPage : 1
				});
				oPaginator.bindColumn = sColumn;
				paginatorCollection.push(oPaginator);
				elementCollection.push(this.nextFormElement(sMetaLabel, nLevel - 1, true, oPaginator));
				nRow++;
				oPaginator.attachPage(function(oEvent) {
					var sBindColumn = oEvent.getSource().bindColumn;
					var sBindPath = oEvent.getParameter("path");
					if (jQuery.isEmptyObject(sBindPath)) {
						sBindPath = oEvent.getSource().bindPath;
						if (jQuery.isEmptyObject(sBindPath))
							sBindPath = "/";
					} else {
						sBindPath += "/";
					}
					oEvent.getSource().bindPath = sBindPath;
					var sContext = sBindPath + sBindColumn + "/";
					if (!jQuery.isEmptyObject(oEvent.getSource().getModel().getProperty(sContext).results))
						sContext += "results/";
					oEvent.getSource().setNumberOfPages(oEvent.getSource().getModel().getProperty(sContext).length);
					for (var i = 0; i < elementCollection.length; i++) {
						elementCollection[i].bindElement(sContext + (parseInt(oEvent.getParameter("targetPage")) - 1).toString());
					}
					for (var i = 0; i < innerPaginatorCollection.length; i++) {
						innerPaginatorCollection[i].setProperty("currentPage", 1);
						innerPaginatorCollection[i].firePage({
							path : sContext + (parseInt(oEvent.getParameter("targetPage")) - 1).toString(),
							targetPage : 1,
							numberOfPages : 10,
						});
					}
				});
			}
			elementCollection.push(this.nextFormElement(bResults ? "" : sMetaLabel, nLevel - 1, true, new sap.ui.commons.Link().bindProperty("text", {
				parts : [ {
					path : sPathPrefix + "__metadata/uri",
					type : new sap.ui.model.type.String()
				} ],
				formatter : function(uri) {
					return jQuery.isEmptyObject(uri) ? "" : uri.split("/").pop();
				}
			// path : sPathPrefix + "__metadata/uri"
			}).bindProperty("href", {
				parts : [ {
					path : sPathPrefix + "__metadata/uri",
					type : new sap.ui.model.type.String()
				} ],
				formatter : function(uri) {
					return  jQuery.isEmptyObject(uri) ? "" : "../com.inova8.sparqlish/#/lens/guest/"+ uri.split("/").pop();
				}		
			//path : sPathPrefix + "__metadata/uri"
			})));
			nRow++;
		} else {
			// var sLabel = (sCurrentLabel == "") ? column : sCurrentLabel + ":" + column;
			var sLabel = (sCurrentLabel == "") ? column : "\u21AA" + column;

			if (oTemplate[column] != null) {
				if (!jQuery.isEmptyObject(oTemplate[column].results)) {
					// Must be a repeating record set
					var oInnerTemplate = oTemplate[column].results[0];
					innerPaginatorCollection = this.bindFormFields(oMetaModel, column, oInnerTemplate, sLabel, sCurrentPath + "/0/" + column + "/results", nRow,
							nLevel + 1);
				} else if (!jQuery.isEmptyObject(oTemplate[column].__metadata)) {
					// Must be a compound column so iterate through these as well
					elementCollection = elementCollection.concat(this.bindFormFields(oMetaModel, column, oTemplate[column], sLabel, sPathPrefix + column, nRow,
							nLevel + 1, false));
				} else if (!jQuery.isEmptyObject(oTemplate[column].__deferred)) {
					var contents = oTemplate[column].__deferred;
					// format for text of URL: oTemplate.__metadata.uri.split("/").pop()
					elementCollection.push(this.nextFormElement(sLabel, nLevel, true, new sap.ui.commons.Link().bindProperty("text", {
						parts : [ {
							path : sPathPrefix + "__deferred/uri",
							type : new sap.ui.model.type.String()
						} ],
						formatter : function(uri) {
							return jQuery.isEmptyObject(uri) ? "" : uri.split("/").pop();
						}
					// path : sPathPrefix + "__deferred/uri"
					}).bindProperty("href", {
						path : sPathPrefix + "__deferred/uri"
					})));
					nRow++;
				} else {
					// Should format according to type found in metadata
					var oProperty
					try {
						oProperty = oMetaModel.getODataProperty(oEntityType, column);
					} catch (e) {
						throw "getODataProperty" + ":" + oEntityType + ":" + column;
					}
					if (oProperty.type == "Edm.DateTime") {
						elementCollection.push(this.nextFormElement(sLabel, nLevel, false, new sap.ui.commons.TextView({
							text : {
								path : column,
								formatter : function(value) {
									if (value != null) {
										if (typeof (value) == 'string') {
											// TODO when the Odata atom/xml response or json does not annotate the type of the response
											var rExp = /\/Date\((.+)\)\//;
											var sDate = rExp.exec(value)[1];
											// return eval("new " + rExp.$1);
											if (jQuery.isEmptyObject(sDate)) {
												value = oDateTimeFormat.parse(value);
											} else {
												value = new Date(sDate * 1);
											}
										}
										return oDateTimeFormat.format(value);
									} else {
										return null;
									}
								}
							}
						})));
						nRow++;
					} else if (oProperty.type == "Edm.Stream") {
						elementCollection.push(this.nextFormElement(sLabel, nLevel, false, new sap.m.Image({
							"src" : {
								path : sPathPrefix + column
							}
						})));
						nRow++;
					} else {
						elementCollection.push(this.nextFormElement(sLabel, nLevel, false, new sap.ui.commons.TextView().bindProperty("text", {
							path : sPathPrefix + column,
							type : new sap.ui.model.type.String()
						})));
						nRow++;
					}
				}
			} else {
				elementCollection.push(this.nextFormElement(sLabel, nLevel, false, new sap.ui.commons.TextView().bindProperty("text", {
					path : sPathPrefix + column,
					type : new sap.ui.model.type.String()
				})));
				nRow++;
			}
		}
	}
	// Initialize the binding since we are not using Form binding
	for (var i = 0; i < elementCollection.length; i++)
		if (bResults) {
			elementCollection[i].bindElement(sCurrentPath + "/0/");
		} else {
			elementCollection[i].bindElement(sCurrentPath + "/");
		}
	if (bResults) {
		for (var i = 0; i < paginatorCollection.length; i++)
			paginatorCollection[i].setNumberOfPages(oPaginator.getModel().getProperty(sCurrentPath).length);
		return paginatorCollection;
	} else {
		return elementCollection;
	}
};

Components.searchForm.Component.prototype._initValueInputFactory = function(sId, oContext) {
	var oInputValue = null
	switch (oContext.getProperty("type")) {
	case "Edm.Date":
		oInputValue = (new sap.m.DatePicker({
			valueFormat : 'yyyy-MM-ddThh:mm:ssXX',
			tooltip : "{serviceQueriesModel>prompt}",
			width : "auto",
			placeholder : "{serviceQueriesModel>prompt}",
			description : "",
			editable : true,
			showValueHelp : true,
			valueHelpRequest : ""
		})).addStyleClass("dataPropertyValue");
		break;
	case "Edm.DateTime":
		oInputValue = (new sap.m.DatePicker({
			valueFormat : 'yyyy-MM-ddThh:mm:ssXX',
			tooltip : "{serviceQueriesModel>prompt}",
			width : "auto",
			placeholder : "{serviceQueriesModel>prompt}",
			description : "",
			editable : true,
			showValueHelp : true,
			valueHelpRequest : ""
		})).addStyleClass("dataPropertyValue");
		break;
	case "Edm.Time":
		oInputValue = (new sap.m.TimePicker({
			valueFormat : 'yyyy-MM-ddThh:mm:ssXX',
			tooltip : "{serviceQueriesModel>prompt}",
			width : "auto",
			placeholder : "{serviceQueriesModel>prompt}",
			description : "",
			editable : true,
			showValueHelp : true,
			valueHelpRequest : ""
		})).addStyleClass("dataPropertyValue");
		break;
	case "Edm.Decimal":
	case "Edm.Double":
	case "Edm.Single":
	case "Edm.Int16":
	case "Edm.Int32":
	case "Edm.Int64":
		oInputValue = (new sap.m.Input({
			type : sap.m.InputType.Number,
			tooltip : "{serviceQueriesModel>prompt}",
			width : "auto",
			placeholder : "{serviceQueriesModel>prompt}",
			description : "",
			editable : true,
			showValueHelp : true,
			valueHelpRequest : ""
		})).addStyleClass("dataPropertyValue");
		break;
	default:
		oInputValue = (new sap.m.Input({
			tooltip : "{serviceQueriesModel>prompt}",
			width : "auto",
			placeholder : "{serviceQueriesModel>prompt}",
			description : "",
			editable : true,
			showValueHelp : true,
			valueHelpRequest : ""
		})).addStyleClass("dataPropertyValue");
	}
	oInputValue.bindProperty("value", "serviceQueriesModel>defaultValue")

	var oFormElement = new sap.ui.layout.form.FormElement({
		label : "{serviceQueriesModel>name}",
		fields : [ oInputValue ],
		layoutData : new sap.ui.layout.form.GridElementData({
			hCells : "2"
		})
	});
	return oFormElement;
};
Components.searchForm.Component.prototype.setQueryContext = function(oQueryContext) {
	var self = this;
	self.oParameterForm.getFormContainers()[0].bindAggregation("formElements", "serviceQueriesModel>" + oQueryContext.getPath() + "/parameters",
			this._initValueInputFactory.bind(this));
	self.oFormPanel.setModel(sap.ui.getCore().getModel("serviceQueriesModel"), "serviceQueriesModel");
	// self.oParameterForm.rerender();
};
