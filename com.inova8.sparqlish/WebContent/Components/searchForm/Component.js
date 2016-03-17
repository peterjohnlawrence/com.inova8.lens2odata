jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sparqlish.sparqlish")
jQuery.sap.require("control.queryClause");
jQuery.sap.require("control.queryClausePreview");
jQuery.sap.require("control.serviceQueryMenu");
jQuery.sap.require("sap.ui.table.TreeTable");
jQuery.sap.require("sap.m.Toolbar");
jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.ui.core.IconPool");

jQuery.sap.declare("Components.searchForm.Component");
"use strict";
sap.ui.core.UIComponent.extend("Components.searchForm.Component", {
	metadata : {
		// manifest : "json",
		properties : {
			title : "string",
			metaModel : "object",
			serviceCode : "string",
			queryCode : "string",
			params : {
				type : "object"
			}
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
Components.searchForm.Component.prototype.setQueryCode = function(sQueryCode) {
	var self = this;
	var service = sap.ui.getCore().getModel("queryModel").getData()["services"][self.getServiceCode()]
	// Could be just specifying the service so select the first saved query
	if (jQuery.isEmptyObject(sQueryCode)) {
		sQueryCode = Object.keys(service.queries)[0];
	}
	// and if nothing has changed lets leave well alone
	if ((self.getProperty("queryCode") === sQueryCode) && !jQuery.isEmptyObject(sQueryCode)) {
	} else {
		self.setProperty("queryCode", sQueryCode);
		self.oQuerySelect.setSelectedKey(sQueryCode);
		// Initialize the paramter form if required
		if (service) {
			// var queryIndex = utils.lookupIndex(service.queries, "code", sQueryCode);
			self.oParameterForm.getFormContainers()[0].bindAggregation("formElements", "queryModel>/services/" + self.getServiceCode() + "/queries/"
					+ sQueryCode + "/parameters", this._initValueInputFactory.bind(this));
			self.oSearchResultsFormComponent.clearContents();
			self.oSearchResultsFormComponent.setTitle(sap.ui.getCore().getModel("i18nModel").getProperty("searchForm.waitingOnResults"));
			self.oSearchResultsTableComponent.setTitle(sap.ui.getCore().getModel("i18nModel").getProperty("searchForm.waitingOnResults"));
		} else {
			sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("searchForm.invalidService") + " " + self.getServiceCode());
		}
	}
	return;
};
Components.searchForm.Component.prototype.setServiceCode = function(sServiceCode) {
	var self = this;
	if (self.getProperty("serviceCode") === sServiceCode && !jQuery.isEmptyObject(sServiceCode)) {
	} else {
		self.setProperty("serviceCode", sServiceCode);
		var service = sap.ui.getCore().getModel("queryModel").getData().services[sServiceCode];
		if (service) {
			self.oServiceSelect.setSelectedKey(sServiceCode);
			self.oQuerySelect.bindItems({
				path : "queryModel>/services/" + service.code + "/queries",
				sorter : {
					path : "queryModel>name"
				},
				template : new sap.ui.core.ListItem({
					key : "{queryModel>code}",
					text : "{queryModel>name}"
				})
			});
			var odataModel = utils.getCachedOdataModel(service, function() {
				self.oFormPanel.setBusy(false);
			}, function(odataModel) {
				self.setProperty("serviceCode", service.code);
				var oDataMetaModel = odataModel.getMetaModel();
				self.setMetaModel(oDataMetaModel, "metaModel");
				var oMetaModelEntityContainer;
				self.oFormPanel.setBusy(true).setBusyIndicatorDelay(0);
				var oEntityContainerModel = new sap.ui.model.json.JSONModel();
				oDataMetaModel.loaded().then(function() {
					// self.setMetaModel(oDataMetaModel, "metaModel");
					self.setQueryCode(Object.keys(service.queries)[0].code);
					self.oFormPanel.setBusy(false);
				}, function() {
					self.oFormPanel.setBusy(false);
					throw ("metamodel error");
				});
				sap.ui.core.routing.Router.getRouter("lensRouter").navTo("searchWithQuery", {
					service : sServiceCode,
					querycode : Object.keys(service.queries)[0].code,
				});
			});
		} else {
			sap.m.MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("searchForm.invalidService") + " " + sServiceCode);

			sap.ui.core.routing.Router.getRouter("lensRouter").navTo("searchWithQuery", {
				service : Object.keys(sap.ui.getCore().getModel("queryModel").getData()["services"])[0]
			});
		}
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
	this.createToggleViewButton();

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

	this.oSearchResultsFormComponent = sap.ui.getCore().createComponent({
		name : "Components.lensResultsForm"
	});
	this.oSearchResultsTableComponent = sap.ui.getCore().createComponent({
		name : "Components.lensResultsTable"
	});
	this.oSearchResultsFormComponentContainer = new sap.ui.core.ComponentContainer({
		component : this.oSearchResultsFormComponent,
		propagateModel : true
	});
	this.oSearchResultsFormComponentContainer.addStyleClass("tile");
	this.oSearchResultsTableComponentContainer = new sap.ui.core.ComponentContainer({
		component : this.oSearchResultsTableComponent,
		propagateModel : true
	});
	this.oSearchResultsTableComponentContainer.addStyleClass("tile").setVisible(false);

	this.oFormPanel.addContent(this.oSearchResultsFormComponentContainer);
	this.oFormPanel.addContent(this.oSearchResultsTableComponentContainer);

	this.oFormPanel.setModel(sap.ui.getCore().getModel("queryModel"), "queryModel");

	return this.oFormPanel;
};
Components.searchForm.Component.prototype.createSearchButton = function() {
	var self = this;
	self.oPreview = new sap.m.Button({
		text : "{i18nModel>searchForm.preview}",
		icon : sap.ui.core.IconPool.getIconURI("search"),
		press : function(oEvent) {
			var queryPath = self.oQuerySelect.getSelectedItem().getBindingContext("queryModel").getPath();
			var queryAST = sap.ui.getCore().getModel("queryModel").getProperty(queryPath);
			var query = new Query(self.getMetaModel(), queryAST);
			self.renderResults(query);
		}
	});
	this.oFormPanel.addContent(self.oPreview);
};
Components.searchForm.Component.prototype.createToggleViewButton = function() {
	var self = this;
	self.oToggleButton = new sap.m.ToggleButton({
		text : "{i18nModel>searchForm.tableSearch}",
		icon : sap.ui.core.IconPool.getIconURI("table-view"),
		press : function(oEvent) {
			var me = oEvent.getSource();
			if (me.getPressed()) {
				me.setIcon(sap.ui.core.IconPool.getIconURI("form"));
				me.setTooltip(sap.ui.getCore().getModel("i18nModel").getProperty("searchForm.switchToFormView"));
				self.oSearchResultsFormComponentContainer.setVisible(false);
				self.oSearchResultsTableComponentContainer.setVisible(true);
			} else {
				me.setIcon(sap.ui.core.IconPool.getIconURI("table-view"));
				me.setTooltip(sap.ui.getCore().getModel("i18nModel").getProperty("searchForm.switchToTableView"));
				self.oSearchResultsFormComponentContainer.setVisible(true);
				self.oSearchResultsTableComponentContainer.setVisible(false);
			}
		}
	});
	self.oToggleButton.setIcon(sap.ui.core.IconPool.getIconURI("table-view"));
	self.oToggleButton.setTooltip(sap.ui.getCore().getModel("i18nModel").getProperty("searchForm.switchToTableView"));
	self.oToggleButton.setPressed(false);
	this.oFormPanel.addContent(self.oToggleButton);
};
Components.searchForm.Component.prototype.createServiceMenu = function() {
	var self = this;
	this.oServiceSelect = new sap.m.ActionSelect({
		tooltip : "{i18nModel>searchForm.serviceSelectTooltip}",
		items : {
			path : "queryModel>/services",
			sorter : {
				path : "queryModel>name"
			},
			template : new sap.ui.core.ListItem({
				key : "{queryModel>code}",
				text : "{queryModel>name}"
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
			sap.ui.core.routing.Router.getRouter("lensRouter").navTo("searchWithQuery", {
				service : self.getServiceCode(),
				querycode : self.oQuerySelect.getSelectedKey()
			}, false);
			// self.setQueryCode(self.oQuerySelect.getSelectedKey());
		}
	}).addStyleClass("menuText");
	this.oFormPanel.addContent(self.oQuerySelect);
};
Components.searchForm.Component.prototype.renderResults = function(query) {
	var service = sap.ui.getCore().getModel("queryModel").getData()["services"][this.getServiceCode()];
	var queryURL = service.serviceUrl + query.odataURI(service.version);
	this.oSearchResultsFormComponent.setTitle(service.queries[this.getQueryCode()].name + " "
			+ sap.ui.getCore().getModel("i18nModel").getProperty("searchForm.searchResults"));
	this.oSearchResultsFormComponent.setMetaModel(this.getMetaModel());

	this.oSearchResultsFormComponent.renderResults(queryURL, this.getServiceCode());

	this.oSearchResultsTableComponent.setTitle(service.queries[this.getQueryCode()].name + " "
			+ sap.ui.getCore().getModel("i18nModel").getProperty("searchForm.searchResults"));
	this.oSearchResultsTableComponent.setMetaModel(this.getMetaModel());

	this.oSearchResultsTableComponent.renderResults(queryURL, this.getServiceCode());

};
Components.searchForm.Component.prototype._initValueInputFactory = function(sId, oContext) {
	var oInputValue = null
	switch (oContext.getProperty("type")) {
	case "Edm.Date":
		oInputValue = (new sap.m.DatePicker({
			valueFormat : 'yyyy-MM-ddThh:mm:ssXX',
			tooltip : "{queryModel>prompt}",
			width : "auto",
			placeholder : "{queryModel>prompt}",
			description : "",
			editable : true,
			showValueHelp : true,
			valueHelpRequest : ""
		})).addStyleClass("dataPropertyValue");
		break;
	case "Edm.DateTime":
		oInputValue = (new sap.m.DatePicker({
			valueFormat : 'yyyy-MM-ddThh:mm:ssXX',
			tooltip : "{queryModel>prompt}",
			width : "auto",
			placeholder : "{queryModel>prompt}",
			description : "",
			editable : true,
			showValueHelp : true,
			valueHelpRequest : ""
		})).addStyleClass("dataPropertyValue");
		break;
	case "Edm.Time":
		oInputValue = (new sap.m.TimePicker({
			valueFormat : 'yyyy-MM-ddThh:mm:ssXX',
			tooltip : "{queryModel>prompt}",
			width : "auto",
			placeholder : "{queryModel>prompt}",
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
			tooltip : "{queryModel>prompt}",
			width : "auto",
			placeholder : "{queryModel>prompt}",
			description : "",
			editable : true,
			showValueHelp : false,
			valueHelpRequest : ""
		})).addStyleClass("dataPropertyValue");
		break;
	default:
		oInputValue = (new sap.m.Input({
			tooltip : "{queryModel>prompt}",
			width : "auto",
			placeholder : "{queryModel>prompt}",
			description : "",
			editable : true,
			showValueHelp : false,
			valueHelpRequest : ""
		})).addStyleClass("dataPropertyValue");
	}
	oInputValue.bindProperty("value", "queryModel>defaultValue")

	var oFormElement = new sap.ui.layout.form.FormElement({
		label : "{queryModel>name}",
		fields : [ oInputValue ],
		layoutData : new sap.ui.layout.form.GridElementData({
			hCells : "2"
		})
	});
	return oFormElement;
};
