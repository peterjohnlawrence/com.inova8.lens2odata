jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.commons.Panel");
jQuery.sap.declare("Components.lensPanel.Component");
"use strict";
sap.ui.core.UIComponent.extend("Components.lensPanel.Component", {

	metadata : {
		// manifest : "json",
		properties : {
			_fragmentModel : "object",
			serviceCode : "string",
			role : {
				type : "string",
				defaultValue : "{default}"
			},
			query : {
				type : "object"
			}
		}
	}
});
Components.lensPanel.Component.prototype.createContent = function() {
	var self = this;
	this.oLensPanel = new sap.ui.commons.Panel({
		title : new sap.ui.core.Title().setText("Lens Panel"),
		showCollapseIcon : false,
		width : "100%",
		height : "1000px"
	});
	return this.oLensPanel;
};
Components.lensPanel.Component.prototype.setConfig = function(sConfig) {
	var self = this;
	this.oLensPanel = new sap.ui.commons.Panel({
		title : new sap.ui.core.Title().setText("Lens Panel"),
		width : "100%",
		height : "1000px"
	});
	return this.oLensPanel;
};
Components.lensPanel.Component.prototype.renderFragments = function() {
	// Check sConfig to see if it has changed

	this.oLensPanel.removeAllContent();
	var oLensesModel = sap.ui.getCore().getModel("lensesModel");
	var oLens;
	if (this.getQuery().deferred) {
		oLens = oLensesModel.getData()["lenses"][this.getRole()]["{deferred}"];
		var deferredUri =utils.parseDeferredUri(this.getQuery().uri);
	  this.fragmentBindings ={serviceCode:this.getServiceCode(),uri:this.getQuery().uri, entityType:deferredUri.entityType, entity:deferredUri.entity ,navigationProperty:deferredUri.navigationProperty,role:this.getRole()}
	} else {
		oLens = oLensesModel.getData()["lenses"][this.getRole()][this.getQuery().type];
		if (jQuery.isEmptyObject(oLens))
			oLens = oLensesModel.getData()["lenses"][this.getRole()]["{default}"];
		var metadatadUri =utils.parseMetadataUri(this.getQuery().uri);
		this.fragmentBindings ={serviceCode:this.getServiceCode(),uri:this.getQuery().uri,entityType:this.getQuery().type, entity:metadatadUri.entity,role:this.getRole()}
	}
	var oContent = sap.ui.getCore().getModel("lensesModel").getData()["templates"][oLens.template];
	//this.oLensPanel.getTitle().setText("Default lens for " + this.getQuery().type);

	
	this.oLensPanel.getTitle().setText(utils.bindStringToValues(oLens.title,this.fragmentBindings));
	this.setProperty("_fragmentModel", oLens["fragments"]);
	this.oLensPanel.addContent(this.displayContent(oContent));
};
Components.lensPanel.Component.prototype.displayContent = function(oContent) {
	var self = this;
	if (oContent.type === "columns") {
		var oHorizontalSplitter = new sap.ui.layout.Splitter();
		oHorizontalSplitter.setOrientation(sap.ui.core.Orientation.Horizontal);
		oHorizontalSplitter.setWidth((jQuery.isEmptyObject(oContent.width)) ? "100%" : oContent.width);
		oHorizontalSplitter.setHeight((jQuery.isEmptyObject(oContent.height)) ? "100%" : oContent.height);
		for (var oLensColumn = 0; oLensColumn < oContent["columns"].length; oLensColumn++) {
			var oCurrentContent = this.displayContent(oContent["columns"][oLensColumn]["content"]);
			// oCurrentContent could be a collection/array
			if (Array.isArray(oCurrentContent)) {
				var oContentSplitter = new sap.ui.layout.Splitter({
					orientation : sap.ui.core.Orientation.Vertical,
					width : "auto"
				});
				for (var i = 0, len = oCurrentContent.length; i < len; i++)
					oContentSplitter.addContentArea(oCurrentContent[i]);
				oHorizontalSplitter.addContentArea(oContentSplitter);
			} else {
				oHorizontalSplitter.addContentArea(oCurrentContent);
			}
		}
		return oHorizontalSplitter;
	} else if (oContent.type === "rows") {
		var oVerticalSplitter = new sap.ui.layout.Splitter();
		oVerticalSplitter.setOrientation(sap.ui.core.Orientation.Vertical);
		oVerticalSplitter.setWidth((jQuery.isEmptyObject(oContent.width)) ? "100%" : oContent.width);
		oVerticalSplitter.setHeight((jQuery.isEmptyObject(oContent.height)) ? "100%" : oContent.height);
		for (var oLensRow = 0; oLensRow < oContent["rows"].length; oLensRow++) {
			var oCurrentContent = this.displayContent(oContent["rows"][oLensRow]["content"]);
			// oCurrentContent could be a collection/array
			if (Array.isArray(oCurrentContent)) {
				var oContentSplitter = new sap.ui.layout.Splitter({
					orientation : sap.ui.core.Orientation.Horizontal,
					height : "auto"
				});
				for (var i = 0, len = oCurrentContent.length; i < len; i++)
					oContentSplitter.addContentArea(oCurrentContent[i]);
				oVerticalSplitter.addContentArea(oContentSplitter);
			} else {
				oVerticalSplitter.addContentArea(oCurrentContent);
			}
		}
		return oVerticalSplitter;
	} else if (oContent.type === "lens") {
		// var oFragment = this.getProperty("_fragmentModel")[oContent.id];
		var oFragments = utils.lookup(this.getProperty("_fragmentModel"), "position", oContent.id); // this.getProperty("_fragmentModel").lookup("position",
		// oContent.id);
		if (!jQuery.isEmptyObject(oFragments)) {
			oComponentContainers = [];
			for (var i = 0, len = oFragments.length; i < len; i++) {
				var oFragment = oFragments[i];
				//var queryUri = oFragment.query;
				
				var queryUri =utils.bindStringToValues(oFragment.query, this.fragmentBindings) 
				//if (queryUri === "{uri}")		queryUri = this.getQuery().uri;
				var service = sap.ui.getCore().getModel("serviceQueriesModel").getData().services[this.getProperty("serviceCode")];
				utils.getCachedOdataModel(service, function() {
					sap.ui.MessageToast("lens.invalidService");
				}, function(odataModel) {
					var oComponent = sap.ui.getCore().createComponent({
						name : oFragment.type,
						settings : {
							title : utils.bindStringToValues(oFragment.title,self.fragmentBindings) ,
							query : queryUri,
							metaModel : odataModel.getMetaModel(),
							serviceCode : self.getProperty("serviceCode")
						// oMetaModel
						}
					});
					var oComponentContainer = new sap.ui.core.ComponentContainer({
						component : oComponent,
						propagateModel : true
					});
					oComponentContainer.addStyleClass("tile");
					oComponent.renderResults();
					oComponentContainers.push(oComponentContainer);
				});
			}
			return oComponentContainers;
		} else {
			var oPanel = new sap.ui.commons.Panel({
				title : new sap.ui.core.Title().setText(oContent.id),
				width : "100%",
				showCollapseIcon : false,
				borderDesign : sap.ui.commons.enums.BorderDesign.Box,
				areaDesign : sap.ui.commons.enums.AreaDesign.Plain,
				applyContentPadding : true,
				height : "250px"
			});
			oPanel.addButton(new sap.ui.commons.Button({
				icon : sap.ui.core.IconPool.getIconURI("settings"),
				press : function(oEvent) {
					sap.m.MessageToast.show("settings for " + oContent.id)
				}
			}));
			oPanel.addStyleClass("tile");
			return oPanel;
		}
	}
};
