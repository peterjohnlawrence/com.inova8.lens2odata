jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.commons.Panel");
jQuery.sap.require("lib.utilities");
jQuery.sap.declare("Components.lensPanel.Component");
"use strict";
sap.ui.core.UIComponent.extend("Components.lensPanel.Component", {

	metadata : {
		// manifest : "json",
		properties : {
			_fragmentModel : "object",
			serviceCode : "string",
			page : {
				type : "string",
				defaultValue : "[default]"
			},
			query : {
				type : "object"
			}
		}
	}
});
Components.lensPanel.Component.prototype.createContent = function() {
	var self = this;
	this.oIconTabBar = new sap.m.IconTabBar();
	return this.oIconTabBar.setExpanded(true).setExpandable(false);
};
Components.lensPanel.Component.prototype.renderFragments = function() {
	// this.oIconTabBar.removeAllItems();
	this.oIconTabBar.destroyItems();
	this.oIconTabBar.destroyContent();
	var oLensesModel = sap.ui.getCore().getModel("lensesModel");
	var fragmentPath = "/lenses";
	var oLens;
	var oLensType = oLensesModel.getData()["lenses"][this.getQuery().type];
	if (jQuery.isEmptyObject(oLensType)) {
		oLensType = oLensesModel.getData()["lenses"]["[defaultEntityType]"]
		fragmentPath = fragmentPath + "/[defaultEntityType]";
	} else {
		fragmentPath = fragmentPath + "/" + this.getQuery().type;
	}
	var oLensTypePages = this.getQuery().deferred ? oLensType["entitySet"] : oLensType["entity"];
	if (this.getQuery().deferred) {
		fragmentPath = fragmentPath + "/entitySet";
		oLensTypePages = oLensType["entitySet"];
		if (jQuery.isEmptyObject(oLensTypePages)) {
			oLensTypePages = oLensesModel.getData()["lenses"]["[defaultEntityType]"]["entitySet"];
		}
		var deferredUri = utils.parseDeferredUri(this.getQuery().uri);
		this.fragmentBindings = {
			serviceCode : this.getServiceCode(),
			uri : this.getQuery().uri,
			entityType : this.getQuery().type,
			entity : deferredUri.entity,
			navigationProperty : deferredUri.navigationProperty,
			page : this.getPage()
		}
	} else {
		fragmentPath = fragmentPath + "/entity";
		oLensTypePages = oLensType["entity"];
		if (jQuery.isEmptyObject(oLensTypePages)) {
			oLensTypePages = oLensesModel.getData()["lenses"]["[defaultEntityType]"]["entity"];
		}
		var metadatadUri = utils.parseMetadataUri(this.getQuery().uri);
		this.fragmentBindings = {
			serviceCode : this.getServiceCode(),
			uri : this.getQuery().uri,
			entityType : this.getQuery().type,
			entity : metadatadUri.entity,
			page : this.getPage()
		}
	}
	for ( var lens in oLensTypePages) {
		var pageContextPath=fragmentPath+"/"+lens;
		var oLens = oLensTypePages[lens];
		var oContent = sap.ui.getCore().getModel("lensesModel").getData()["templates"][oLens.template];
		this.setProperty("_fragmentModel", oLens["fragments"]);
		oTabContent = new sap.ui.layout.Splitter({
			height : "1200px"
		});
		oTabContent.addContentArea(this.displayContent(oContent,pageContextPath,oLens.template));
		var oTabPanel = new sap.m.Panel({
			width : "100%",
			height : "auto",
			showCollapseIcon : false,
			borderDesign : sap.ui.commons.enums.BorderDesign.Box

		});
		this.oIconTabBar.addItem(new sap.m.IconTabFilter({
			text : lens,
			content : oTabContent,
			visible : true
		}));
	}
	// Should be set to the default defined
	this.oIconTabBar.setSelectedKey(0);
};
Components.lensPanel.Component.prototype.displayContent = function(oContent,pageContextPath,template) {
	var self = this;
	if (oContent.type === "columns") {
		var oHorizontalSplitter = new sap.ui.layout.Splitter();
		oHorizontalSplitter.setOrientation(sap.ui.core.Orientation.Horizontal);
		// oHorizontalSplitter.setWidth((jQuery.isEmptyObject(oContent.width)) ? "100%" : oContent.width);
		// oHorizontalSplitter.setHeight((jQuery.isEmptyObject(oContent.height)) ? "100%" : oContent.height);
		for (var oLensColumn = 0; oLensColumn < oContent["columns"].length; oLensColumn++) {
			var oCurrentContent = this.displayContent(oContent["columns"][oLensColumn]["content"],pageContextPath,template);
			// oCurrentContent could be a collection/array
			if (Array.isArray(oCurrentContent)) {
				var oContentSplitter = new sap.ui.layout.Splitter({
					orientation : sap.ui.core.Orientation.Vertical
				// height : "800px"
				});
				for (var i = 0, len = oCurrentContent.length; i < len; i++)
					oContentSplitter.addContentArea(oCurrentContent[i]);
				oHorizontalSplitter.addContentArea(oContentSplitter);
			} else if(!jQuery.isEmptyObject(oCurrentContent)) {
				oHorizontalSplitter.addContentArea(oCurrentContent);
			}
		}
		return oHorizontalSplitter.setLayoutData(new sap.ui.layout.SplitterLayoutData({
			resizable : true,
			minSize : 200,
			size : "auto"
		}));
	} else if (oContent.type === "rows") {
		var oVerticalSplitter = new sap.ui.layout.Splitter();
		oVerticalSplitter.setOrientation(sap.ui.core.Orientation.Vertical);
		// oVerticalSplitter.setWidth((jQuery.isEmptyObject(oContent.width)) ? "100%" : oContent.width);
		// oVerticalSplitter.setHeight((jQuery.isEmptyObject(oContent.height)) ? "100%" : oContent.height);
		for (var oLensRow = 0; oLensRow < oContent["rows"].length; oLensRow++) {
			var oCurrentContent = this.displayContent(oContent["rows"][oLensRow]["content"],pageContextPath,template);
			// oCurrentContent could be a collection/array
			if (Array.isArray(oCurrentContent)) {
				var oContentSplitter = new sap.ui.layout.Splitter({
					orientation : sap.ui.core.Orientation.Horizontal
				// height : "800px"
				});
				for (var i = 0, len = oCurrentContent.length; i < len; i++)
					oContentSplitter.addContentArea(oCurrentContent[i]);
				oVerticalSplitter.addContentArea(oContentSplitter);
			} else if(!jQuery.isEmptyObject(oCurrentContent)) {
				oVerticalSplitter.addContentArea(oCurrentContent);
			}
		}
		return oVerticalSplitter.setLayoutData(new sap.ui.layout.SplitterLayoutData({
			resizable : true,
			minSize : 200,
			size : "auto"
		}));
	} else if (oContent.type === "lens") {
		var oFragments = utils.lookup(this.getProperty("_fragmentModel"), "position", oContent.id);
		if (!jQuery.isEmptyObject(oFragments)) {
			oComponentContainers = [];
			for (var i = 0, len = oFragments.length; i < len; i++) {
				var oFragment = oFragments[i];
				var queryUri = utils.bindStringToValues(oFragment.query, this.fragmentBindings)
				var service = sap.ui.getCore().getModel("queryModel").getData().services[this.getProperty("serviceCode")];
				var oComponent = sap.ui.getCore().createComponent({
					name : oFragment.type,
					settings : {
						template:template,
						fragment : oFragment,
						title : utils.bindStringToValues(oFragment.title, self.fragmentBindings),
						query : queryUri,
						serviceCode : self.getProperty("serviceCode")
					}
				});
				oComponent.setBindingContext(new sap.ui.model.Context(sap.ui.getCore().getModel("lensesModel"), pageContextPath+"/fragments/"+i), "lensesModel")
				var oComponentContainer = new sap.ui.core.ComponentContainer({
					component : oComponent,
					propagateModel : true
				});
				oComponentContainer.addStyleClass("tile");
				oComponentContainer.setLayoutData(new sap.ui.layout.SplitterLayoutData({
					resizable : true,
					minSize : 200,
					size : "auto"
				}));
				oComponentContainers.push(oComponentContainer);

				utils.getCachedOdataModel(service, function() {
					sap.ui.MessageToast("lens.invalidService");
				}, function(odataModel, oComponent) {
					oComponent.setMetaModel(odataModel.getMetaModel());
					// Now we can render the results because the model is available
					oComponent.renderResults();
				}, oComponent);
			}
			return oComponentContainers;
		} else {
			return null;
//			var oPanel = new sap.ui.commons.Panel({
//				title : new sap.ui.core.Title().setText(oContent.id),
//				width : "100%",
//				showCollapseIcon : false,
//				borderDesign : sap.ui.commons.enums.BorderDesign.Box,
//				areaDesign : sap.ui.commons.enums.AreaDesign.Plain,
//				applyContentPadding : true,
//				height : "250px"
//			});
//			oPanel.addButton(new sap.ui.commons.Button({
//				icon : sap.ui.core.IconPool.getIconURI("settings"),
//				press : function(oEvent) {
//					sap.m.MessageToast.show("settings for " + oContent.id)
//				}
//			}));
//			oPanel.addStyleClass("tile");
//			return oPanel.setLayoutData(new sap.ui.layout.SplitterLayoutData({
//				resizable : true,
//				minSize : 200,
//				size : "auto"
//			}));
		}
	}
};
