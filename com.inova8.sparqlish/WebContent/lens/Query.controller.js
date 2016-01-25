sap.ui.define([ "controller/BaseController" ], function(BaseController) {
	"use strict";
	return BaseController.extend("lens.Query", {
		onInit : function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("lens").attachMatched(this._onRouteMatched, this);

			var oQueryEditorPreviewTreeTableComponent = sap.ui.getCore().createComponent({
				name : "Components.queryEditorPreviewTreeTable",
				settings : {
					title : "queryEditorPreviewTreeTable",
					serviceQueriesModel :  sap.ui.getCore().getModel("serviceQueriesModel") ,
					i18nModel :  sap.ui.getCore().getModel("i18n"), // i18nModel, // TODO or specific one for this component?
					datatypesModel :  sap.ui.getCore().getModel("datatypesModel") 
				}
			});

			var oQueryEditorPreviewTreeTableComponentContainer = new sap.ui.core.ComponentContainer({
				component : oQueryEditorPreviewTreeTableComponent
			});
			this.getView().byId("queryPage").addContent(oQueryEditorPreviewTreeTableComponentContainer);

		},

	});
});