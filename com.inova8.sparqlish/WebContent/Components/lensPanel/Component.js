jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.commons.Panel");
jQuery.sap.declare("Components.lensPanel.Component");

sap.ui.core.UIComponent.extend("Components.lensPanel.Component", {

	metadata : {
		// manifest : "json",
		properties : {
			_fragmentModel : "object",
			role : "string",
			concept : "string"
		}
	}
});
Components.lensPanel.Component.prototype.createContent = function() {
	var self = this;
	this.oLensPanel = new sap.ui.commons.Panel({
		title : new sap.ui.core.Title().setText("Lens Panel"),
		width : "100%",
		height : "1000px"
	});
	return this.oLensPanel;
};
Components.lensPanel.Component.prototype.renderFragments = function() {
	this.oLensPanel.removeAllContent();
	var oLensesModel=sap.ui.getCore().getModel("lensesModel");
	var oLens = oLensesModel.getData()["lenses"][this.getRole()][this.getConcept()];
	// var oLens = oLensesModel.getData()["lenses"]["(default)"]["Northwind.Orders"];
	var oContent = sap.ui.getCore().getModel("lensesModel").getData()["templates"][oLens.template];
	this.setProperty("_fragmentModel", oLens["fragments"]);
	this.oLensPanel.addContent(this.displayContent(oContent));
	this.oLensPanel.getTitle().setText(oLens.title);
};
Components.lensPanel.Component.prototype.displayContent = function(oContent) {
	if (oContent.type === "columns") {
		var oHorizontalSplitter = new sap.ui.layout.Splitter();
		oHorizontalSplitter.setOrientation(sap.ui.core.Orientation.Horizontal);
		oHorizontalSplitter.setWidth((jQuery.isEmptyObject(oContent.width)) ? "100%" : oContent.width);
		oHorizontalSplitter.setHeight((jQuery.isEmptyObject(oContent.height)) ? "100%" : oContent.height);
		for (var oLensColumn = 0; oLensColumn < oContent["columns"].length; oLensColumn++) {
			var oCurrentContent = this.displayContent(oContent["columns"][oLensColumn]["content"]);
			// oCurrentContent could be a collection/array
			if (Array.isArray(oCurrentContent)) {
				var oContentSplitter = new sap.ui.layout.Splitter({orientation:sap.ui.core.Orientation.Vertical,width:"auto"});
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
								var oContentSplitter = new sap.ui.layout.Splitter({orientation:sap.ui.core.Orientation.Horizontal,height:"auto"});
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
		var oFragments = this.getProperty("_fragmentModel").lookup("position", oContent.id);

		if (!jQuery.isEmptyObject(oFragments)) {
			oComponentContainers=[];
			for (var i = 0, len = oFragments.length; i < len; i++) {
				var oFragment=oFragments[i];
				var oComponent = sap.ui.getCore().createComponent({
					name : oFragment.type,
					settings : {
						title : oFragment.title,
						query : oFragment.query,
						metaModel : sap.ui.getCore().getModel("metaModel") //oMetaModel
					}
				});
				var oComponentContainer = new sap.ui.core.ComponentContainer({
					component : oComponent,
					propagateModel : true
				});
				oComponentContainer.addStyleClass("tile");
				oComponent.renderResults();
				oComponentContainers.push(oComponentContainer);
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
