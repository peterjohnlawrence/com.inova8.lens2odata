jQuery.sap.require("lens.QueryWriter");
jQuery.sap.require("jquery.sap.storage");

sap.ui.controller("lens.QueryView", {

	// Initialize element variables for ease of access
	oNewQueryDialogFragment : null,
	oDatatypePropertyDialogFragment : null,
	oObjectPropertyDialogFragment : null,
	oEntityDialogFragment : null,

	sSearchForm : null,
	sQueryForm : null,
	sQueryExpandButton : null,
	sSearchText : null,
	sSearchEntity : null,
	sQueryName : null,
	sQueryTreeTable : null,

	modelData : null,
	queryData : null,
	datatypeData : null,

	queryRestoreList : {
		current : null,
		prior : null
	},

	resultsView : function() {
		var queryNameValue = sQueryName.getValue();
		if (queryNameValue != "" && queryNameValue != undefined && queryNameValue != null) {
			if (sSearchEntity.getValue() != "") {
				if (!sQueryExpandButton.simpleSearch) {
					// initialize the query with simple
					lens.PushSimpleQuery(sSearchText.getValue(), queryNameValue, queryData, modelData);
				}
				var router = sap.ui.core.UIComponent.getRouterFor(this);
				router.navTo("results", {
					queryName : queryNameValue
				}, false);
			} else {
				lens.ErrorMessage("Undefined entityset");
			}
		} else {
			lens.ErrorMessage("Undefined query");
		}
	},
	setSimpleSearchMode : function(simpleMode) {
		var queryNameValue = sQueryName.getValue();
		var query = lens.FindQuery(queryData.getData(), queryNameValue);
		if (query != null) {
			if (simpleMode || simpleMode == undefined) {
				query.simple = true;
				query.filter = sSearchText.getValue();
				sQueryExpandButton.setText("Advanced Search");// bindProperty("text","{i18nModel>queryAdvanced}");
				sQueryExpandButton.simpleSearch = false;
				sSearchForm.setVisible(true);
				sQueryForm.setVisible(false);
			} else {
				if (query.simple) {
					lens.PushSimpleQuery(sSearchText.getValue(), queryNameValue, queryData, modelData);
				}
				query.simple = false;
				query.filter = sSearchText.getValue();
				sQueryExpandButton.setText("Simple Search");// .bindProperty("text","{i18nModel>querySearch}");
				sQueryExpandButton.simpleSearch = true;
				sSearchForm.setVisible(false);
				sQueryForm.setVisible(true);
			}
		} else {
			// TODO, only ad if incorrect query name on URL
			sQueryExpandButton.setText("Advanced Search");// bindProperty("text","{i18nModel>queryAdvanced}");
			sQueryExpandButton.simpleSearch = false;
			sSearchForm.setVisible(true);
			sQueryForm.setVisible(false);
		}
	},
	undo : function() {
		if (this.queryRestoreList.prior != null) {
			queryData.setData(this.queryRestoreList.prior.current);
			this.queryRestoreList = this.queryRestoreList.prior;
		}
	},
	download : function() {
		queryData.loadData(queryData.modelPath + "/queryData.json", null, false);
		lens.ConfirmationMessage("Downloaded example searches");
	},
	pushQuery : function(currentQueryData) {
		this.queryRestoreList.current = jQuery.extend(true, {}, currentQueryData);
		this.queryRestoreList = {
			current : null,
			prior : this.queryRestoreList
		};
	},
	searchView : function() {
		if (sSearchEntity.getValue() != "") {
			this.setSimpleSearchMode(sQueryExpandButton.simpleSearch);
		}
	},
	newQuery : function() {
		oNewQueryDialogFragment.open();
	},
	deleteQuery : function() {
		if (sQueryName.getValue() == "(default)") {
			lens.ConfirmationMessage("Cannot delete default query");
		} else {
			this.pushQuery(queryData.getData());
			var deleteQueryIndex = lens.FindQueryIndex(queryData.getData(), sQueryName.getValue());
			var existingQueryData = queryData.getData();
			existingQueryData.queries.remove(deleteQueryIndex);
			queryData.setData(existingQueryData);
			this.initializeQueryForm(new sap.ui.model.Context(queryData, "/queries/" + 0));
			sQueryName.setValue("(default)");
			lens.ConfirmationMessage("Deleted");
		}
	},
	saveQuery : function() {
		var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		oStorage.put(queryData.prefix + ".lensQueryData", queryData.getData());
		lens.ConfirmationMessage("QueryData saved to local storage");
	},
	searchEntityChange : function(oEvent) {

		var queryIndex = lens.FindQueryIndex(queryData.getData(), sQueryName.getValue());
		var query = queryData.getData().queries[queryIndex];
		query.entitySetLabel = sSearchEntity.getValue();
		query.entityType = lens.FindEntitySetFromEntitySetLabel(modelData.getData(), query.entitySetLabel).EntityType;
		query.entitySet = lens.FindEntitySetFromEntitySetLabel(modelData.getData(), query.entitySetLabel).Name;

		lens.RemoveRedundantFilterConditions(query.entityType, sSearchEntity.getBindingContext("queryData"), sap.ui.getCore().getModel("modelData").getData());

		this.queryNameChange();

	},
	addDatatypeProperty : function(oEvent) {
		var index;
		var sQueryContext = oEvent.getSource().getBindingContext("queryData"); 
		if (sQueryContext == undefined) {
			sQueryContext = sSearchEntity.getBindingContext("queryData");
			index = 0;
		} else {
			if (sap.ui.getCore().getModel("queryData").getProperty(sQueryContext + "/propertyType") != "object") {
				// Datatype property so adding as next filtercondition
				sQueryContext = lens.parentContextOf(sQueryContext);
				index = parseInt(this.getBindingContext("queryData").toString().split("/").last()) + 1;
			} else {
				index = 0;
			}
		}
		sEntityType = sap.ui.getCore().getModel("queryData").getProperty(sQueryContext + "/entityType");
		var oNewContext = new sap.ui.model.Context(queryData, sQueryContext + "/filterConditions");

		// TODO the following should be executed on the close event
		oNewContext.getObject().splice(index, 0, {
			"propertyType" : "datatype",
			"property" : null,
			"propertyLabel" : null,
			"condition" : null,
			"datatype" : null,
			"value" : null,
			"include" : true,
			"optional" : false
		});
		oNewContext = new sap.ui.model.Context(queryData, sQueryContext + "/filterConditions/" + index);
		sap.ui.getCore().byId("DatatypePropertyForm").setBindingContext(oNewContext, "queryData");
		var oContext = lens.GetModelContextfromEntity(modelData, sEntityType);
		sap.ui.getCore().byId("DatatypePropertyTemplate").setBindingContext(oContext, "modelData");
		oDatatypePropertyDialogFragment.open();
	},
	addObjectProperty : function(oEvent) {	
		var index;
		var sQueryContext = oEvent.getSource().getBindingContext("queryData"); 
		if (sQueryContext == undefined) {
			sQueryContext = sSearchEntity.getBindingContext("queryData");
			index = 0;
		} else {
			if (sap.ui.getCore().getModel("queryData").getProperty(sQueryContext + "/propertyType") != "object") {
				// Datatype property so adding as next filtercondition
				sQueryContext = lens.parentContextOf(sQueryContext);
				index = parseInt(this.getBindingContext("queryData").toString().split("/").last()) + 1;
			} else {
				index = 0;
			}
		}

		sEntityType = sap.ui.getCore().getModel("queryData").getProperty(sQueryContext + "/entityType");
		var oNewContext = new sap.ui.model.Context(queryData, sQueryContext + "/filterConditions");
		oNewContext.getObject().splice(index, 0, {
			"propertyType" : "object",
			"property" : null,
			"propertyLabel" : null,
			"entityType" : null,
			"include" : true,
			"optional" : false,
			"filterConditions" : []
		});
		oNewContext = new sap.ui.model.Context(queryData, sQueryContext + "/filterConditions/" + index);
		sap.ui.getCore().byId("ObjectPropertyForm").setBindingContext(oNewContext, "queryData");
		var oContext = lens.GetModelContextfromEntity(modelData, sEntityType);
		sap.ui.getCore().byId("ObjectPropertyTemplate").setBindingContext(oContext, "modelData");
		oObjectPropertyDialogFragment.open();
	},

	queryNameChange : function(oEvent) {
		var queryIndex = lens.FindQueryIndex(queryData.getData(), sQueryName.getValue());
		this.initializeQueryForm(new sap.ui.model.Context(queryData, "/queries/" + queryIndex));
	},
	onRouteMatched : function(oEvent) {
		var routeName = oEvent.getParameter("name");
		if (("entry" != routeName) && ("search" != routeName)) {
			return;
		}
		if (routeName == "search") {
			this.queryNameValue = oEvent.getParameter("arguments").queryName;
			var queryIndex = lens.FindQueryIndex(queryData.getData(), this.queryNameValue);
			if (queryIndex == null)
				this.queryNameValue = "(default)";
		} else {
			this.queryNameValue = "(default)";
		}
		{
			sQueryName.setValue(this.queryNameValue);
			this.queryNameChange();
		}
	},
	initializeQueryForm : function(bindingContext) {
		sSearchEntity.bindElement("queryData>" + bindingContext);
		sSearchText.bindElement("queryData>" + bindingContext);
		sQueryTreeTable.bindRows("queryData>" + bindingContext);
		sQueryName.bindElement("queryData>" + bindingContext);
		this.setSimpleSearchMode(queryData.getProperty("simple", bindingContext));
		sQueryController = this;
		sSearchText.onsapenter = function() {
			//TODO make sure it generates new query
			sSearchText.setValue(sSearchText.getLiveValue());
			sQueryController.resultsView();
		};
	},
	onInit : function() {
		// setup variables
		this.oRouter = sap.ui.core.routing.Router.getRouter("router");
		sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(this.onRouteMatched, this);
		sQueryController = this;
		sSearchForm = sap.ui.getCore().byId(this.createId("searchForm"));
		sQueryForm = sap.ui.getCore().byId(this.createId("queryForm"));
		sQueryExpandButton = sap.ui.getCore().byId(this.createId("queryExpandButton"));
		sSearchText = sap.ui.getCore().byId(this.createId("searchText"));
		sSearchEntity = sap.ui.getCore().byId(this.createId("searchEntity"));
		sQueryName = sap.ui.getCore().byId(this.createId("queryName"));

		oNewQueryDialogFragment = sap.ui.jsfragment("lens.NewQueryDialog", this);
		oDatatypePropertyDialogFragment = sap.ui.jsfragment("lens.DatatypePropertyDialog", this);
		oObjectPropertyDialogFragment = sap.ui.jsfragment("lens.ObjectPropertyDialog", this);
		oEntityDialogFragment = sap.ui.jsfragment("lens.EntityDialog", this);

		sQueryTreeTable = sap.ui.getCore().byId(this.createId("queryTreeTable"));

		modelData = sap.ui.getCore().getModel("modelData");
		queryData = sap.ui.getCore().getModel("queryData");
		datatypeData = sap.ui.getCore().getModel("datatypeData");

		this.queryRestoreList.current = queryData.getObject();

		{
			// Initialize global variables
			var sEntityType = "";
			var sPropertyType = "";

			// setup components

			sQueryName.setBindingContext(new sap.ui.model.Context(queryData, "/queries"), "queryData");

			sQueryName.setValue("(default)");
			sQueryName.bindItems("queryData>/queries", new sap.ui.core.ListItem().bindProperty("text", "queryData>queryName"));

			var instancesSchemaIndex = modelData.getData().DataServices[0].Schema.getIndex("Namespace", "Instances");

			sSearchText.bindProperty("value", "queryData>filter");
			// InstanceContainer

			sSearchEntity.bindProperty("value", "queryData>entitySet").bindItems(
					"modelData>/DataServices/0/Schema/" + instancesSchemaIndex + "/EntityContainer/0/EntitySet",
					new sap.ui.core.ListItem().bindProperty("text", "modelData>rdfs:label"));
			sQueryTreeTable.insertColumn(new sap.ui.table.Column({
				width : "250%",
				template : new sap.ui.commons.FormattedTextView() .bindProperty("visible", "queryData>include")
				.bindProperty(
						"htmlText",
						{
							parts : [ {
								path : "queryData>propertyType",
								type : new sap.ui.model.type.String()
							}, {
								path : "queryData>entityType",
								type : new sap.ui.model.type.String()
							}, {
								path : "queryData>propertyLabel",
								type : new sap.ui.model.type.String()
							}, {
								path : "queryData>condition",
								type : new sap.ui.model.type.String()
							}, {
								path : "queryData>value",
								type : new sap.ui.model.type.String()
							}, {
								path : "queryData>optional",
								type : new sap.ui.model.type.String()
							}, {
								path : "i18nModel>querySelect",
								type : new sap.ui.model.type.String()
							}, {
								path : "i18nModel>queryAnd",
								type : new sap.ui.model.type.String()
							}, {
								path : "i18nModel>queryWhere",
								type : new sap.ui.model.type.String()
							}, {
								path : "i18nModel>queryAndWhere",
								type : new sap.ui.model.type.String()
							}, {
								path : "i18nModel>queryWith",
								type : new sap.ui.model.type.String()
							}, {
								path : "i18nModel>queryAndWith",
								type : new sap.ui.model.type.String()
							}, {
								path : "i18nModel>queryOptional",
								type : new sap.ui.model.type.String()
							}, {
								path : "i18nModel>queryLinked",
								type : new sap.ui.model.type.String()
							} ],
							formatter : function(propertyType, entityType, propertyLabel, condition, value, optional, querySelect, queryAnd, queryWhere, queryAndWhere,
									queryWith, queryAndWith, queryOptional, queryLinked) {
								var opt;
								if (optional == true) {
									opt = queryOptional;
								} else {
									opt = "";
								}
								if (propertyType == null) {
									return querySelect + entityType;
								} else if (propertyType == "datatype") {
									if (this.getBindingContext("queryData").toString().split("/").last() == "0") {
										if (value == "" || value == null || value == undefined) {
											return "<em>" + queryWith + opt + "</em>" + "<strong>" + propertyLabel + "</strong>";
										} else {
											return "<em>" + queryWhere + opt + "</em>" + "<strong>" + propertyLabel + "</strong>" + " <em>" + condition + "</em>" + " <strong>"
													+ value + "</strong>";
										}

									} else {
										if (value == "" || value == null || value == undefined) {
											return "<em>" + queryAndWith + opt + "</em>" + "<strong>" + propertyLabel + "</strong>";
										} else {
											return "<em>" + queryAndWhere + opt + "</em>" + "<strong>" + propertyLabel + "</strong>" + " <em>" + condition + "</em>" + " <strong>"
													+ value + "</strong>";
										}

									}
								} else {
									if (this.getBindingContext("queryData").toString().split("/").last() == "0") {
										return "<em>" + queryWhere + opt + queryLinked + "</em>" + "<strong>" + propertyLabel + "</strong>";
									} else {
										return "<em>" + queryAnd + opt + queryLinked + "</em>" + "<strong>" + propertyLabel + "</strong>";
									}

								}
							}
						}).attachBrowserEvent("click", function(oEvent) {
					sQueryController.pushQuery(sap.ui.getCore().getModel("queryData").getData());
					var sContextArray = lens.parentContextOf(this.getBindingContext("queryData"));
					sEntityType = sap.ui.getCore().getModel("queryData").getProperty(sContextArray + "/entityType");
					var oContext = lens.GetModelContextfromEntity(modelData, sEntityType);

					sPropertyType = sap.ui.getCore().getModel("queryData").getProperty(this.getBindingContext("queryData") + "/propertyType");
					if (sPropertyType == null) {
						sPropertyType = "object";
						sap.ui.getCore().byId("EntityForm").setBindingContext(this.getBindingContext("queryData"), "queryData");
						oEntityDialogFragment.open();
					} else if (sPropertyType == "object") {
						sap.ui.getCore().byId("ObjectPropertyForm").setBindingContext(this.getBindingContext("queryData"), "queryData");
						sap.ui.getCore().byId("ObjectPropertyTemplate").setBindingContext(oContext, "modelData");
						oObjectPropertyDialogFragment.open();
					} else {
						sap.ui.getCore().byId("DatatypePropertyForm").setBindingContext(this.getBindingContext("queryData"), "queryData");
						sap.ui.getCore().byId("DatatypePropertyTemplate").setBindingContext(oContext, "modelData");

						// Initialize the ConditionTemplate list
						var sProperty = sap.ui.getCore().getModel("queryData").getProperty(this.getBindingContext("queryData") + "/propertyLabel");
						var typeIndex = modelData.getProperty("Property", oContext).getIndex("Name", sProperty);
						var type = modelData.getProperty(oContext + "/Property/" + typeIndex + "/Type");
						sap.ui.getCore().byId("ConditionTemplate").bindElement("datatypeData>/datatypes/" + type);

						oDatatypePropertyDialogFragment.open();
					}

				})
			}), 0);

			sQueryTreeTable.insertColumn(new sap.ui.table.Column({
				width : "15%",
				hAlign : "Center",
				template : new sap.ui.commons.CheckBox().bindProperty("checked", "queryData>include").setTooltip("{i18nModel>queryEnableClause}")
			}), 1);
			sQueryTreeTable.insertColumn(new sap.ui.table.Column({
				width : "15%",
				hAlign : "Center",
				template : new sap.ui.commons.CheckBox().bindProperty("checked", "queryData>optional").setTooltip("{i18nModel>queryOptionalClause}")
			}), 2);
			sQueryTreeTable.insertColumn(new sap.ui.table.Column({
				width : "15%",
				hAlign : "Center",
				template : new sap.ui.commons.Button({
					icon : "images/delete.gif",
					tooltip : "{i18nModel>queryDeleteClause}",
					lite : true,
					press : function() {
						sQueryController.pushQuery(sap.ui.getCore().getModel("queryData").getData());
						var sQueryContext = lens.parentContextOf(this.getBindingContext("queryData"));
						// sEntityType = sap.ui.getCore().getModel("queryData").getProperty(sQueryContext + "/entityType");
						var queryData = this.getModel("queryData");
						var queryModelData = queryData.getData();
						var index = parseInt(this.getBindingContext("queryData").toString().split("/").last());
						var oNewContext = new sap.ui.model.Context(queryData, sQueryContext + "/filterConditions");
						oNewContext.getObject().remove(index);
						this.getModel("queryData").setData(queryModelData);
					}
				})
			}), 3);
			sQueryTreeTable.insertColumn(new sap.ui.table.Column({
				width : "15%",
				hAlign : "Center",
				label : new sap.ui.commons.Button({
					icon : "images/add.gif",
					tooltip : "{i18nModel>queryAddClause}",
					lite : true,
					press : this.addDatatypeProperty
				}),
				template : new sap.ui.commons.Button({
					icon : "images/add.gif",
					tooltip : "{i18nModel>queryAddClause}",
					lite : true,
					press : this.addDatatypeProperty

				})
			}), 4);
			sQueryTreeTable.insertColumn(new sap.ui.table.Column({
				width : "20%",
				hAlign : "Center",
				label : new sap.ui.commons.Button({
					vAlign : "Top",
					icon : "images/link.gif",
					tooltip : "{i18nModel>queryLinkClause}",
					lite : true,
					press : this.addObjectProperty
				}),
				template : new sap.ui.commons.Button({
					icon : "images/link.gif",
					tooltip : "{i18nModel>queryLinkClause}",
					lite : true,
					press : this.addObjectProperty
				})
			}), 5);

			sQueryTreeTable.setSelectionMode(sap.ui.table.SelectionMode.Single).setEnableColumnReordering(false).setColumnHeaderVisible(true).setColumnHeaderHeight(
					25).setNavigationMode(sap.ui.table.NavigationMode.Scrollbar).setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Interactive).setEditable(false)
					.clearSelection();
		}

	}
});