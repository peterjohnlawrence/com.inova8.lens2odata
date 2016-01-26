sap.ui.define([ "controller/BaseController" ], function(BaseController) {
	"use strict";
	return BaseController.extend("lens.Search", {
		onInit : function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("search").attachMatched(this._onRouteMatched, this);

			var oSearchFormComponent = sap.ui.getCore().createComponent({
				name : "Components.searchForm",
				settings : {
					title : "SearchForm",
					metaModel : sap.ui.getCore().getModel("metaModel"),
					query :   "proxy/http/services.odata.org/V2/Northwind/Northwind.svc/Orders()?&$expand=Order_Details&$select=OrderID,Order_Details/ProductID&"
				}
			});

			var oSearchFormComponentContainer = new sap.ui.core.ComponentContainer({
				component : oSearchFormComponent
			});
			this.getView().byId("searchPage").addContent(oSearchFormComponentContainer);
			
			oSearchFormComponent.setModel(sap.ui.getCore().getModel("serviceQueriesModel"));
			//this.setBindingContext("/services/0/queries/1/","serviceQueriesModel");
			var oQueryBindingContext = new sap.ui.model.Context(sap.ui.getCore().getModel("serviceQueriesModel"),"/services/0/queries/1")
			oSearchFormComponent.setQueryContext(oQueryBindingContext);
			oSearchFormComponent.renderResults( "proxy/http/services.odata.org/V2/Northwind/Northwind.svc/Orders()?&$expand=Order_Details&$select=OrderID,Order_Details/ProductID&");

		},		onDisplayNotFound : function() {
			this.getRouter().getTargets().display("notFound", {
				fromTarget : "search"
			});
		},
		onNavToQuery : function(oEvent) {
			this.getRouter().navTo("query", {
				query : "thisQuery"
			});
		}
	});
});

