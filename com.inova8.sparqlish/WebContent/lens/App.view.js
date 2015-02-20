sap.ui.jsview("lens.App", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf lens.App
	*/ 
	getControllerName : function() {
		return "lens.App";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf lens.App
	*/ 
	createContent : function(oController) {
		this.setDisplayBlock(true);
 		return new sap.m.App("lensContainer");
	}

});