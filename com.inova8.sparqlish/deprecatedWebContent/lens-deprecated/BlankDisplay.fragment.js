//jQuery.sap.require("sap.ui.commons.enums"); 
sap.ui.jsfragment("lens.BlankDisplay", {
	destroyContent : function() {
   	sap.ui.commons.Panel(this.createId("fragmentPanel")).destroy();
   },
	createContent : function(oController) {
	
		var oBlankDisplayPanel = new sap.ui.commons.Panel(this.createId("fragmentPanel"), {

		   width :"100%",
		   height : "100%",
		  // borderdesign: sap.ui.commons.enums.BorderDesign.Box 
		});
		
	return oBlankDisplayPanel;
	}
});