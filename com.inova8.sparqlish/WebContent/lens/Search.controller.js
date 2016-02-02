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
			//this.oSearchFormComponent.setMetaModel(sap.ui.getCore().getModel("metaModel"));
			this.oSearchFormComponentContainer = new sap.ui.core.ComponentContainer({
				component : this.oSearchFormComponent
			});
			this.getView().byId("searchPage").addContent(this.oSearchFormComponentContainer);
		},
		_onRouteMatched : function(oEvent) {
			this.oArgs = oEvent.getParameter("arguments");
//			this.oArgs.service=this.oArgs.service||"LNW2";
//			// TODO Might be undefined in which case we should prompt for a query to execute
//			this.oArgs.query=this.oArgs.query||"Test1a: date clause";
			this.oSearchFormComponent.setServiceCode(this.oArgs.service);
			this.oSearchFormComponent.setQueryName(this.oArgs.query);
		},
		onDisplayNotFound : function() {
			this.getRouter().getTargets().display("notFound", {
				fromTarget : "search"
			});
		},
		onNavToQuery : function(oEvent) {	
			this.getRouter().navTo("query", {
				query :this.oSearchFormComponent.getQueryName()|| this.oArgs.query,
				service : this.oSearchFormComponent.getServiceCode() || this.oArgs.service
			});
		}
	});
});
