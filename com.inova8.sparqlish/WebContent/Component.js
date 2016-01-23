jQuery.sap.require("jquery.sap.storage");
jQuery.sap.declare("Lens.Component");

sap.ui.core.UIComponent.extend("Lens.Component", {
	metadata : {
		// manifest:"json",
		rootView : "lens.LensApp",
		models : {
			i18n : {
				type : "sap.ui.model.resource.ResourceModel",
				bundleName : "i18n.lens"
			}
		},
		routing : {
			config : {
				routerClass : "sap.m.routing.Router",
				viewType : "HTML",
				viewPath : "lens",
				controlId : "lensApp",
				controlAggregation : "pages",
				transistion : "slide",
				bypassed : {
					target : "notFound"
				}
			},
			routes : [ {
				pattern : "",
				name : "search",
				target : "search"
			}, {
				pattern : "query",
				name : "query",
				target : "query"
			}, {
				pattern : "lens",
				name : "lens",
				target : "lens"
			}
			// , {
			// pattern : "search/:queryName:",
			// name : "search",
			// view : "QueryView"
			// }
			// , {
			// pattern : "results/{queryName}",
			// name : "results",
			// view : "ResultsView"
			// }, {
			// pattern : "lens/:focus::?entity:",
			// name : "lens",
			// view : "LensView"
			// }, {
			// pattern : ":all*:",
			// name : "catchallMaster",
			// view : "CatchallView"
			// }
			],
			targets : {
				search : {
					viewName : "Search",
					viewLevel : 1
				},
				query : {
					viewName : "Query",
					viewLevel : 1,
					transition:"flip"
				},
				lens : {
					viewName : "Lens",
					viewLevel : 1
				},
				notFound : {
					viewName : "NotFound",
					transition : "show"
				}
			}
		}
	}
});

Lens.Component.prototype.init = function() {
	// jQuery.sap.require("sap.ui.core.routing.History");
	// jQuery.sap.require("sap.m.routing.RouteMatchedHandler");

	sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

	this.getRouter().initialize();

};
// Lens.Component.prototype.destroy = function() {
// if (this.routeHandler) {
// this.routeHandler.destroy();
// }
// sap.ui.core.UIComponent.destroy.apply(this, arguments);
// };
//
// Lens.Component.prototype.createContent = function() {
// this.view = sap.ui.view({
// id : "app",
// viewName : "lens.App",
// type : sap.ui.core.mvc.ViewType.JS
// });
// return this.view;
// };
