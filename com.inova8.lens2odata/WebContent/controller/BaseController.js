sap.ui.define([ "sap/ui/core/mvc/Controller", "sap/ui/core/routing/History" ], function(Controller, History) {
	"use strict";
	return Controller.extend("controller.BaseController", {
		getRouter : function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		onNavBack : function(oEvent) {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			window.history.go(-1);
		}
	});
});