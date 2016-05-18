jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.commons.Panel");
jQuery.sap.require("sap.ui.layout.form.GridLayout");
jQuery.sap.require("sap.ui.layout.form.FormContainer");
jQuery.sap.require("sap.ui.layout.form.Form");
jQuery.sap.require("sap.ui.commons.Paginator");
jQuery.sap.require("control.textLink");
jQuery.sap.require("control.fragmentDialog");
jQuery.sap.declare("Components.lensResultsForm.Component");
"use strict";
sap.ui.core.UIComponent.extend("Components.lensResultsForm.Component", {

	metadata : {
		// manifest : "json",
		properties : {
			template:"string",
			fragment : "object",
			title : "string",
			metaModel : "object",
			query : "string",
			serviceCode : "string",
			options : "object"
		}
	}
});
Components.lensResultsForm.Component.prototype.fragmentEdit = function(oEvent, self) {
	var oFragmentDialog = new control.fragmentDialog();
	var oLensContext = self.getBindingContext("lensesModel");
	oFragmentDialog.setModel(sap.ui.getCore().getModel("lensesModel"), "lensesModel");
	oFragmentDialog.setBindingContext(oLensContext, "lensesModel");
	oFragmentDialog.setFragment(self.getFragment()).setTemplate(self.getProperty("template"));
	oFragmentDialog.open();
};
Components.lensResultsForm.Component.prototype.createContent = function() {
	var self = this;
	self.setOptions({
		hiddenColumns : [ "label" ]
	});
	// self.getOptions().hiddenColumns = [ "label" ]
	// this.oFormPanel = new sap.ui.commons.Panel({
	// title : new sap.ui.core.Title(),
	this.oFormPanel = new sap.m.Panel({
		width : "100%",
		height : "auto",// height : "auto",
		showCollapseIcon : false,
		borderDesign : sap.ui.commons.enums.BorderDesign.Box,
		headerToolbar : new sap.m.Toolbar()
	});
	this.oTitle = new sap.m.Title({
		text : ""
	});
	this.oFormPanel.getHeaderToolbar().addContent(this.oTitle).addContent(new sap.m.ToolbarSpacer()).addContent(new sap.m.Button({
		icon : "sap-icon://edit",
		press : function(oEvent) {
			self.fragmentEdit(oEvent, self)
		}
	}));
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
Components.lensResultsForm.Component.prototype.setTitle = function(sTitle) {
	this.setProperty("title", sTitle);
	// this.oFormPanel.setHeaderText(sTitle);
	this.oTitle.setText(sTitle);
};
Components.lensResultsForm.Component.prototype.clearContents = function() {
	this.oFormContainer.destroyFormElements();
};
Components.lensResultsForm.Component.prototype.renderResults = function(queryUrl, serviceCode) {
	var self = this;
	self.deferredEntityTypeMap = new Object();
	self.setProperty("serviceCode", serviceCode || self.getProperty("serviceCode"));
	var odataResults = new sap.ui.model.json.JSONModel({});
	var odataURL = queryUrl || self.getProperty("query");
	if (!jQuery.isEmptyObject(odataURL)) {
		self.oForm.setBusy(true).setBusyIndicatorDelay(0);
		odataResults.loadData(utils.proxyUrl(odataURL, sap.ui.getCore().getModel("queryModel").getData().services[self.getProperty("serviceCode")].useProxy));
		odataResults.attachRequestCompleted(function(oEvent) {
			if (oEvent.getParameter("success")) {
				try {
					var nResults = 0;
					var bResults = true;
					var oRecordTemplate = null;
					var sBindPath = null;
					// if (jQuery.isEmptyObject(odataResults.getData().d.results)) {
					// Should fix missing results
					if ((typeof odataResults.getData().d.results !== "object") || jQuery.isEmptyObject(odataResults.getData().d.results)) {
						if ((odataResults.getData().d.length > 0)) {
							oRecordTemplate = odataResults.getData().d[0];
							sBindPath = "/d";
						} else {
							oRecordTemplate = odataResults.getData().d;
							sBindPath = "/d";
							bResults = false;
						}
					} else {
						nResults = odataResults.getData().d.results.length;
						if (nResults === 0) {
							sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("queryForm.noResults"));
							throw "No results returned";
						} else {
							oRecordTemplate = odataResults.getData().d.results[0];
							sBindPath = "/d/results";
						}
					}
					if (!jQuery.isEmptyObject(oRecordTemplate.__metadata)) {
						// self.oFormPanel.getTitle().setText((jQuery.isEmptyObject(self.getProperty("title"))) ?
						// oRecordTemplate.__metadata.type : self.getProperty("title"));
						self.oFormPanel.setHeaderText((jQuery.isEmptyObject(self.getProperty("title"))) ? oRecordTemplate.__metadata.type : self.getProperty("title"));
						self.oFormPanel.setModel(odataResults);
						var oMetaModel = self.getMetaModel();// sap.ui.getCore().getModel("metaModel");
						var oPrimaryEntityType = oMetaModel.getODataEntityType(oRecordTemplate.__metadata.type);
						self.oFormContainer.destroyFormElements();
						self.bindFormFields(oMetaModel, "d", oRecordTemplate, oPrimaryEntityType.name, sBindPath, 0, 0, bResults);
						self.oForm.bindElement(sBindPath);
					} else {
						self.oFormContainer.addFormElement(new sap.ui.layout.form.FormElement({
							label : new sap.m.Label({
								text : sap.ui.getCore().getModel("i18nModel").getProperty("lensResultsForm.queryNoDataFound"),
							})
						}));
						self.oForm.setBusy(false);
					}
				} catch (err) {
					sap.m.MessageToast.show(err);
					self.oFormContainer.destroyFormElements();
					self.oForm.setBusy(false);
				}
			}
			self.oFormPanel.addStyleClass("sapUiNoContentPadding");
			self.oForm.setBusy(false);
		}).attachRequestFailed(
				function(oEvent) {
					var displayText;
					if (oEvent.getParameter("statusCode") == 404) {
						displayText = sap.ui.getCore().getModel("i18nModel").getProperty("lensResultsForm.queryNoDataFound");
					} else {
						displayText = sap.ui.getCore().getModel("i18nModel").getProperty("lensResultsForm.queryResponseError") + oEvent.getParameter("statusCode") + " "
								+ oEvent.getParameter("statusText");
					}
					self.oFormContainer.addFormElement(new sap.ui.layout.form.FormElement({
						label : new sap.m.Label({
							text : displayText,
						})
					}));
					self.oForm.setBusy(false);
				});
	} else {
		sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("lensResultsForm.queryUndefined"));
	}
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
		label : new sap.m.Label({
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
	var self = this;
	bResults = typeof bResults === 'undefined' ? true : bResults;
	var sEntityType;
	var oEntityType;
	var nRow = nStartRow;
	var elementCollection = [];
	var paginatorCollection = [];
	var innerPaginatorCollection = [];
	if (!jQuery.isEmptyObject(oTemplate.__metadata)) {
		sEntityType = oTemplate.__metadata.type;
		oEntityType = oMetaModel.getODataEntityType(sEntityType);
	}
	for ( var column in oTemplate) {
		if (jQuery.inArray(column, self.getOptions().hiddenColumns)) {
			var sPathPrefix = (bResults) ? "" : sCurrentPath + "/";
			var sTooltip;
			if (column == "__metadata") {

				if (!jQuery.isEmptyObject(oTemplate[column].uri)) {
					var sLabel = oEntityType["com.sap.vocabularies.Common.v1.Label"] ? oEntityType["com.sap.vocabularies.Common.v1.Label"].String : sCurrentLabel;
					sTooltip = oEntityType["com.sap.vocabularies.Common.v1.QuickInfo"] ? oEntityType["com.sap.vocabularies.Common.v1.QuickInfo"].String : sCurrentLabel;
					if (bResults) {
						oPaginator = new sap.ui.commons.Paginator({
							currentPage : 1
						});
						oPaginator.bindColumn = sColumn;
						paginatorCollection.push(oPaginator);
						elementCollection.push(this.nextFormElement(sLabel, nLevel - 1, true, oPaginator));
						nRow++;
						oPaginator.attachPage(function(oEvent) {
							var sBindColumn = oEvent.getSource().bindColumn;
							var sBindPath = oEvent.getParameter("path");
							if (jQuery.isEmptyObject(sBindPath)) {
								sBindPath = oEvent.getSource().bindPath;
								if (jQuery.isEmptyObject(sBindPath)) {
									// The path has not been set because it is the first rendering the paginator
									pathArray = oEvent.getSource().getBindingContext().getPath().split("/");
									pathArray.splice(-3, 3);
									sBindPath = pathArray.join("/").concat("/")
									// sBindPath = "/";
								}
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
					elementCollection.push(this.nextFormElement(bResults ? "" : sLabel, nLevel - 1, true, new sap.m.Link({
						tooltip : sTooltip
					}).bindProperty("text", {
						parts : [ {
							path : sPathPrefix + "__metadata/uri",
							type : new sap.ui.model.type.String()
						}, {
							path : sPathPrefix + "subjectId",
							type : new sap.ui.model.type.String()
						}, {
							path : sPathPrefix + "label",
							type : new sap.ui.model.type.String()
						} ],
						formatter : function(uri, sSubjectId, sLabel) {
							return utils.lensUriLabel(uri, sSubjectId, sLabel);
						}
					}).bindProperty("href", {
						parts : [ {
							path : sPathPrefix + "__metadata/uri",
							type : new sap.ui.model.type.String()
						}, {
							path : sPathPrefix + "__metadata/type",
							type : new sap.ui.model.type.String()
						} ],
						formatter : function(uri, type) {
							return utils.lensUri(uri, type, self.getProperty("serviceCode"));
						}
					})));
					nRow++;
				} else {
					// TODO Must be a complex type. Need to add values for each field of complex type if available
					// oMetaModel.getODataComplexType(sEntityType)
				}
			} else {
				var sLabel = (sCurrentLabel == "") ? column : "\u21AA" + column;
				if (oTemplate[column] != null) {
					if (!jQuery.isEmptyObject(oTemplate[column].results)) {
						// Must be a repeating record set
						var oInnerTemplate = oTemplate[column].results[0];
						if (bResults) {
							innerPaginatorCollection = this.bindFormFields(oMetaModel, column, oInnerTemplate, sLabel, sCurrentPath + "/0/" + column + "/results", nRow,
									nLevel + 1, true);
						} else {
							innerPaginatorCollection = this.bindFormFields(oMetaModel, column, oInnerTemplate, sLabel, sCurrentPath + "/" + column + "/results", nRow,
									nLevel + 1, true);
						}
					} else if (!jQuery.isEmptyObject(oTemplate[column].__metadata)) {
						// Must be a compound column so iterate through these as well
						elementCollection = elementCollection.concat(this.bindFormFields(oMetaModel, column, oTemplate[column], sLabel, sPathPrefix + column, nRow,
								nLevel + 1, false));
					} else if (!jQuery.isEmptyObject(oTemplate[column].__deferred)) {
						var contents = oTemplate[column].__deferred;
						var oProperty = oMetaModel.getODataInheritedNavigationProperty(oEntityType, column);
						sLabel = oProperty["com.sap.vocabularies.Common.v1.Label"] ? "\u21AA" + oProperty["com.sap.vocabularies.Common.v1.Label"].String : "\u21AA"
								+ column;
						sTooltip = oProperty["com.sap.vocabularies.Common.v1.QuickInfo"] ? oProperty["com.sap.vocabularies.Common.v1.QuickInfo"].String : column;
						oLink = new sap.m.Link({
							tooltip : sTooltip
						});
						self.deferredEntityTypeMap[column] = oMetaModel.getODataInheritedAssociation(oEntityType, column).type;
						oTemplate[column].__deferred.type = oMetaModel.getODataInheritedAssociation(oEntityType, column).type;
						elementCollection.push(this.nextFormElement(sLabel, nLevel, true, oLink.bindProperty("text", {
							parts : [ {
								path : column + "/__deferred/uri",
								type : new sap.ui.model.type.String()
							} ],
							formatter : function(uri) {
								return utils.lensDeferredUriLabel(uri);
							}
						}).bindProperty("href", {
							parts : [ {
								path : column + "/__deferred/uri",
								type : new sap.ui.model.type.String()
							} ],
							formatter : function(uri, type) {
								return utils.lensDeferredUri(uri, self.getProperty("serviceCode"), self);
							}
						})));
						nRow++;
					} else if (oTemplate[column].results != undefined) {
						// This should not happen but could be the case that the navProperty is empty in which case there will be no
						// metadata but an empty results array
					} else {
						// Should format according to type found in metadata
						var oProperty;
						try {
							// oProperty = oMetaModel.getDataProperty(oEntityType.name, column);
							oProperty = oMetaModel.getODataInheritedProperty(oEntityType, column);
							sLabel = oProperty["com.sap.vocabularies.Common.v1.Label"] ? "\u21AA" + oProperty["com.sap.vocabularies.Common.v1.Label"].String : sLabel;
							sTooltip = oProperty["com.sap.vocabularies.Common.v1.QuickInfo"] ? oProperty["com.sap.vocabularies.Common.v1.QuickInfo"].String : column;
						} catch (e) {
							throw "getODataProperty" + ":" + oEntityType + ":" + column;
						}
						if (oProperty.type == "Edm.DateTime") {
							elementCollection.push(this.nextFormElement(sLabel, nLevel, false, new sap.m.Text({
								text : {
									path : column,
									formatter : utils.edmDateTimeFormatter
								},
								tooltip : sTooltip
							})));
							nRow++;
						} else if (oProperty.type == "Edm.Stream") {
							elementCollection.push(this.nextFormElement(sLabel, nLevel, false, new sap.m.Image({
								"src" : {
									path : sPathPrefix + column
								},
								tooltip : sTooltip
							})));
							nRow++;
						} else if (oProperty.type == "Edm.Binary") {
							elementCollection.push(this.nextFormElement(sLabel, nLevel, false, new sap.m.Image({
								"src" : {
									path : sPathPrefix + column
								},
								tooltip : sTooltip
							})));
							nRow++;
						} else {
							elementCollection.push(this.nextFormElement(sLabel, nLevel, false, new control.textLink({
								wrapping : true,
								tooltip : sTooltip
							}).bindProperty("value", {
								path : sPathPrefix + column
							})));
							nRow++;
						}
					}
				} else {
					elementCollection.push(this.nextFormElement(sLabel, nLevel, false, new control.textLink({
						wrapping : true,
						tooltip : sTooltip
					}).bindProperty("value", {
						path : sPathPrefix + column
					}).setProperty("linkText", sap.ui.getCore().getModel("i18nModel").getProperty("textLink.LinkTo") + column)));
					nRow++;
				}
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
		for (var i = 0; i < paginatorCollection.length; i++) {
			if (oPaginator.getModel().getProperty(sCurrentPath) != undefined) {
				paginatorCollection[i].setNumberOfPages(oPaginator.getModel().getProperty(sCurrentPath).length);
			} else {
				paginatorCollection[i].setNumberOfPages(0);
			}
			// Bind
			// paginatorCollection[i].bindPath ="/d/results/0" +"/" ;
		}
		return paginatorCollection;
	} else {
		return elementCollection;
	}
};
