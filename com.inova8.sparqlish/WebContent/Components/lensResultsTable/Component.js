jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.table.Table");
jQuery.sap.declare("Components.lensResultsTable.Component");
"use strict";
sap.ui.core.UIComponent.extend("Components.lensResultsTable.Component", {

	metadata : {
		// manifest : "json",
		properties : {
			title : "string",
			metaModel : "object",
			query : "string",
			serviceCode : "string"
		}
	}
});

Components.lensResultsTable.Component.prototype.createContent = function() {
	this.oTablePanel = new sap.ui.commons.Panel({
		title : new sap.ui.core.Title(),
		width : "100%",
		showCollapseIcon : false,
		borderDesign : sap.ui.commons.enums.BorderDesign.Box
	});

	this.oTable = new sap.ui.table.Table({
		// title : "empty so far",
		showNoData : true,
		noData : new sap.m.Text({
			text : "{i18nModel>lensResultsTable.noData}"
		}),
		editable : false,
		// columnHeaderHeight : 10,
		// enableGrouping : true,
		visibleRowCount : 10,
		selectionMode : "MultiToggle",
		enableSelectAll : true,
		enableBusyIndicator : true,
		navigationMode : sap.ui.table.NavigationMode.Paginator,
		fixedColumnCount : 1
	});

	return this.oTablePanel.addContent(this.oTable);
};

