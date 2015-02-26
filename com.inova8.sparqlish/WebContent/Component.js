jQuery.sap.require("xml2json");
jQuery.sap.require("jquery.sap.storage");
jQuery.sap.declare("Lens.Component");

sap.ui.core.UIComponent.extend("Lens.Component", {
	metadata : {
		routing : {
			config : {
				viewType : "HTML",
				viewPath : "lens",
				targetControl : "lensContainer",
				targetAggregation : "pages",
				clearTarget : false
			},
			routes : [ {
				pattern : "",
				name : "entry",
				view : "QueryView"
			}, {
				pattern : "search/:queryName:",
				name : "search",
				view : "QueryView"
			}, {
				pattern : "results/{queryName}",
				name : "results",
				view : "ResultsView"
			}, {
				pattern : "lens/:focus::?entity:",
				name : "lens",
				view : "LensView"
			}, {
				pattern : ":all*:",
				name : "catchallMaster",
				view : "CatchallView"
			} ]
		}
	}
});

Lens.Component.prototype.init = function() {
	jQuery.sap.require("sap.ui.core.routing.History");
	jQuery.sap.require("sap.m.routing.RouteMatchedHandler");

	sap.ui.core.UIComponent.prototype.init.apply(this);

	// set i18n model
	var i18nModel = new sap.ui.model.resource.ResourceModel({
		bundleUrl : [ ".", "i18n/messageBundle.properties" ].join("/")
	});
	sap.ui.getCore().setModel(i18nModel, "i18n");
	this.setModel(i18nModel, "i18n");

	// Create and set domain model to the component

	var queryData = new sap.ui.model.json.JSONModel();
	 queryData.prefix ="northwind";
	// queryData.prefix  = "nw";
	// queryData.prefix = "lens";
	queryData.modelPath = "config/" + queryData.prefix ;

	oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
	// Check if there is data into the Storage
	if (oStorage.get(queryData.prefix + ".lensQueryData")) {
		console.log("queryData is from local storage");
		var oQueryData = oStorage.get(queryData.prefix + ".lensQueryData");
		queryData.setData(oQueryData);
	} else {
		console.log("queryData is from server");
		queryData.loadData(queryData.modelPath + "/queryData.json", null, false);
	}
	queryData.setDefaultBindingMode("TwoWay");
	sap.ui.getCore().setModel(queryData, "queryData");
	this.setModel(queryData, "queryData");

	var metaData = new sap.ui.model.xml.XMLModel();
	metaData.loadData(queryData.modelPath + "/metadata.xml", null, false);

	var modelData = new sap.ui.model.json.JSONModel();
	modelData.setData(jQuery.xml2json(metaData.getData(), true), false);
	// console.log(JSON.stringify(modelData.getData()));
	sap.ui.getCore().setModel(modelData, "modelData");
	this.setModel(modelData, "modelData");

	var datatypeData = new sap.ui.model.json.JSONModel();
	datatypeData.loadData(queryData.modelPath + "/datatypes.json", null, false);
	sap.ui.getCore().setModel(datatypeData, "datatypeData");
	this.setModel(datatypeData, "datatypeData");

	var lensesData = new sap.ui.model.json.JSONModel();
	lensesData.loadData(queryData.modelPath + "/lenses.json", null, false);
	lensesData.setDefaultBindingMode("OneWay");
	sap.ui.getCore().setModel(lensesData, "lensesData");
	this.setModel(lensesData, "lensesData");

	var resultsModel = new sap.ui.model.json.JSONModel();
	resultsModel.setDefaultBindingMode("OneWay");

	resultsModel.sparqlEndpoint = lensesData.getData().sparqlEndpoint;

	resultsModel.headers = {};
//	resultsModel.headers.Authorization = "Access-Control-Allow-Origin: *; Access-Control-Allow-Methods: GET, POST, PUT, DELETE; Access-Control-Allow-Headers: *";
	resultsModel.headers.Accept = "application/sparql-results+json";


	sap.ui.getCore().setModel(resultsModel, "resultsModel");
	this.setModel(resultsModel, "resultsModel");

	sap.ui.getCore().getModel("resultsModel").attachRequestSent(function() {
		sap.ui.core.BusyIndicator.show(10);
	});
	sap.ui.getCore().getModel("resultsModel").attachRequestCompleted(function() {
		sap.ui.core.BusyIndicator.hide();
	});

	resultsModelBusyDialog = new sap.m.BusyDialog({
		showCancelButton : false,
	}).addStyleClass("busy_indicator");

	sap.ui.getCore().getModel("resultsModel").attachRequestSent(function() {
		resultsModelBusyDialog.open();
	});
	sap.ui.getCore().getModel("resultsModel").attachRequestCompleted(function() {
		resultsModelBusyDialog.close();
	});		

	// set device model
	var deviceModel = new sap.ui.model.json.JSONModel({
		isTouch : sap.ui.Device.support.touch,
		isNoTouch : !sap.ui.Device.support.touch,
		isPhone : sap.ui.Device.system.phone,
		isNoPhone : !sap.ui.Device.system.phone,
		listMode : sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
		listItemType : sap.ui.Device.system.phone ? "Active" : "Inactive"
	});
	deviceModel.setDefaultBindingMode("OneWay");
	sap.ui.getCore().setModel(deviceModel, "device");

	var router = this.getRouter();
	this.routeHandler = new sap.m.routing.RouteMatchedHandler(router);
	router.initialize();

};
Lens.Component.prototype.destroy = function() {
	if (this.routeHandler) {
		this.routeHandler.destroy();
	}
	sap.ui.core.UIComponent.destroy.apply(this, arguments);
};

Lens.Component.prototype.createContent = function() {
	this.view = sap.ui.view({
		id : "app",
		viewName : "lens.App",
		type : sap.ui.core.mvc.ViewType.JS
	});
	return this.view;
};
