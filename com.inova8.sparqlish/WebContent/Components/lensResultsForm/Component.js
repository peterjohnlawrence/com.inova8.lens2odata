jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.commons.Panel");
jQuery.sap.require("sap.ui.layout.form.GridLayout");
jQuery.sap.require("sap.ui.layout.form.FormContainer");
jQuery.sap.require("sap.ui.layout.form.Form");
jQuery.sap.require("sap.ui.commons.Paginator");
jQuery.sap.declare("Components.lensResultsForm.Component");

sap.ui.core.UIComponent.extend("Components.lensResultsForm.Component", {

	metadata : {
		// manifest : "json",
		properties : {
			title : "string",
			metaModel : "object",
			query : "string"
		}
	}
});

Components.lensResultsForm.Component.prototype.createContent = function() {
	var self = this;

	this.oFormPanel = new sap.ui.commons.Panel({
		title : new sap.ui.core.Title().setText("OData Display Form"),
		width : "100%",
		showCollapseIcon : false,
		borderDesign : sap.ui.commons.enums.BorderDesign.Box
	// height : "500px"
	});
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
	this.oFormPanel.addButton(new sap.ui.commons.Button({
		icon : sap.ui.core.IconPool.getIconURI("settings"),
		press : function(oEvent) {
			sap.m.MessageToast.show("settings for form")
		}
	}));
	return this.oFormPanel;
};

Components.lensResultsForm.Component.prototype.renderResults = function(query) {
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
			var oPrimaryEntityType = oMetaModel.getODataEntityType(oRecordTemplate.__metadata.type);
			self.oFormContainer.destroyFormElements();
			self.bindFormFields(oMetaModel, "d", oRecordTemplate, oPrimaryEntityType.name, sBindPath, 0, 0);
			self.oForm.bindElement(sBindPath);
			// } catch (err) {
			// self.oFormPanel.getTitle().setText(err);
			// self.oFormContainer.destroyFormElements();
			// }
		} else {
			// Failed request
			self.oFormPanel.getTitle().setText(JSON.stringify(oEvent.getParameter("errorobject")));
			self.oFormContainer.destroyFormElements();
		}
		self.oFormPanel.addStyleClass("sapUiNoContentPadding");
		// self.oFormContainer.addStyleClass("sapUiNoContentPadding") ;
		self.oForm.setBusy(false);
	});
	return this;
};

Components.lensResultsForm.Component.prototype.nextFormElement = function(sLabel, nLevel, bObjectProperty, oField) {
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

Components.lensResultsForm.Component.prototype.bindFormFields = function(oMetaModel, sColumn, oTemplate, sCurrentLabel, sCurrentPath, nStartRow, nLevel,
		bResults) {
	bResults = typeof bResults === 'undefined' ? true : bResults;
	var sEntityType;
	var oEntityType;
	var nRow = nStartRow;
	var elementCollection = [];
	var paginatorCollection = [];
	var innerPaginatorCollection = [];
	var oDateTimeFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
		pattern : sap.ui.getCore().getModel("i18nModel").getProperty("Edm.DateTime")
	});
	var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
		pattern : sap.ui.getCore().getModel("i18nModel").getProperty("Edm.Date")
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
				path : sPathPrefix + "__metadata/uri"
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
					elementCollection.push(this.nextFormElement(sLabel,  nLevel, true, new sap.ui.commons.Link().bindProperty("text", {
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
