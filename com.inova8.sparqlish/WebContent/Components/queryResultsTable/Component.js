jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.table.Table");
jQuery.sap.declare("Components.queryResultsTable.Component");

sap.ui.core.UIComponent.extend("Components.queryResultsTable.Component", {

	metadata : {
		// manifest : "json",
		properties : {
			title : "string",
			metaModel : "object",
			query:"string"
		}
	}
});

Components.queryResultsTable.Component.prototype.createContent = function() {
	this.oTable = new sap.ui.table.Table({
		title : "empty so far",
		showNoData : true,
		columnHeaderHeight : 10,
		// enableGrouping : true,
		visibleRowCount : 7
	});
	return this.oTable;
};

Components.queryResultsTable.Component.prototype.setTitle = function(sTitle) {
	this.oTable.setTitle(sTitle);
	this.setProperty("title", sTitle);
	return this;
};

Components.queryResultsTable.Component.prototype.renderResults = function(query) {
	var self = this;
	var odataResults = new sap.ui.model.json.JSONModel({});
	var odataURL = query || self.getProperty("query");
	odataResults.loadData(odataURL);
	odataResults.attachRequestCompleted(function() {
		try {
			var oRecordTemplate = odataResults.getData().d.results[0];
			self.oTable.setTitle((jQuery.isEmptyObject(self.getProperty("title"))) ? oRecordTemplate.__metadata.type : self.getProperty("title"));
			self.oTable.setModel(odataResults);
			var primaryType = oRecordTemplate.__metadata.type;
			self.oTable.destroyColumns();
			self.bindTableColumns(self.getProperty("metaModel"), self.oTable, oRecordTemplate, "", "");
			self.oTable.bindRows("/d/results");
		} catch (err) {
			self.oTable.setTitle("Error");
			self.oTable.destroyColumns();
		}
	});
	return this;
};
Components.queryResultsTable.Component.prototype.bindTableColumns = function(oMetaModel, oTable, oTemplate, sCurrentLabel, sCurrentPath) {
	var sEntityType;
	var oEntityType;
	if (!jQuery.isEmptyObject(oTemplate.__metadata)) {
		sEntityType = oTemplate.__metadata.type;
		oEntityType = oMetaModel.getODataEntityType(sEntityType);
	}
	for ( var column in oTemplate) {
		if (column == "__metadata") {
			// ignore metadata column
		} else {
			var sLabel = (sCurrentLabel == "") ? column : sCurrentLabel + ":" + column;
			var sPath = (sCurrentPath == "") ? column : sCurrentPath + "/" + column;
			if (oTemplate[column] != null) {
				if (!jQuery.isEmptyObject(oTemplate[column].__metadata)) {
					// Must be a compound column so iterate through these as well
					bindTableColumns(oMetaModel, oTable, oTemplate[column], sLabel, sPath);
				} else if (!jQuery.isEmptyObject(oTemplate[column].results)) {
					// Must be a repeating record set
					var oInnerTemplate = oTemplate[column].results[0];
					var oInnerTable = new sap.ui.table.Table({
						showNoData : true,
						columnHeaderHeight : 10,
						visibleRowCount : 3
					}).bindRows(sPath + "/results");

					bindTableColumns(oMetaModel, oInnerTable, oInnerTemplate, "", "");
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
					var contents = oTemplate[column].__deferred;
					oTable.addColumn(new sap.ui.table.Column({
						label : sLabel,
						template : new sap.ui.commons.Link().bindProperty("text", sPath + "/__deferred/uri").bindProperty("href", sPath + "/__deferred/uri")
					}));
				} else {
					// Should format according to type found in metadata
					var oProperty = oMetaModel.getODataProperty(oEntityType, column);
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