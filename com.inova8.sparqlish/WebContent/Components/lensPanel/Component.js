jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.commons.Panel");
jQuery.sap.declare("Components.lensPanel.Component");

sap.ui.core.UIComponent.extend("Components.lensPanel.Component", {

	metadata : {
		// manifest : "json",
		properties : {
			_fragmentModel : "object",
			role: "string",
			concept:"string"
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
	var oLens =oLensesModel.getData()["lenses"]["(default)"]["Northwind.Orders"];
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
		for ( var oLensColumn in oContent["columns"]) {
			var oCurrentContent = this.displayContent(oContent["columns"][oLensColumn]["content"]);
			oHorizontalSplitter.addContentArea(oCurrentContent);
		}
		return oHorizontalSplitter;
	} else if (oContent.type === "rows") {
		var oVerticalSplitter = new sap.ui.layout.Splitter();
		oVerticalSplitter.setOrientation(sap.ui.core.Orientation.Vertical);
		oVerticalSplitter.setWidth((jQuery.isEmptyObject(oContent.width)) ? "100%" : oContent.width);
		oVerticalSplitter.setHeight((jQuery.isEmptyObject(oContent.height)) ? "100%" : oContent.height);
		for ( var oLensRow in oContent["rows"]) {
			var oCurrentContent = this.displayContent(oContent["rows"][oLensRow]["content"]);
			oVerticalSplitter.addContentArea(oCurrentContent);
		}
		return oVerticalSplitter;
	} else if (oContent.type === "lens") {
		var oFragment = this.getProperty("_fragmentModel")[oContent.id];
		if (!jQuery.isEmptyObject(oFragment)) {
			var oComponent = sap.ui.getCore().createComponent({
				name : oFragment.type,
				settings : {
					title : oFragment.title,
					query : oFragment.query,
					metaModel : oMetaModel
				}
			});
			var oComponentContainer = new sap.ui.core.ComponentContainer({
				component : oComponent,
				propagateModel : true
			});
			oComponent.renderResults();
			return oComponentContainer.addStyleClass("tile");
		} else {
			return new sap.ui.commons.Panel(
			{
				title : new sap.ui.core.Title().setText(oContent.id),
				width : "100%",
				showCollapseIcon : false,
				borderDesign : sap.ui.commons.enums.BorderDesign.Box,
				areaDesign : sap.ui.commons.enums.AreaDesign.Plain,
				applyContentPadding : true,
				height : "50px"
			});
		}
	}
};
