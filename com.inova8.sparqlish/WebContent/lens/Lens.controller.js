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
			//TODO settings does not seem to set the properties
			//this.oLensPanelComponent.setType("{default}");
			this.oLensPanelComponent.setRole("{default}"); 
			
			var oLensPanelComponentContainer = new sap.ui.core.ComponentContainer({
				component : this.oLensPanelComponent,
				propagateModel : true
			});
			this.getView().byId("lensPage").addContent(oLensPanelComponentContainer);
		//	oLensPanelComponent.renderFragments();
		},
		_onRouteMatched : function(oEvent) {
			//var oArgs
			this.oArgs = oEvent.getParameter("arguments");
			//oView = this.getView();
			this.oLensPanelComponent.setProperty("serviceCode",this.oArgs.service);
			this.oLensPanelComponent.setProperty("role",this.oArgs.role||"{default}");
			//Workaround to avoid issue with sapui5 router that will not ignore '=' even if encoded
			var oQuery = this.oArgs["?query"];
			oQuery.uri = oQuery.uri.replace(/~/g,"=");
			this.oLensPanelComponent.setProperty("query",oQuery);
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

/*
 * var oLensPanelComponent = sap.ui.getCore().createComponent({ name : "Components.lensPanel", settings : {
 * role:"(default)", concept:"Test"//"Northwind.Orders"// } }); var oLensPanelComponentContainer = new
 * sap.ui.core.ComponentContainer({ component : oLensPanelComponent, propagateModel:true });
 * 
 * oLensPanelComponentContainer.placeAt("uiPanel");
 * 
 * displayLensPanel = function() { oLensPanelComponent.renderFragments(); };
 */