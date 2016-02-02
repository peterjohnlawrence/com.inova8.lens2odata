jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.commons.Panel");
jQuery.sap.require("sap.ui.layout.form.GridLayout");
jQuery.sap.require("sap.ui.layout.form.FormContainer");
jQuery.sap.require("sap.ui.layout.form.Form");
jQuery.sap.require("sap.ui.commons.Paginator");
jQuery.sap.declare("Components.queryPreviewForm.Component");

sap.ui.core.UIComponent.extend("Components.queryPreviewForm.Component", {

	metadata : {
		// manifest : "json",
		properties : {
			title : "string",
			metaModel : "object",
			viewModel : "object",
			query : "string"
		}
	}
});

Components.queryPreviewForm.Component.prototype.createContent = function() {
	var self = this;
	this.oFormPanel = new sap.ui.commons.Panel({
		title : new sap.ui.core.Title().setText((jQuery.isEmptyObject(self.getProperty("title"))) ? "Query Preview Form" : self.getProperty("title")),
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
Components.queryPreviewForm.Component.prototype.renderDisplay = function(viewModel) {
	var self = this;
	var oViewModel = viewModel || self.getProperty("viewModel");
	self.oFormPanel.getTitle().setText((jQuery.isEmptyObject(self.getProperty("title"))) ? oRecordTemplate.__metadata.type : self.getProperty("title"));
	self.oFormContainer.destroyFormElements();
	self.renderFormFields(oMetaModel, self.oFormContainer, oViewModel.root, "", "", 0);
	return this;
};
Components.queryPreviewForm.Component.prototype.renderFormFields = function(oMetaModel, oFormContainer, oTemplate, sCurrentLabel, sCurrentPath, nRow) {
	var sEntityType;
	var oEntityType;
	var sMetadataPath = (sCurrentPath != "") ? sCurrentPath + "/__metadata/uri" : "__metadata/uri";
	var sMetaLabel = oTemplate.label;
	// Render the form at this level, must be type ="__metadata"
	oFormContainer.insertFormElement(new sap.ui.layout.form.FormElement({
		label : new sap.ui.commons.Label({
			text : sMetaLabel,
			textAlign : "Right",
			layoutData : new sap.ui.layout.form.GridElementData({
				hCells : "5"
			})
		}),
		fields : new sap.ui.commons.Link().bindProperty("text", {
			path : sMetadataPath
		}).bindProperty("href", {
			path : sMetadataPath
		}),
		layoutData : new sap.ui.layout.form.GridElementData({
			hCells : "auto"
		})
	}), nRow);
	// Iterate through the dependent clauses and render them
	nRow++;
	var column = 0;
	while (!jQuery.isEmptyObject(oTemplate[column])) {
		var sLabel = oTemplate[column].label || oTemplate[column].keyVariable;
		var sPath = (sCurrentPath == "") ? oTemplate[column].field : sCurrentPath + "/" + oTemplate[column].field;
		if (oTemplate[column] != null) {
			if (!jQuery.isEmptyObject(oTemplate[column][0])) {
				// Must be a compound column so iterate through these as well
				nRow = this.renderFormFields(oMetaModel, oFormContainer, oTemplate[column], sLabel, sPath, column + nRow);
			} else if (!jQuery.isEmptyObject(oTemplate[column].results)) {
				// Must be a repeating record set
			} else if (!jQuery.isEmptyObject(oTemplate[column].__deferred)) {
				// Must be a deferred column
			} else {
				// Should format according to type found in metadata
				nRow++;
				var oFormElement = new sap.ui.layout.form.FormElement({
					label : new sap.ui.commons.Label({
						text : sLabel,
						textAlign : "Right",
						layoutData : new sap.ui.layout.form.GridElementData({
							hCells : "5"
						})
					}),
					layoutData : new sap.ui.layout.form.GridElementData({
						hCells : "auto"
					})
				});
				oFormContainer.insertFormElement(oFormElement, nRow);
				if (oTemplate[column].type == "__metadata") {
					oFormElement.insertField(new sap.ui.commons.Link().bindProperty("text", {
						path : sPath + "/__metadata/uri"
					}).bindProperty("href", {
						path : sPath + "/__metadata/uri"
					}));
				} else if (oTemplate[column].type == "Edm.DateTime") {
					oFormElement.insertField(new sap.ui.commons.TextView({
						text : {
							path : sPath,
							formatter : function(value) {
								if (value != null) {
									return new Date(parseInt(value.substr(6)));
								} else {
									return null;
								}
							}
						}
					}));
				} else {
					oFormElement.insertField(new sap.ui.commons.TextView().bindProperty("text", {
						path : sPath,
						type : new sap.ui.model.type.String()
					}));
				}
			}
		} else {
			// TODO Null value, is this required
		}
		column++;
	}
	return nRow
};
Components.queryPreviewForm.Component.prototype.renderResults = function(query) {
	var self = this;
	var odataResults = new sap.ui.model.json.JSONModel({});
	var odataURL = query || self.getProperty("query");
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
						sBindPath = "/d/0";
					} else {
						throw "No results returned";
					}
				} else {
					nResults = odataResults.getData().d.results.length;
					oRecordTemplate = odataResults.getData().d.results[0];
					sBindPath = "/d/results/0";
				}
				self.oFormPanel.getTitle().setText((jQuery.isEmptyObject(self.getProperty("title"))) ? oRecordTemplate.__metadata.type : self.getProperty("title"));
				self.oFormPanel.setModel(odataResults);
				self.oForm.bindElement(sBindPath);
				self.oPaginator.setNumberOfPages(nResults);
			} catch (err) {
				self.oFormPanel.getTitle().setText(err);
			}
		} else {
			// Failed request
			self.oFormPanel.getTitle().setText(JSON.stringify(oEvent.getParameter("errorobject")));
			self.oFormContainer.destroyFormElements();
		}
	});
	return this;
};