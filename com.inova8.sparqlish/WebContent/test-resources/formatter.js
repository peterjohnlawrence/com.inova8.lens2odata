bindFormFields = function(oMetaModel, oFormContainer, oTemplate, sCurrentLabel, sCurrentPath) {
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
					bindFormFields(oMetaModel, bindFormFields, oTemplate[column], sLabel, sPath);
				} else if (!jQuery.isEmptyObject(oTemplate[column].results)) {
					// Must be a repeating record set
					// var oInnerTemplate = oTemplate[column].results[0];
					// var oInnerTable = new sap.ui.table.Table({
					// showNoData : true,
					// columnHeaderHeight : 10,
					// visibleRowCount : 3
					// }).bindRows(sPath + "/results");

					// bindTableColumns(oMetaModel, oInnerTable, oInnerTemplate, "", "");
					// oTable.addColumn(new sap.ui.table.Column({
					// label : sLabel,
					// template : oInnerTable
					// }));
				} else if (!jQuery.isEmptyObject(oTemplate[column].__deferred)) {
					var contents = oTemplate[column].__deferred;
					// oTable.addColumn(new sap.ui.table.Column({
					// label : sLabel,
					// template : new sap.ui.commons.Link().bindProperty("text", sPath + "/__deferred/uri").bindProperty("href",
					// sPath +
					// "/__deferred/uri")
					// }));
				} else {
					// Should format according to type found in metadata
					var oProperty = oMetaModel.getODataProperty(oEntityType, column);
					if (oProperty.type == "Edm.DateTime") {
						oFormContainer.insertFormElement(new sap.ui.layout.form.FormElement({
							label : new sap.m.Label({
								text : sLabel,
								textAlign : "Right",
								layoutData : new sap.ui.layout.form.GridElementData({
									hCells : "5"
								})
							}),
							fields : new sap.ui.commons.TextView({
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
							}),
							layoutData : new sap.ui.layout.form.GridElementData({
								hCells : "auto"
							})
						}));
					} else {
						oFormContainer.insertFormElement(new sap.ui.layout.form.FormElement({
							label : new sap.m.Label({
								text : sLabel,
								textAlign : "Right",
								layoutData : new sap.ui.layout.form.GridElementData({
									hCells : "5"
								})
							}),
							fields : new sap.ui.commons.TextView().bindProperty("text", {
								path : sPath,
								type : new sap.ui.model.type.String()
							}),
							layoutData : new sap.ui.layout.form.GridElementData({
								hCells : "auto"
							})
						}));
					}
				}
			} else {
				oFormContainer.insertFormElement(new sap.ui.layout.form.FormElement({
					label : new sap.m.Label({
						text : sLabel,
						textAlign : "Right",
						layoutData : new sap.ui.layout.form.GridElementData({
							hCells : "5"
						})
					}),
					fields : new sap.ui.commons.TextView().bindProperty("text", {
						path : sPath,
						type : new sap.ui.model.type.String()
					}),
					layoutData : new sap.ui.layout.form.GridElementData({
						hCells : "auto"
					})
				}));
			}
		}
	}
};