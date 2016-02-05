jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sparqlish.sparqlish")
jQuery.sap.require("sparqlish.control.queryClause");
jQuery.sap.require("sparqlish.control.queryClausePreview");
jQuery.sap.require("sparqlish.control.serviceQueryMenu");
jQuery.sap.require("sap.ui.table.TreeTable");
jQuery.sap.require("sap.m.Toolbar");
jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.ui.core.IconPool");

jQuery.sap.declare("Components.searchForm.Component");

sap.ui.core.UIComponent.extend("Components.searchForm.Component", {
	metadata : {
		// manifest : "json",
		properties : {
			title : "string",
			metaModel : "object",
			serviceCode : "string",
			queryName : "string"
		},
		events : {
			serviceChanged : {
				enablePreventDefault : true
			},
			queryChanged : {
				enablePreventDefault : true
			}
		}
	}
});
Components.searchForm.Component.prototype.setQueryName = function(sQueryName) {
	var self = this;
	if ((self.getProperty("queryName") === sQueryName)&&!jQuery.isEmptyObject(sQueryName))
		return;
	self.setProperty("queryName", sQueryName);
	self.oQuerySelect.setSelectedKey(sQueryName);

	var service = sap.ui.getCore().getModel("serviceQueriesModel").getData()["services"][self.getServiceCode()]
	if (service) {
		var queryIndex = utils.lookupIndex(service.queries, "name", sQueryName); //service.queries.lookupIndex("name", sQueryName);

		self.oParameterForm.getFormContainers()[0].bindAggregation("formElements", "serviceQueriesModel>/services/" + self.getServiceCode() + "/queries/"
				+ queryIndex + "/parameters", this._initValueInputFactory.bind(this));

		self.oSearchResultsComponent.setTitle(sap.ui.getCore().getModel("i18nModel").getProperty("searchForm.waitingOnResults"));
		self.oSearchResultsComponent.clearContents();
	} else {
		sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("searchForm.invalidService") + " " + self.getServiceCode());
	}
};
Components.searchForm.Component.prototype.setServiceCode = function(sServiceCode) {
	var self = this;
	if (self.getProperty("serviceCode") === sServiceCode &&!jQuery.isEmptyObject(sServiceCode))
		return;
	self.setProperty("serviceCode", sServiceCode);
	var service = sap.ui.getCore().getModel("serviceQueriesModel").getData().services[sServiceCode];
	if (service) {
		self.oServiceSelect.setSelectedKey(sServiceCode);
		self.oQuerySelect.bindItems({
			path : "serviceQueriesModel>/services/" + service.code + "/queries",
			sorter : {
				path : "serviceQueriesModel>name"
			},
			template : new sap.ui.core.ListItem({
				key : "{serviceQueriesModel>name}",
				text : "{serviceQueriesModel>name}"
			})
		});
		var odataModel = utils.getCachedOdataModel(service, function() {
		self.oTable.setBusy(false);
	}, function(odataModel) {    
		self.setProperty("serviceCode", service.code);
		var oDataMetaModel = odataModel.getMetaModel();
		self.setMetaModel(oDataMetaModel, "metaModel");
		var oMetaModelEntityContainer;
		self.oFormPanel.setBusy(true).setBusyIndicatorDelay(0);
		var oEntityContainerModel = new sap.ui.model.json.JSONModel();
		oDataMetaModel.loaded().then(function() {
		//	self.setMetaModel(oDataMetaModel, "metaModel");
			self.setQueryName(service.queries[0].name);
			self.oFormPanel.setBusy(false);
		}, function() {
			self.oFormPanel.setBusy(false);
			throw ("metamodel error");
		});
		sap.ui.core.routing.Router.getRouter("lensRouter").navTo("search", {
			service : sServiceCode
		});});
	} else {
		sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("searchForm.invalidService") + " " + sServiceCode);
			sap.ui.core.routing.Router.getRouter("lensRouter").navTo("search", {
			service : Object.keys(sap.ui.getCore().getModel("serviceQueriesModel").getData()["services"])[0]
		});
	}
};
Components.searchForm.Component.prototype.createContent = function() {
	var self = this;

	this.oFormPanel = new sap.ui.commons.Panel({
		title : new sap.ui.core.Title().setText(sap.ui.getCore().getModel("i18nModel").getProperty("searchForm.title")),
		width : "100%",
		showCollapseIcon : false,
		borderDesign : sap.ui.commons.enums.BorderDesign.Box
	// height : "500px"
	});

	this.createServiceMenu();
	this.createQueryMenu();
	this.createSearchButton();

	var oParameterFormLayout = new sap.ui.layout.form.GridLayout({
		singleColumn : false
	});

	this.oParameterContainer = new sap.ui.layout.form.FormContainer({
		expandable : true
	});
	this.oParameterForm = new sap.ui.layout.form.Form({
		layout : oParameterFormLayout,
		width : "100%",
		formContainers : this.oParameterContainer
	});
	this.oFormPanel.addContent(this.oParameterForm);

	var oFormLayout = new sap.ui.layout.form.GridLayout({
		singleColumn : false
	});
	this.oFormContainer = new sap.ui.layout.form.FormContainer({
		expandable : true
	});

	this.oForm = new sap.ui.layout.form.Form({
		layout : oFormLayout,
		width : "100%",
		formContainers : this.oFormContainer
	});
	this.oFormPanel.addContent(this.oForm);

	this.oSearchResultsComponent = sap.ui.getCore().createComponent({
		name : "Components.lensResultsForm",
	});
	this.oSearchResultsComponentContainer = new sap.ui.core.ComponentContainer({
		component : this.oSearchResultsComponent,
		propagateModel : true
	});
	this.oSearchResultsComponentContainer.addStyleClass("tile");
	this.oFormPanel.addContent(this.oSearchResultsComponentContainer);

	this.oFormPanel.setModel(sap.ui.getCore().getModel("serviceQueriesModel"), "serviceQueriesModel");

	return this.oFormPanel;
};
Components.searchForm.Component.prototype.createSearchButton = function() {
	var self = this;
	self.oPreview = new sap.m.Button({
		text : "{i18nModel>searchForm.preview}",
		icon : sap.ui.core.IconPool.getIconURI("search"),
		press : function(oEvent) {
			var queryPath = self.oQuerySelect.getSelectedItem().getBindingContext("serviceQueriesModel").getPath();
			var queryAST = sap.ui.getCore().getModel("serviceQueriesModel").getProperty(queryPath);
			var query = new Query(self.getMetaModel(), queryAST);
			self.renderResults(query);
		}
	});
	this.oFormPanel.addContent(self.oPreview);
};
Components.searchForm.Component.prototype.createServiceMenu = function() {
	var self = this;
	this.oServiceSelect = new sap.m.ActionSelect({
		tooltip : "{i18nModel>searchForm.serviceSelectTooltip}",
		items : {
			path : "serviceQueriesModel>/services",
			sorter : {
				path : "serviceQueriesModel>name"
			},
			template : new sap.ui.core.ListItem({
				key : "{serviceQueriesModel>code}",
				text : "{serviceQueriesModel>name}"
			})
		},
		change : function(oEvent) {
			self.setServiceCode(self.oServiceSelect.getSelectedKey());
		}
	}).addStyleClass("menuText");
	this.oFormPanel.addContent(self.oServiceSelect);
};
Components.searchForm.Component.prototype.createQueryMenu = function() {
	var self = this;
	self.oQuerySelect = new sap.m.ActionSelect({
		tooltip : "{i18nModel>querySelectTooltip}",
		change : function(oEvent) {
			self.setQueryName(self.oQuerySelect.getSelectedKey());
		}
	}).addStyleClass("menuText");
	this.oFormPanel.addContent(self.oQuerySelect);
};
Components.searchForm.Component.prototype.renderResults = function(query) {
	var service = sap.ui.getCore().getModel("serviceQueriesModel").getData()["services"][this.getServiceCode()];
	var queryURL = service.serviceUrl + query.odataURI(service.version);

	this.oSearchResultsComponent.setTitle(this.getQueryName() + " " + sap.ui.getCore().getModel("i18nModel").getProperty("searchForm.searchResults"));
	this.oSearchResultsComponent.setMetaModel(this.getMetaModel());

	this.oSearchResultsComponent.renderResults(queryURL, this.getServiceCode());

};
Components.searchForm.Component.prototype._initValueInputFactory = function(sId, oContext) {
	var oInputValue = null
	switch (oContext.getProperty("type")) {
	case "Edm.Date":
		oInputValue = (new sap.m.DatePicker({
			valueFormat : 'yyyy-MM-ddThh:mm:ssXX',
			tooltip : "{serviceQueriesModel>prompt}",
			width : "auto",
			placeholder : "{serviceQueriesModel>prompt}",
			description : "",
			editable : true,
			showValueHelp : true,
			valueHelpRequest : ""
		})).addStyleClass("dataPropertyValue");
		break;
	case "Edm.DateTime":
		oInputValue = (new sap.m.DatePicker({
			valueFormat : 'yyyy-MM-ddThh:mm:ssXX',
			tooltip : "{serviceQueriesModel>prompt}",
			width : "auto",
			placeholder : "{serviceQueriesModel>prompt}",
			description : "",
			editable : true,
			showValueHelp : true,
			valueHelpRequest : ""
		})).addStyleClass("dataPropertyValue");
		break;
	case "Edm.Time":
		oInputValue = (new sap.m.TimePicker({
			valueFormat : 'yyyy-MM-ddThh:mm:ssXX',
			tooltip : "{serviceQueriesModel>prompt}",
			width : "auto",
			placeholder : "{serviceQueriesModel>prompt}",
			description : "",
			editable : true,
			showValueHelp : true,
			valueHelpRequest : ""
		})).addStyleClass("dataPropertyValue");
		break;
	case "Edm.Decimal":
	case "Edm.Double":
	case "Edm.Single":
	case "Edm.Int16":
	case "Edm.Int32":
	case "Edm.Int64":
		oInputValue = (new sap.m.Input({
			type : sap.m.InputType.Number,
			tooltip : "{serviceQueriesModel>prompt}",
			width : "auto",
			placeholder : "{serviceQueriesModel>prompt}",
			description : "",
			editable : true,
			showValueHelp : true,
			valueHelpRequest : ""
		})).addStyleClass("dataPropertyValue");
		break;
	default:
		oInputValue = (new sap.m.Input({
			tooltip : "{serviceQueriesModel>prompt}",
			width : "auto",
			placeholder : "{serviceQueriesModel>prompt}",
			description : "",
			editable : true,
			showValueHelp : true,
			valueHelpRequest : ""
		})).addStyleClass("dataPropertyValue");
	}
	oInputValue.bindProperty("value", "serviceQueriesModel>defaultValue")

	var oFormElement = new sap.ui.layout.form.FormElement({
		label : "{serviceQueriesModel>name}",
		fields : [ oInputValue ],
		layoutData : new sap.ui.layout.form.GridElementData({
			hCells : "2"
		})
	});
	return oFormElement;
};
