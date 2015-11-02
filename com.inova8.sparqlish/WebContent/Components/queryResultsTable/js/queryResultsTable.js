jQuery.sap.require("sap.ui.table.Table");
sap.ui.table.Table.extend("lens.control.queryResultsTable", {
	metadata : {
		properties : {
			metaModel : {
				type : "object"
			}
		},
		events : {},
		aggregations : {}
	},

//	init : function() {
//
//	},
	renderResults : function(odataResults) {
		var oRecordTemplate = odataResults.getData().d.results[0];
		this.setTitle(oRecordTemplate.__metadata.type);
		this.setModel(odataResults);
		var primaryType = oRecordTemplate.__metadata.type;
		this.destroyColumns();
		this.bindTableColumns( this, oRecordTemplate, "", "");
		this.bindRows("/d/results");

	},
	bindTableColumns : function( oTable, oTemplate, sCurrentLabel, sCurrentPath) {
		var sEntityType;
		var oEntityType;
		if (!jQuery.isEmptyObject(oTemplate.__metadata)) {
			sEntityType = oTemplate.__metadata.type;
			oEntityType = this.getMetaModel().getODataEntityType(sEntityType);
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
						bindTableColumns( oTable, oTemplate[column], sLabel, sPath);
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
						var oProperty = this.getMetaModel().getODataProperty(oEntityType, column);
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
					var oProperty = this.getMetaModel().getODataProperty(oEntityType, column);
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
	}
	,
	renderer : function(oRm, oControl) {
//		oRm.renderControl(oControl);
	}
});