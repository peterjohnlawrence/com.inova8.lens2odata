jQuery.sap.require("sap.m.P13nDialog");
jQuery.sap.require("sap.m.P13nColumnsPanel");
jQuery.sap.require("sap.m.P13nItem");
jQuery.sap.require("sparqlish.control.parameterEdit");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("sparqlish.control.parameterDialog", {
		metadata : {
			properties : {
				queryContext : {
					type : "object"
				}
			},
			aggregations : {},
			events : {}
		},
		open : function() {
			if (this._parametersCount() == 0) {
				// Go straight to add a parameter
				var oParameters = this._initializeParameters();
				this.oParameterEdit.oParameterForm.bindElement("queryModel>" + this.getProperty("queryContext").getPath() + "/parameters/" + (oParameters.length - 1));
				this.oParameterEdit.open();
			} else {
				this.oDialog.open();
			}
		},
		setQueryContext : function(oQueryContext) {
			var self = this;
			self.setProperty("queryContext", oQueryContext);
			self.oParameterForm.getFormContainers()[0].bindAggregation("formElements", "queryModel>" + oQueryContext.getPath() + "/parameters",
					this._initValueInputFactory.bind(this));
		},
		init : function(queryContext) {
			var self = this;
			self.oParameterForm = new sap.ui.layout.form.Form({
				layout : new sap.ui.layout.form.GridLayout({
					singleColumn : false
				}),
				formContainers : [ new sap.ui.layout.form.FormContainer({
					expandable : true
				}) ]
			});
			self.oParameterEdit = new sparqlish.control.parameterEdit();
			self.oDialog = new sap.m.Dialog({
				title : "{i18nModel>parameterDialog.title}",
				buttons : [
						new sap.m.Button({
							text : '{i18nModel>parameterDialog.addParameter}',
							press : function() {
								var oParameters = self._initializeParameters();
								self.oParameterEdit.oParameterForm.bindElement("queryModel>" + self.getProperty("queryContext").getPath() + "/parameters/"
										+ (oParameters.length - 1));
								self.oParameterEdit.open();
							}
						}), new sap.m.Button({
							text : '{i18nModel>parameterDialog.submit}',
							press : function() {
								self.oDialog.close();
							}
						}) ]
			});
			self.oParameterPanel = new sap.m.Panel();
			self.oParameterPanel.addContent(self.oParameterForm);
			self.oDialog.addContent(self.oParameterPanel);

		},
		_initializeParameters : function() {
			var oParameters = sap.ui.getCore().getModel("queryModel").getProperty(this.getProperty("queryContext").getPath() + "/parameters/");
			if (oParameters instanceof Array) {
				oParameters.push({
					"name" : null,
					"type" : "Edm.String",
					"prompt" : null,
					"defaultValue" : null
				});
			} else {
				oParameters = [ {
					"name" : null,
					"type" : "Edm.String",
					"prompt" : null,
					"defaultValue" : null
				} ];
				sap.ui.getCore().getModel("queryModel").getProperty(this.getProperty("queryContext").getPath()).parameters = oParameters;
			}
			// this.oParameterEdit.oParameterForm.bindElement("queryModel>" + self.getProperty("queryContext").getPath() +
			// "/parameters/" + (oParameters.length - 1));
			return oParameters;
		},
		_parametersCount : function() {
			var oParameters = sap.ui.getCore().getModel("queryModel").getProperty(this.getProperty("queryContext").getPath() + "/parameters/");
			if (oParameters instanceof Array) {
				return oParameters.length;
			} else {
				return 0;
			}
		},
		_initValueInputFactory : function(sId, oContext) {
			var self = this;
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
					showValueHelp : false,
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
					showValueHelp : false,
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
					showValueHelp : false,
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
					showValueHelp : true,
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
					showValueHelp : true,
					valueHelpRequest : ""
				})).addStyleClass("dataPropertyValue");
			}
			oInputValue.bindProperty("value", "queryModel>defaultValue")

			var oFormElement = new sap.ui.layout.form.FormElement({
				label : "{queryModel>name}",
				fields : [ oInputValue, new sap.m.Button({
					icon : sap.ui.core.IconPool.getIconURI("edit"),
					width : "10em",
					press : function(oEvent) {
						self.oParameterEdit.oParameterForm.bindElement("queryModel>" + oEvent.getSource().getBindingContext("queryModel").getPath());
						self.oParameterEdit.open();
					}
				}), new sap.m.Button({
					icon : sap.ui.core.IconPool.getIconURI("delete"),
					width : "10em",
					press : function(oEvent) {
						var sPath = oEvent.getSource().getBindingContext("queryModel").getPath().split("/");
						var element = sPath.pop();
						// TODO remove references to parameter, replacing with defaultValue
						sap.ui.getCore().getModel("queryModel").getObject(sPath.join("/")).splice(element, 1);
						sap.ui.getCore().getModel("queryModel").refresh();

					}
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "1"
				})
			});
			return oFormElement;
		},
		renderer : function(oRm, oControl) {
		}
	});
});