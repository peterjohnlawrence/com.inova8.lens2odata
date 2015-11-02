jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.commons.Panel");
jQuery.sap.require("sap.ui.layout.form.GridLayout");
jQuery.sap.require("sap.ui.layout.form.FormContainer");
jQuery.sap.require("sap.ui.layout.form.Form");
jQuery.sap.require("sap.ui.commons.Paginator");
jQuery.sap.declare("Components.queryResultsForm.Component");

sap.ui.core.UIComponent.extend("Components.queryResultsForm.Component", {

	metadata : {
		// manifest : "json",
		properties : {
			title : "string",
			metaModel : "object",
			query:"string"
		}
	}
});

Components.queryResultsForm.Component.prototype.createContent = function() {
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
	this.oPaginator = new sap.ui.commons.Paginator({
		currentPage : 1,
		page : function(oEvent) {
			self.oForm.bindElement("/d/results/" + (parseInt(oEvent.getParameter("targetPage")) - 1).toString());
		}
	});
	this.oPaginator.setNumberOfPages(100);
	this.oFormPanel.addContent(this.oForm);
	this.oFormPanel.addContent(this.oPaginator);
	return this.oFormPanel;
};

// Components.queryResultsForm.Component.prototype.setTitle = function(sTitle) {
// this.oTable.setTitle(sTitle);
// this.setProperty("title", sTitle);
// return this;
// };

Components.queryResultsForm.Component.prototype.renderResults = function(query) {
	var self = this;
	var odataResults = new sap.ui.model.json.JSONModel({});
	var odataURL = query || self.getProperty("query");
	odataResults.loadData(odataURL);
	odataResults.attachRequestCompleted(function() {
		try {
			var oRecordTemplate = odataResults.getData().d.results[0];
			self.oFormPanel.getTitle().setText((jQuery.isEmptyObject(self.getProperty("title"))) ? oRecordTemplate.__metadata.type : self.getProperty("title"));
			self.oFormPanel.setModel(odataResults);
			var primaryType = oRecordTemplate.__metadata.type;
			self.oFormContainer.destroyFormElements();
			self.bindFormFields(oMetaModel, self.oFormContainer, oRecordTemplate, "", "");
			// oFormContainer.insertFormElement(oPaginator);
			self.oForm.bindElement("/d/results/0");
			self.oPaginator.setNumberOfPages(odataResults.getData().d.results.length);
		} catch (err) {
			self.oFormPanel.getTitle().setText("Error");
			self.oFormContainer.destroyFormElements();
		}
	});
	return this;
};
Components.queryResultsForm.Component.prototype.bindFormFields = function(oMetaModel, oFormContainer, oTemplate, sCurrentLabel, sCurrentPath) {
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
					bindFormFields(oMetaModel, oFormContainer, oTemplate[column], sLabel, sPath);
				} else if (!jQuery.isEmptyObject(oTemplate[column].results)) {
					// Must be a repeating record set
					var oInnerTemplate = oTemplate[column].results[0];

					var oInnerPanel = new sap.ui.commons.Panel({
						title : new sap.ui.core.Title().setText(sLabel + " Form"),
						width : "100%"// ,
					// height : "500px"
					});
					var oInnerFormLayout = new sap.ui.layout.form.GridLayout({
						singleColumn : false
					});
					var oInnerFormContainer = new sap.ui.layout.form.FormContainer({
						expandable : true
					});
					var oInnerForm = new sap.ui.layout.form.Form({
						layout : oInnerFormLayout,
						width : "100%",
						formContainers : oInnerFormContainer
					});
					oInnerForm.bindElement(sPath + "/results/0");
					oInnerPaginator = new sap.ui.commons.Paginator({
						currentPage : 1,
						page : function(oEvent) {
							oInnerForm.bindElement(sPath + "/results/" + (parseInt(oEvent.getParameter("targetPage")) - 1).toString());
						}
					});
					oInnerPaginator.setNumberOfPages(100);
					oInnerPanel.addContent(oInnerForm);
					oInnerPanel.addContent(oInnerPaginator);

					bindFormFields(oMetaModel, oInnerFormContainer, oInnerTemplate, "", "");
					oFormContainer.insertFormElement(new sap.ui.layout.form.FormElement({
						label : new sap.ui.commons.Label({
							text : sLabel,
							textAlign : "Right",
							layoutData : new sap.ui.layout.form.GridElementData({
								hCells : "5"
							})
						}),
						fields : oInnerPanel,
						layoutData : new sap.ui.layout.form.GridElementData({
							hCells : "auto"
						})
					}));

				} else if (!jQuery.isEmptyObject(oTemplate[column].__deferred)) {
					var contents = oTemplate[column].__deferred;
					oFormContainer.insertFormElement(new sap.ui.layout.form.FormElement({
						label : new sap.ui.commons.Label({
							text : sLabel,
							textAlign : "Right",
							layoutData : new sap.ui.layout.form.GridElementData({
								hCells : "5"
							})
						}),
						fields : new sap.ui.commons.Link().bindProperty("text", {
							path : sPath + "/__deferred/uri"
						}).bindProperty("href", {
							path : sPath + "/__deferred/uri"
						}),
						layoutData : new sap.ui.layout.form.GridElementData({
							hCells : "auto"
						})
					}));

				} else {
					// Should format according to type found in metadata
					var oProperty = oMetaModel.getODataProperty(oEntityType, column);
					if (oProperty.type == "Edm.DateTime") {
						oFormContainer.insertFormElement(new sap.ui.layout.form.FormElement({
							label : new sap.ui.commons.Label({
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
							label : new sap.ui.commons.Label({
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
					label : new sap.ui.commons.Label({
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
