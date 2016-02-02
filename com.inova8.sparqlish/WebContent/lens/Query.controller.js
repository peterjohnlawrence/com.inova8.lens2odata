sap.ui.define([ "controller/BaseController" ], function(BaseController) {
	"use strict";
	return BaseController.extend("lens.Query", {
		onInit : function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("query").attachMatched(this._onRouteMatched, this);

			this.oQueryEditorPreviewTreeTableComponent = sap.ui.getCore().createComponent({
				name : "Components.queryEditorPreviewTreeTable",
				settings : {
					title : "queryEditorPreviewTreeTable",
					serviceQueriesModel :  sap.ui.getCore().getModel("serviceQueriesModel") ,
					i18nModel :  sap.ui.getCore().getModel("i18n"), // i18nModel, // TODO or specific one for this component?
					datatypesModel :  sap.ui.getCore().getModel("datatypesModel") 
				}
			});

			this.oQueryEditorPreviewTreeTableComponentContainer = new sap.ui.core.ComponentContainer({
				component : this.oQueryEditorPreviewTreeTableComponent
			});
			this.getView().byId("queryPage").addContent(this.oQueryEditorPreviewTreeTableComponentContainer);

		},
		_onRouteMatched : function(oEvent) {
			this.oArgs = oEvent.getParameter("arguments");
			this.oQueryEditorPreviewTreeTableComponent.setService(sap.ui.getCore().getModel("serviceQueriesModel").getData().services[this.oArgs.service],this.oArgs.query);
		},
		onSearch: function (oEvent) {
				this.getRouter().navTo("search",{service:"xyz"});
		}
	});
});