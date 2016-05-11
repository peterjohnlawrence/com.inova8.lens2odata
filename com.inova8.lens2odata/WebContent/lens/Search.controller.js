sap.ui.define([ "controller/BaseController" ], function(BaseController) {
	"use strict";
	return BaseController.extend("lens.Search", {
		onInit : function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("search").attachMatched(this._onRouteMatched, this);
			oRouter.getRoute("searchWithQuery").attachMatched(this._onRouteMatched, this);
			this.oSearchFormComponent = sap.ui.getCore().createComponent({
				name : "Components.searchForm",
				settings : {
					title : "SearchForm",
				}
			});
			// Initialize search form
			this.oSearchFormComponent.setTitle("SearchForm");
			this.oSearchFormComponentContainer = new sap.ui.core.ComponentContainer({
				component : this.oSearchFormComponent
			});
			this.getView().byId("searchPage").addContent(this.oSearchFormComponentContainer);
		},
		_onRouteMatched : function(oEvent) {
			this.oArgs = oEvent.getParameter("arguments");
			this.oSearchFormComponent.setServiceCode(this.oArgs.service);
			this.oSearchFormComponent.setQueryCode(this.oArgs.querycode);
			this.oSearchFormComponent.setParams(this.oArgs["?params"]);
		},
		onDisplayNotFound : function() {
			this.getRouter().getTargets().display("notFound", {
				fromTarget : "search"
			});
		},
		onNavToQuery : function(oEvent) {	
			this.getRouter().navTo("query", {
				querycode:this.oSearchFormComponent.getQueryCode()|| this.oArgs.querycode,
				service : this.oSearchFormComponent.getServiceCode() || this.oArgs.service
			},false);
		}
	});
});
