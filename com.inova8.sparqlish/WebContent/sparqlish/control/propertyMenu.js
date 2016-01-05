jQuery.sap.require("sap.m.P13nDialog");
jQuery.sap.require("sap.m.P13nColumnsPanel");
jQuery.sap.require("sap.m.P13nItem");
jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("sparqlish.utilities");
sap.ui.core.Control
		.extend(
				"sparqlish.control.propertyMenu",
				{
					metadata : {
						properties : {},
						aggregations : {
							_property : {
								type : "sap.m.Link",
								multiple : false
							}
						},
						events : {
							selected : {
								enablePreventDefault : true
							},
							unselected : {
								enablePreventDefault : true
							},
							propertyChanged : {
								enablePreventDefault : true
							}
						}
					},
					init : function() {
						var self = this;
						var dataPropertySelect = function(sSelectedProperty) {
							// var sSelectedProperty = oEvent.getParameter("item").getText();
							if (self.getAggregation("_property").getText() != sSelectedProperty) {
								var currentModel = self.getModel("queryModel");
								var currentContext = self.getBindingContext("queryModel");
								var currentPropertyClause = currentModel.getProperty("", currentContext).propertyClause;
								if (currentPropertyClause == undefined) {
									currentModel.getProperty("", currentContext).propertyClause = {};
									currentPropertyClause = currentModel.getProperty("", currentContext).propertyClause;
								}
								currentPropertyClause._class = "DataPropertyClause";
								currentPropertyClause.dataProperty = sSelectedProperty;
								currentPropertyClause.dataPropertyFilters = {
									"_class" : "DataPropertyFilters"
								};
								delete currentPropertyClause.objectProperty;
								delete currentPropertyClause.objectPropertyFilters;
								// clauses only apply to objectProperties but we have switched to a dataProperty
								delete currentPropertyClause.clauses;
								self.firePropertyChanged({
									dataProperty : sSelectedProperty
								});
								self.getAggregation("_property").setText(sSelectedProperty);
								currentModel.refresh();
								// TODO ??????????
								self.getParent().rerender();
							} else {
								self.fireSelected({
									dataProperty : sSelectedProperty
								});
							}
						};
						var objectPropertySelect = function(sSelectedProperty) {
							// var sSelectedProperty = oEvent.getParameter("item").getText();
							if (self.getAggregation("_property").getText() != sSelectedProperty) {
								var currentModel = self.getModel("queryModel");
								var currentContext = self.getBindingContext("queryModel");
								var currentPropertyClause = currentModel.getProperty("", currentContext).propertyClause;
								if (currentPropertyClause == undefined) {
									currentModel.getProperty("", currentContext).propertyClause = {};
									currentPropertyClause = currentModel.getProperty("", currentContext).propertyClause;
								}
								currentPropertyClause._class = "ObjectPropertyClause";
								currentPropertyClause.objectProperty = sSelectedProperty;
								currentPropertyClause.objectPropertyFilters = [];
								currentPropertyClause.clauses = {};
								delete currentPropertyClause.dataProperty;
								delete currentPropertyClause.dataPropertyFilters;

								self.fireChanged({
									objectProperty : sSelectedProperty
								});
								self.getAggregation("_property").setText(sSelectedProperty);
								currentModel.refresh();
								// TODO ??????????
								// self.getAggregation("_objectPropertyFilters").getAggregation("_extendFilter").setVisible(true);
								self.getParent().rerender();
							} else {
								self.fireSelected({
									objectProperty : sSelectedProperty
								});
							}
						};
						var oPropertyLink = new sap.m.Link(
								{
									text : "{=  ${queryModel>propertyClause/_class} ==='DataPropertyClause'  ?   ${queryModel>propertyClause/dataProperty} : (${queryModel>propertyClause/_class} ==='ObjectPropertyClause' ? ${queryModel>propertyClause/objectProperty}: ${i18nModel>clauseSelectProperty})}",
									tooltip : "{i18nModel>propertyMenuTooltip}"
								});// .addStyleClass("menuLink");

						self.oObjectPropertyMenu = new sap.m.P13nColumnsPanel({
						 title : "{i18nModel>navigationProperties}",
							items : {
								path : "entityTypeModel>/navigationProperty",
								template : new sap.m.P13nItem({
									columnKey : "{entityTypeModel>name}",
									text : "{entityTypeModel>name}"
								})
							// TODO .attachSelect(objectPropertySelect)
							}
						});
						// TODO Undocumented hack to make P13nColumnsPanel to be single select
						self.oObjectPropertyMenu._oTable.setMode(sap.m.ListMode.SingleSelect);
						self.oDataPropertyMenu = new sap.m.P13nColumnsPanel({
							title : "{i18nModel>dataProperties}",
							items : {
								path : "entityTypeModel>/property",
								template : new sap.m.P13nItem({
									columnKey : "{entityTypeModel>name}",
									text : "{entityTypeModel>name}"
								})
							// TODO .attachSelect(dataPropertySelect)
							}
						});
						// TODO Undocumented hack to make P13nColumnsPanel to be single select
						self.oDataPropertyMenu._oTable.setMode(sap.m.ListMode.SingleSelect);

						self.oDialog = new sap.m.P13nDialog({
							title : "{i18nModel>editClauseTitle}",
							cancel : function() {
								self.oDialog.close();
							},
							ok : function(oEvent) {
								// TODO is this the correct order?
								self.oDialog.close();
								switch (self.oDialog.indexOfPanel(self.oDialog.getVisiblePanel())) {
								case 0:
									if (!jQuery.isEmptyObject(self.oObjectPropertyMenu.getOkPayload().selectedItems[0]))
										objectPropertySelect(self.oObjectPropertyMenu.getOkPayload().selectedItems[0].columnKey);
									break;
								case 1:
									if (!jQuery.isEmptyObject(self.oDataPropertyMenu.getOkPayload().selectedItems[0]))
										dataPropertySelect(self.oDataPropertyMenu.getOkPayload().selectedItems[0].columnKey);
									break;
								default:
								}
							}
						});
						self.oDialog.addPanel(self.oObjectPropertyMenu);
						self.oDialog.addPanel(self.oDataPropertyMenu);

						oPropertyLink.attachPress(function(oEvent) {
							var self = oEvent.getSource().getParent();
							// Setup property menu according to current model context if not already set
							var oEntityTypeContext = self.getParent().getDomainEntityTypeContext();
							var sEntityTypeQName = self.getParent().getDomainEntityTypeQName();
							self.oDialog.setModel(self.getModel("metaModel").getEntityTypeModel(sEntityTypeQName),"entityTypeModel");

							// TODO not setting title or at least not displaying
							self.oObjectPropertyMenu.setTitle(oEntityTypeContext.name + " " + sap.ui.getCore().getModel("i18nModel").getProperty("propertyMenuLink"));
							self.oDataPropertyMenu.setTitle(oEntityTypeContext.name + " " + sap.ui.getCore().getModel("i18nModel").getProperty("propertyMenuAttribute"));
							if (self.oDialog.isOpen()) {
								self.oDialog.close();
							} else {
								self.oDialog.open();
							}
						});

						self.setAggregation("_property", oPropertyLink);
					},
					renderer : function(oRm, oControl) {
						if (!jQuery.isEmptyObject(oControl.getParent().getObjectProperty())) {
							oRm.renderControl(oControl.getAggregation("_property").addStyleClass("objectPropertyMenuLink"));
						} else {
							oRm.renderControl(oControl.getAggregation("_property").addStyleClass("dataPropertyMenuLink"));
						}
					}
				});