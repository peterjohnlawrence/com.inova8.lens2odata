//jQuery.sap.require("sap.ui.commons.enums"); 
sap.ui.jsfragment("lens.ImageDisplay", {
	destroyContent : function() {
   	sap.ui.commons.Panel(this.createId("fragmentPanel")).destroy();
   },
	createContent : function(oController) {
		var lensFragmentId = this.toLocaleString().split("#fragment").slice(-1)[0];
		//var lensFragment = oController.lenses[oController.focus][oController.entityType][lensFragmentId];
		var lensFragment = oController.lenses[oController.focus][oController.entityType].fragments[lensFragmentId];

		var oImageDisplayImage = new sap.ui.commons.Image( {
			src :lensFragment.URL ,
			width :"100%",
		   height : "100%"
		});	
		
		var oImageDisplayPanel = new sap.ui.commons.Panel(this.createId("fragmentPanel"), {
		   title : new sap.ui.core.Title().setText(lensFragment.title),
		   width :"100%",
		   height : "100%",
		  // borderdesign: sap.ui.commons.enums.BorderDesign.Box 
		});
		
		oImageDisplayPanel.addContent(oImageDisplayImage);

		return oImageDisplayPanel;
	}
});