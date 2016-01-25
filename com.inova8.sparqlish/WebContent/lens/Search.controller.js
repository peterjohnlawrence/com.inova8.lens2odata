sap.ui.define([ "controller/BaseController" ], function(BaseController) {
	"use strict";
	return BaseController.extend("lens.Search", {
		onDisplayNotFound : function() {
			this.getRouter().getTargets().display("notFound", {
				fromTarget : "search"
			});
		},
		onNavToQuery : function(oEvent) {
			this.getRouter().navTo("query", {
				query : "thisQuery"
			});
			var oQueryEditorPreviewTreeTableComponent = sap.ui.getCore().createComponent({
				name : "Components.queryEditorPreviewTreeTable",
				settings : {
					title : "queryEditorPreviewTreeTable",
					serviceQueriesModel : sap.ui.getCore().getModel("serviceQueriesModel"),
					i18nModel : sap.ui.getCore().getModel("i18n"), // TODO or specific one for this component?
					datatypesModel : sap.ui.getCore().getModel("datatypesModel")
				}
			});
			var oQueryEditorPreviewTreeTableComponentContainer = new sap.ui.core.ComponentContainer({
				component : oQueryEditorPreviewTreeTableComponent
			});
		}
	});
});