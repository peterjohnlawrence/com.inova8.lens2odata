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

			var oLensPanelComponent = sap.ui.getCore().createComponent({
				name : "Components.lensPanel",
				settings : {
					role : "{default}",
					concept : "{default}"// "Northwind.Orders"//
				}
			});
			//TODO settings does not seem to set the properties
			oLensPanelComponent.setConcept("{default}");
			oLensPanelComponent.setRole("{default}"); 
			
			var oLensPanelComponentContainer = new sap.ui.core.ComponentContainer({
				component : oLensPanelComponent,
				propagateModel : true
			});
			this.getView().byId("lensPage").addContent(oLensPanelComponentContainer);
			oLensPanelComponent.renderFragments();
		},
		_onRouteMatched : function(oEvent) {
			var oArgs, oView;
			oArgs = oEvent.getParameter("arguments");
			oView = this.getView();
			oView.byId("lensTitle").setText(oArgs.entity);
		},
		_onBindingChange : function(oEvent) {
			var oElementBinding = this.getView().getElementBinding();

			// No data for the binding
			if (oElementBinding && !oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("notFound");
			}
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