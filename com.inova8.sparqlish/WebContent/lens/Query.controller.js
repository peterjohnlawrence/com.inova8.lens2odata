sap.ui.define([ "controller/BaseController" ], function(BaseController) {
	"use strict";
	return BaseController.extend("lens.Query", {
		onInit : function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("query").attachMatched(this._onRouteMatched, this);

			this.oQueryFormComponent = sap.ui.getCore().createComponent({
				name : "Components.queryForm",
				settings : {
					title : "QueryForm",
					queryModel : sap.ui.getCore().getModel("queryModel"),
					i18nModel : sap.ui.getCore().getModel("i18n"), // i18nModel, // TODO or specific one for this component?
					datatypesModel : sap.ui.getCore().getModel("datatypesModel")
				}
			});
			this.oQueryFormComponentContainer = new sap.ui.core.ComponentContainer({
				component : this.oQueryFormComponent
			});
			this.getView().byId("queryPage").addContent(this.oQueryFormComponentContainer);
		},
		_onRouteMatched : function(oEvent) {
			this.oArgs = oEvent.getParameter("arguments");

			this.oQueryFormComponent.setParams(this.oArgs["?params"]);
			var service = sap.ui.getCore().getModel("queryModel").getData().services[this.oArgs.service];
			this.oQueryFormComponent.setService(service, service.queries[this.oArgs.querycode], this.oArgs["?params"]);
		},
		onSearch : function(oEvent) {
			this.getRouter().navTo("searchWithQuery", {
				service : this.oQueryFormComponent.getService().code,
				querycode : this.oQueryFormComponent.getQuery().oAST.code,
				params : this.oQueryFormComponent.getParams(),
			});
		}
	});
});