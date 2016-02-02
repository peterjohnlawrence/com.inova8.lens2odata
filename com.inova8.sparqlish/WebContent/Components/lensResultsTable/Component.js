jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.table.Table");
jQuery.sap.declare("Components.lensResultsTable.Component");

sap.ui.core.UIComponent.extend("Components.lensResultsTable.Component", {

	metadata : {
		// manifest : "json",
		properties : {
			title : "string",
			metaModel : "object",
			query : "string",
			serviceCode:"string"
		}
	}
});

Components.lensResultsTable.Component.prototype.createContent = function() {
	this.oTable = new sap.ui.table.Table({
		title : "empty so far",
		showNoData : true,
		columnHeaderHeight : 10,
		// enableGrouping : true,
		visibleRowCount : 7
	});
//	this.oTable.getToolbar().addItem(new sap.ui.commons.Button({
//		icon : sap.ui.core.IconPool.getIconURI("settings"),
//		press : function(oEvent) {
//			sap.m.MessageToast.show("settings for table")
//		}
//	}));
	return this.oTable;
};

Components.lensResultsTable.Component.prototype.setTitle = function(sTitle) {
	this.oTable.setTitle(sTitle);
	this.setProperty("title", sTitle);
	return this;
};

Components.lensResultsTable.Component.prototype.renderResults = function(query) {
	var self = this;
	var odataResults = new sap.ui.model.json.JSONModel({});
	var odataURL = query || self.getProperty("query");
	self.oTable.setBusy(true).setBusyIndicatorDelay(0);
	odataResults.loadData(odataURL);
	odataResults.attachRequestCompleted(function(oEvent) {
		if (oEvent.getParameter("success")) {
			try {
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
				self.oTable.getTitle().setText((jQuery.isEmptyObject(self.getProperty("title"))) ? oRecordTemplate.__metadata.type : self.getProperty("title"));
				self.oTable.setModel(odataResults);
				var oPrimaryEntityType = oMetaModel.getODataEntityType(oRecordTemplate.__metadata.type);
				self.oTable.destroyColumns();
				self.bindTableColumns(self.getProperty("metaModel"), self.oTable, oRecordTemplate, oPrimaryEntityType.name, "");
				self.oTable.bindRows(sBindPath);
			} catch (err) {
				self.oTable.setTitle(err);
				self.oTable.destroyColumns();
			}
		} else {
			// Failed request
			self.oTable.getTitle().setText(JSON.stringify(oEvent.getParameter("errorobject")));
			self.oTable.destroyColumns();
		}
		self.oTable.setBusy(false);
	});
	return this;
};
Components.lensResultsTable.Component.prototype.bindTableColumns = function(oMetaModel, oTable, oTemplate, sCurrentLabel, sCurrentPath) {
	var sEntityType;
	var oEntityType;
	if (!jQuery.isEmptyObject(oTemplate.__metadata)) {
		sEntityType = oTemplate.__metadata.type;
		oEntityType = oMetaModel.getODataEntityType(sEntityType);
	}
	for ( var column in oTemplate) {
		if (column == "__metadata") {
			// ignore metadata column
			// var contents = oTemplate[column].__metadata;
			var sMetadataPath = (sCurrentPath != "") ? sCurrentPath + "/__metadata/uri" : "__metadata/uri";
			var sMetaLabel = sCurrentLabel;
			oTable.addColumn(new sap.ui.table.Column({
				label : sMetaLabel,
				template : new sap.ui.commons.Link().bindProperty("text", sMetadataPath).bindProperty("href", sMetadataPath)
			}));
		} else {
			var sLabel = (sCurrentLabel == "") ? column : sCurrentLabel + ":" + column;
			var sPath = (sCurrentPath == "") ? column : sCurrentPath + "/" + column;
			if (oTemplate[column] != null) {
				if (!jQuery.isEmptyObject(oTemplate[column].__metadata)) {
					// Must be a compound column so iterate through these as well
					this.bindTableColumns(oMetaModel, oTable, oTemplate[column], sLabel, sPath);
				} else if (!jQuery.isEmptyObject(oTemplate[column].results)) {
					// Must be a repeating record set
					var oInnerTemplate = oTemplate[column].results[0];
					var oInnerTable = new sap.ui.table.Table({
						showNoData : true,
						columnHeaderHeight : 10,
						visibleRowCount : 3
					}).bindRows(sPath + "/results");

					this.bindTableColumns(oMetaModel, oInnerTable, oInnerTemplate, "", "");
					oTable.addColumn(new sap.ui.table.Column({
						label : sLabel,
						label : sLabel,
						flexible : true,
						resizable : true,
						autoResizable : true,
						width : 'auto',
						sortProperty : sLabel,
						filterProperty : sLabel,
						template : oInnerTable
					}));
				} else if (!jQuery.isEmptyObject(oTemplate[column].__deferred)) {
					// var contents = oTemplate[column].__deferred;
					oTable.addColumn(new sap.ui.table.Column({
						label : sLabel,
						template : new sap.ui.commons.Link().bindProperty("text", sPath + "/__deferred/uri").bindProperty("href", sPath + "/__deferred/uri")
					}));
				} else {
					// Should format according to type found in metadata
					var oProperty
					try {
						oProperty = oMetaModel.getODataProperty(oEntityType, column);
					} catch (e) {
						throw "getODataProperty" + ":" + oEntityType + ":" + column;
					}
					if (oProperty.type == "Edm.DateTime") {
						oTable.addColumn(new sap.ui.table.Column({
							label : sLabel,
							flexible : true,
							resizable : true,
							autoResizable : true,
							width : 'auto',
							sortProperty : sLabel,
							filterProperty : sLabel,
							template : new sap.ui.commons.TextView({
								text : {
									path : sPath,
									formatter : function(value) {
										if (value != null) {
											return new Date(parseInt(value.substr(6)));
										} else {
											return null;
										}
										;
									}
								}
							})
						}));
					} else {
						oTable.addColumn(new sap.ui.table.Column({
							label : sLabel,
							flexible : true,
							resizable : true,
							autoResizable : true,
							width : 'auto',
							sortProperty : sLabel,
							filterProperty : sLabel,
							template : new sap.ui.commons.TextView().bindProperty("text", {
								path : sPath,
								type : new sap.ui.model.type.String()
							})
						}));
					}
				}
			} else {
				var oProperty = oMetaModel.getODataProperty(oEntityType, column);
				// var date = new Date(jsonDate);
				oTable.addColumn(new sap.ui.table.Column({
					label : sLabel,
					flexible : true,
					resizable : true,
					autoResizable : true,
					width : 'auto',
					sortProperty : sLabel,
					filterProperty : sLabel,
					template : new sap.ui.commons.TextView().bindProperty("text", {
						path : sPath,
						type : new sap.ui.model.type.String()
					})
				}));
			}
		}
	}
};