Components.lensResultsTable.Component.prototype.renderResults = function(query, serviceCode) {
	var self = this;
	self.setProperty("serviceCode", serviceCode || self.getProperty("serviceCode"));
	var odataResults = new sap.ui.model.json.JSONModel({});
	var odataURL = query || self.getProperty("query");
	if (!jQuery.isEmptyObject(odataURL)) {
		self.oTable.setBusy(true).setBusyIndicatorDelay(0);
		odataResults.loadData(utils.proxyUrl(odataURL));
		odataResults.attachRequestCompleted(function(oEvent) {
			if (oEvent.getParameter("success")) {
				try {
					var nResults = 0;
					var bResults = true;
					var oRecordTemplate = null;
					var sBindPath = null;
					var sCurrentPath = "";
				//	if (jQuery.isEmptyObject(odataResults.getData().d.results  )) {
					if (typeof odataResults.getData().d.results  !== "object" ) {
						if (odataResults.getData().d.length > 0) {
							oRecordTemplate = odataResults.getData().d[0];
							sBindPath = "/d";
						} else {
							oRecordTemplate = odataResults.getData().d;
							sBindPath = "/";// "/d";
							bResults = false;
							sCurrentPath = "";
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
					self.oTablePanel.getTitle().setText((jQuery.isEmptyObject(self.getProperty("title"))) ? oRecordTemplate.__metadata.type : self.getProperty("title"));
					self.oTable.setModel(odataResults);
					var oMetaModel = self.getMetaModel();
					var oPrimaryEntityType = oMetaModel.getODataEntityType(oRecordTemplate.__metadata.type);
					self.oTable.destroyColumns();
					self.bindTableColumns(self.getProperty("metaModel"), self.oTable, oRecordTemplate, oPrimaryEntityType.name, sCurrentPath, bResults);
					self.oTable.bindRows(sBindPath);
				} catch (err) {
					sap.m.MessageToast.show(err);
					self.oTable.destroyColumns();
					self.oTable.setBusy(false);
				}
			}
			self.oTable.setBusy(false);
		}).attachRequestFailed(function(oEvent) {
			if (oEvent.getParameter("statusCode") == 404) {
				sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("lensResultsTable.queryNoDataFound"));
			} else {
				sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("lensResultsTable.queryResponseError") + oEvent.getParameter("statusText"));
			}
			self.oTable.setBusy(false);
		});
	} else {
		sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("lensResultsTable.queryUndefined"));
	}
	return this;
};
Components.lensResultsTable.Component.prototype.bindTableColumns = function(oMetaModel, oTable, oTemplate, sCurrentLabel, sCurrentPath, bResults) {
	var self = this;
	bResults = typeof bResults === 'undefined' ? true : bResults;
	var sEntityType;
	var oEntityType;
	if (!jQuery.isEmptyObject(oTemplate.__metadata)) {
		sEntityType = oTemplate.__metadata.type;
		oEntityType = oMetaModel.getODataEntityType(sEntityType);
	}
	for ( var column in oTemplate) {
		if (column == "__metadata") {

			if (!jQuery.isEmptyObject(oTemplate[column].uri)) {
				var sPathPrefix = (sCurrentPath != "") ? sCurrentPath + "/" : "";
				var sMetadataPath = (sCurrentPath != "") ? sCurrentPath + "/__metadata/uri" : "__metadata/uri";
				var sLabel = oEntityType["com.sap.vocabularies.Common.v1.Label"] ? oEntityType["com.sap.vocabularies.Common.v1.Label"].String : column;
				var sTooltip = oEntityType["com.sap.vocabularies.Common.v1.QuickInfo"] ? oEntityType["com.sap.vocabularies.Common.v1.QuickInfo"].String : sLabel;
				oTable.addColumn(new sap.ui.table.Column({
					label : new sap.ui.commons.Label({
						text : sLabel,
						textAlign : "Center"
					}),
					flexible : false,
					resizable : true,
					autoResizable : false,
					width : utils.columnWidth(utils.lensUriLabel(oTemplate.__metadata.uri)),
					sortProperty : sLabel,
					filterProperty : sLabel,
					template : new sap.m.Link({
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
					})
				}));
			} else {
				// TODO Must be a complex type. Need to add values for each filed of complex type if available
				// oMetaModel.getODataComplexType(sEntityType)
			}

		} else {
			var sLabel = ":" + column;// (sCurrentLabel == "") ? column : sCurrentLabel + ":" + column;
			var sPath = (sCurrentPath == "") ? column : sCurrentPath + "/" + column;
			if (!jQuery.isEmptyObject(oTemplate[column])) {
				if (!jQuery.isEmptyObject(oTemplate[column].__metadata)) {
					// Must be a compound column so iterate through these as well
					this.bindTableColumns(oMetaModel, oTable, oTemplate[column], sLabel, sPath);
				} else if (!jQuery.isEmptyObject(oTemplate[column].results)) {
					// Must be a repeating record set
					var oInnerTemplate = oTemplate[column].results[0];
					var oInnerTable = new sap.ui.table.Table({
						columnHeaderHeight : 3,
						editable : false,
						selectionMode : "None",
						enableSelectAll : false,
						showNoData : true,
						visibleRowCount : 2,
						navigationMode : sap.ui.table.NavigationMode.Paginator,
						fixedColumnCount : 1
					}).bindRows(sPath + "/results");
					this.bindTableColumns(oMetaModel, oInnerTable, oInnerTemplate, column, "");
					oTable.addColumn(new sap.ui.table.Column({
						label : new sap.ui.commons.Label({
							text : sLabel,
							textAlign : "Center",
							width : "100%"
						}),
						flexible : false,
						resizable : true,
						autoResizable : true,
						width : "100%",
						template : oInnerTable
					}));
				} else if (!jQuery.isEmptyObject(oTemplate[column].__deferred)) {
					// var contents = oTemplate[column].__deferred;
					var oProperty = oMetaModel.getODataInheritedNavigationProperty(oEntityType, column);
					sLabel = oProperty["com.sap.vocabularies.Common.v1.Heading"] ? oProperty["com.sap.vocabularies.Common.v1.Heading"].String : column;
					sTooltip = oProperty["com.sap.vocabularies.Common.v1.QuickInfo"] ? oProperty["com.sap.vocabularies.Common.v1.QuickInfo"].String : column;
					oTable.addColumn(new sap.ui.table.Column({
						label : new sap.ui.commons.Label({
							text : sLabel,
							textAlign : "Center",
							width : "100%"
						}),
						flexible : false,
						resizable : true,
						autoResizable : true,
						width : utils.columnWidth(utils.lensUriLabel(oTemplate[column].__deferred.uri), sLabel),
						sortProperty : sPath + "/__deferred/uri",
						filterProperty : sPath + "/__deferred/uri",
						template : new sap.m.Link({
							tooltip : sTooltip
						}).bindProperty("text", {
							parts : [ {
								path : sPath + "/__deferred/uri",
								type : new sap.ui.model.type.String()
							} ],
							formatter : function(uri) {
								return utils.lensDeferredUriLabel(uri);
							},
							tooltp : sTooltip
						}).bindProperty("href", {
							parts : [ {
								path : sPath + "/__deferred/uri",
								type : new sap.ui.model.type.String()
							} ],
							formatter : function(uri) {
								return utils.lensDeferredUri(uri, self.getProperty("serviceCode"));
							}
						})
					}));
				} else {
					this.columnFormatter(oTable, oMetaModel, oEntityType, column, sPath);
				}
			} else {
				this.columnFormatter(oTable, oMetaModel, oEntityType, column, sPath);
			}
		}
	}
};
Components.lensResultsTable.Component.prototype.columnFormatter = function(oTable, oMetaModel, oEntityType, column, sPath) {
	var oProperty;
	var iLen;
	var sWidth;
	var sLabel;
	var sTooltip;
	try {
		oProperty = oMetaModel.getODataInheritedProperty(oEntityType, column);
		iLen = oProperty.maxLength;
		iLen = iLen ? parseInt(iLen, constants.DEFAULTTABLECOLUMNWIDTH) : constants.DEFAULTTABLECOLUMNWIDTH;
		sWidth = (iLen >= constants.DEFAULTTABLECOLUMNWIDTH ? (iLen > 50 ? 15 : constants.DEFAULTTABLECOLUMNWIDTH) : 5) + "rem";
		sLabel = oProperty["com.sap.vocabularies.Common.v1.Heading"] ? oProperty["com.sap.vocabularies.Common.v1.Heading"].String : column;
		sTooltip = oProperty["com.sap.vocabularies.Common.v1.QuickInfo"] ? oProperty["com.sap.vocabularies.Common.v1.QuickInfo"].String : column;
	} catch (e) {
		throw "getODataProperty" + ":" + oEntityType + ":" + column;
	}
	switch (oProperty.type) {
	case "Edm.DateTime":
		oTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : sLabel,
				textAlign : "Center",
				width : "100%"
			}),
			flexible : false,
			resizable : true,
			autoResizable : true,
			width : sWidth,
			sortProperty : sPath,
			filterProperty : sPath,
			hAlign : "Begin",
			template : new sap.m.Text({
				text : {
					path : sPath,
					formatter : utils.edmDateTimeFormatter
				},
				tooltip : sTooltip
			})
		}));
		break;
	case "Edm.Time":
		oTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : sLabel,
				textAlign : "Center",
				width : "100%"
			}),
			flexible : false,
			resizable : true,
			autoResizable : true,
			width : sWidth,
			sortProperty : sPath,
			filterProperty : sPath,
			hAlign : "Begin",
			template : new sap.m.Text({
				text : {
					path : sPath,
					formatter : utils.edmTimeFormatter
				},
				tooltip : sTooltip
			})
		}));
		break;
	case "Edm.Int":
	case "Edm.Int16":
	case "Edm.Int32":
	case "Edm.Int64":
	case "Edm.Decimal":
	case "Edm.Double":
	case "Edm.Byte":
	case "Edm.SByte":
		oTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : sLabel,
				textAlign : "Center",
				width : "100%"
			}),
			flexible : false,
			resizable : true,
			autoResizable : true,
			width : sWidth,
			sortProperty : sPath,
			filterProperty : sPath,
			hAlign : "End",
			template : new sap.m.Text({
				wrapping : true,
				tooltip : sTooltip
			}).bindProperty("text", {
				path : sPath,
				type : new sap.ui.model.type.String()
			})
		}));
		break;
	case "Edm.Binary":
		oTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : sLabel,
				textAlign : "Center",
				width : "100%"
			}),
			flexible : false,
			resizable : true,
			autoResizable : true,
			width : sWidth,
			sortProperty : sPath,
			filterProperty : sPath,
			hAlign : "End",
			template : new sap.m.Text({
				wrapping : true,
				tooltip : sTooltip
			})
		// .bindProperty("text", {
		// path : sPath,
		// type : new sap.ui.model.type.String()
		// })
		}));
		break;
	default:
		oTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : sLabel,
				textAlign : "Center",
				width : "100%"
			}),
			flexible : false,
			resizable : true,
			autoResizable : true,
			width : sWidth,
			sortProperty : sPath,
			filterProperty : sPath,
			hAlign : "Begin",
			template : new sap.m.Text({
				wrapping : true,
				tooltip : sTooltip
			}).bindProperty("text", {
				path : sPath,
				type : new sap.ui.model.type.String()
			})
		}));
	}
};
