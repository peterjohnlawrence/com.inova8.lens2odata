sap.ui.define([ "controller/BaseController" ], function(BaseController) {
	"use strict";
	return BaseController.extend("lens.Lens", {
		onDisplayNotFound : function() {
			this.getRouter().getTargets().display("notFound", {
				fromTarget : "lens"
			});
		},
		onInit : function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("lens").attachMatched(this._onRouteMatched, this);
			oRouter.getRoute("defaultLens").attachMatched(this._onRouteMatched, this);
			this.oLensPanelComponent = sap.ui.getCore().createComponent({
				name : "Components.lensPanel",
			});
			this.oLensPanelComponent.setPage("[default]"); 
			
			var oLensPanelComponentContainer = new sap.ui.core.ComponentContainer({
				component : this.oLensPanelComponent,
				propagateModel : true
			});
			this.getView().byId("lensPage").addContent(oLensPanelComponentContainer);
		},
		_onRouteMatched : function(oEvent) {
			//var oArgs
			this.oArgs = oEvent.getParameter("arguments");
			this.oLensPanelComponent.setProperty("serviceCode",this.oArgs.service);
			this.oLensPanelComponent.setProperty("page",this.oArgs.page||"[default]");
			//Workaround to avoid issue with sapui5 router that will not ignore '=' even if encoded
			var oQuery = this.oArgs["?query"];
			oQuery.uri = oQuery.uri.replace(/~/g,"=");
			this.oLensPanelComponent.setProperty("query",oQuery);
			var oView = sap.ui.getCore().byId(this.createId("lensTitle"));
			if(this.oArgs["?query"].deferred){
				oView.setText(  "Deferred "+ this.oArgs["?query"].type + " " + sap.ui.getCore().getModel("i18nModel").getProperty("lens.title") + this.oArgs["?query"].label);
			
			}else{
				oView.setText(  this.oArgs["?query"].type + " " + sap.ui.getCore().getModel("i18nModel").getProperty("lens.title") + this.oArgs["?query"].label);
			}
			this.oLensPanelComponent.renderFragments();
		},
		_onBindingChange : function(oEvent) {
			var oElementBinding = this.getView().getElementBinding();

			// No data for the binding
			if (oElementBinding && !oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("notFound");
			}
		},
		onSearch: function (oEvent) {
				this.getRouter().navTo("search",{service:this.oLensPanelComponent.getProperty("serviceCode")});
		}
	});
});
