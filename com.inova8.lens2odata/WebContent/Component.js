sap.ui.define([ "sap/ui/core/UIComponent" ], function(UIComponent) {
	"use strict";
	return UIComponent.extend("Lens.Component", {
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
					// example #LNW2
					pattern : "{service}",
					name : "search",
					target : "search"
				}, {
					// example
					pattern : "",
					name : "defaultquery",
					target : "query"
				}, {
					// example #LNW2/search
					// example #LNW2/search/1a
					// example #LNW2/search/1a?city=London&status=true
					pattern : "{service}/search/:querycode:/:?params:",
					name : "searchWithQuery",
					target : "search"
				}, {
					// example #LNW2/query/1a
					// example #LNW2/query/1a?city=London&status=true
					pattern : "{service}/query/:querycode:/:?params:",
					name : "query",
					target : "query"
				}, {
					// example
					// #LNW2/lens/manager?deferred=true&role=default&type=northwind.Order&uri=http://service/Orders()/shipsOrder
					pattern : "{service}/lens/{role}/:?query:",
					name : "lens",
					target : "lens"
				}, {
					// example #LNW2/lens?uri=http://service/Orders()
					// example #LNW2/lens?deferred=true&role=default&type=northwind.Order&uri=http://service/Orders()/shipsOrder
					pattern : "{service}/lens/:?query:",
					name : "defaultLens",
					target : "lens"
				} ],
				targets : {
					search : {
						viewName : "Search",
						viewLevel : 1
					},
					query : {
						viewName : "Query",
						viewLevel : 1,
						transition : "flip"
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
});

Lens.Component.prototype.init = function() {
	sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
	jQuery.sap.require("jquery.sap.storage");

	// i18nModel>
	var oI18n = new sap.ui.model.resource.ResourceModel({
		bundleName : "i18n.lens"
	});
	sap.ui.getCore().setModel(oI18n, "i18nModel");

	// queryModel>
	var oQueryModel = new sap.ui.model.json.JSONModel();
	var localQueryData = utils.getLocalStorage("queries");
	var remoteQueryData = new sap.ui.model.json.JSONModel();
	try {
		remoteQueryData.loadData("config/queries.json", null, false);
	} catch (e) {
		// Query data not found. No problem since user can start building from scratch
	}
	var queryData = utils.mergeQueryModel(localQueryData, remoteQueryData.getData());

	oQueryModel.setData(queryData);
	sap.ui.getCore().setModel(oQueryModel, "queryModel");

	// datatypesModel>
	var oDatatypesModel = new sap.ui.model.json.JSONModel();
	oDatatypesModel.loadData("i18n/datatypes_en.json", null, false);
	sap.ui.getCore().setModel(oDatatypesModel, "datatypesModel");

	// parametersModel>
	var oParametersModel = new sap.ui.model.json.JSONModel();
	try {
		oParametersModel.loadData("config/parameters.json", null, false);
	} catch (e) {
		// Use default values
		oParametersModel.setJSON('{"expandClause":false,"hiddenColumns":["label"]}', true);
	}
	sap.ui.getCore().setModel(oParametersModel, "parametersModel");

	// lensesModel>
	var oLensesModel = new sap.ui.model.json.JSONModel();
	var localLensesData = utils.getLocalStorage("lenses");
	var remoteLensesData = new sap.ui.model.json.JSONModel();
	try {
		remoteLensesData.loadData("config/lenses.json", null, false);
		if (jQuery.isEmptyObject(remoteLensesData.getData()) & jQuery.isEmptyObject(localLensesData)) {
			sap.m.MessageToast.show("Failed to locate Lenses.json. This will prevent lens pages being displayed. Contact your adminisrator");
		} else {
			var lensesData = utils.mergeLensesModel(localLensesData, remoteLensesData.getData());
			oLensesModel.setData(lensesData);
		}
	} catch (e) {
		// Lenses data not found. No problem since user can start building from scratch
	}
	sap.ui.getCore().setModel(oLensesModel, "lensesModel");
	// Do this last so models are initialized
	this.getRouter().initialize();
	this.getRouter().register("lensRouter");
};
