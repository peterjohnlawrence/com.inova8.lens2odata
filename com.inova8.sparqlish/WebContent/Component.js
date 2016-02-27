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
					// example #LNW2/lens/manager?deferred=true&uri=http://service/Orders()/shipsOrder
					pattern : "{service}/lens/{role}/:?query:",
					name : "lens",
					target : "lens"
				}, {
					// example #LNW2/lens?uri=http://service/Orders()
					// example #LNW2/lens?deferred=true&uri=http://service/Orders()/shipsOrder
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
	// i18n>
	var oI18n = new sap.ui.model.resource.ResourceModel({
		bundleName : "i18n.lens"
	});
//	sap.ui.getCore().setModel(oI18n, "i18n");
	sap.ui.getCore().setModel(oI18n, "i18nModel");

	// queryModel>
	var oQueryModel = new sap.ui.model.json.JSONModel();
	var localQueryData = utils.getLocalStorage();
	var remoteQueryData = new sap.ui.model.json.JSONModel();
	remoteQueryData.loadData("config/queries.json", null, false);

	var queryData = jQuery.extend(true, {}, localQueryData, remoteQueryData.getData());

	oQueryModel.setData(queryData);
	sap.ui.getCore().setModel(oQueryModel, "queryModel");
	//sap.ui.getCore().setModel(oQueryModel, "serviceQueriesModel");

	// datatypesModel>
	var oDatatypesModel = new sap.ui.model.json.JSONModel();
	oDatatypesModel.loadData("i18n/datatypes_en.json", null, false);
	sap.ui.getCore().setModel(oDatatypesModel, "datatypesModel");

	// parametersModel>
	var oParametersModel = new sap.ui.model.json.JSONModel();
	oParametersModel.setJSON('{"expandClause":false}', true);
	sap.ui.getCore().setModel(oParametersModel, "parametersModel");

	// lensesModel>
	var oLensesModel = new sap.ui.model.json.JSONModel();
	oLensesModel.loadData("config/lenses.json", null, false);
	sap.ui.getCore().setModel(oLensesModel, "lensesModel");

	// Should not be here
//	var sUrl = "proxy/http/services.odata.org/V2/Northwind/Northwind.svc/";
//	var oDataModel = new sap.ui.model.odata.ODataModel(sUrl, true);
//	var oMetaModel = oDataModel.getMetaModel();
//	sap.ui.getCore().setModel(oMetaModel, "metaModel");

	// Do this last so models are initialized
	this.getRouter().initialize();
	this.getRouter().register("lensRouter");
};
