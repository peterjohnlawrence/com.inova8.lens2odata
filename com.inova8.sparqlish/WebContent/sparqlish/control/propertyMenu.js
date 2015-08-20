// TODO why is this required
jQuery.sap.require("sap.ui.unified.MenuItem");
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
								type : "sap.ui.commons.Link",
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
							changed : {
								enablePreventDefault : true
							}
						}
					},
					init : function() {
						var self = this;
						var dataPropertySelect = function(oEvent) {
							var sSelectedProperty = oEvent.getParameter("item").getText();
							if (self.getAggregation("_property").getText() != oEvent.getParameter("item").getText()) {
								var currentModel = self.getModel("queryModel");
								var currentContext = self.getBindingContext("queryModel");
								var currentPropertyClause = currentModel.getProperty("", currentContext).propertyClause;
								if (currentPropertyClause == undefined) {
									currentModel.getProperty("", currentContext).propertyClause = {};
									currentPropertyClause = currentModel.getProperty("", currentContext).propertyClause;
								}
								currentPropertyClause._class = "DataPropertyClause";
								currentPropertyClause.dataProperty = sSelectedProperty;
								currentPropertyClause.dataPropertyFilters = {};
								delete currentPropertyClause.objectProperty;
								delete currentPropertyClause.objectPropertyFilters;
								// clauses only apply to objectProperties but we have switched to a dataProperty
								delete currentPropertyClause.clauses;
								self.fireChanged({
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
						var objectPropertySelect = function(oEvent) {
							var sSelectedProperty = oEvent.getParameter("item").getText();
							if (self.getAggregation("_property").getText() != oEvent.getParameter("item").getText()) {
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
						var oLink = new sap.ui.commons.Link(
								{
									text : "{=  ${queryModel>propertyClause/_class} ==='DataPropertyClause'  ?   ${queryModel>propertyClause/dataProperty} : (${queryModel>propertyClause/_class} ==='ObjectPropertyClause' ? ${queryModel>propertyClause/objectProperty}: ${i18nModel>clauseSelectProperty})}",
									tooltip : "{i18nModel>propertyMenuTooltip}"
								}).addStyleClass("menuLink");
						self.oObjectPropertyMenu = new sap.ui.unified.Menu({
							items : {
								path : "entityTypeModel>/navigationProperty",
								template : new sap.ui.unified.MenuItem({
									text : "{entityTypeModel>name}"
								}).attachSelect(objectPropertySelect)
							}
						});
						self.oDataPropertyMenu = new sap.ui.unified.Menu({
							items : {
								path : "entityTypeModel>/property",
								template : new sap.ui.unified.MenuItem({
									text : "{entityTypeModel>name}"
								}).attachSelect(dataPropertySelect)
							}
						});

						self.oPropertyMenuItemObjectProperty = new sap.ui.unified.MenuItem();
						self.oPropertyMenuItemDataProperty = new sap.ui.unified.MenuItem();
						self.oPropertyMenu = new sap.ui.unified.Menu();
						self.oPropertyMenu.addItem(self.oPropertyMenuItemObjectProperty).addItem(self.oPropertyMenuItemDataProperty);
						self.oPropertyMenuItemObjectProperty.setSubmenu(self.oObjectPropertyMenu);
						self.oPropertyMenuItemDataProperty.setSubmenu(self.oDataPropertyMenu);
						// self.oPropertyMenu.attachItemSelect(dataPropertySelect);

						oLink.attachPress(function(oEvent) {
							var self = oEvent.getSource().getParent();
							// Setup property menu according to current model context if not already set
							var oEntityTypeContext = self.getParent().getEntityTypeContext();
							var sEntityTypeQName = self.getParent().getEntityTypeQName();

							// if (oEntityTypeContext == undefined) {
							// sEntityTypeQName = entityTypeQName(self.getModel("queryModel"), oMetaModel,
							// self.getBindingContext("queryModel"));
							// oEntityTypeContext = oMetaModel.getODataEntityType(sEntityTypeQName);
							// self.getParent().setEntityTypeContext(oEntityTypeContext);
							// self.getParent().setEntityTypeQName(sEntityTypeQName);
							// }
							self.oEntityTypeModel = new sap.ui.model.json.JSONModel();
							self.oEntityTypeModel.setData(oEntityTypeContext);
							self.oPropertyMenu.setModel(self.oEntityTypeModel, "entityTypeModel");

							self.oPropertyMenuItemObjectProperty.setText(oEntityTypeContext.name + " "
									+ sap.ui.getCore().getModel("i18nModel").getProperty("propertyMenuLink"));
							self.oPropertyMenuItemDataProperty.setText(oEntityTypeContext.name + " "
									+ sap.ui.getCore().getModel("i18nModel").getProperty("propertyMenuAttribute"));
							// TODO not always rerendering
							var eDock = sap.ui.core.Popup.Dock;
							self.oPropertyMenu.open(false, this.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, this.getDomRef());
//							self.oPropertyMenu.open(false, oLink.getFocusDomRef(), eDock.BeginTop, eDock.beginBottom, oLink.getDomRef());
						});

						self.setAggregation("_property", oLink);
					},
					renderer : function(oRm, oControl) {
						//oRm.writeControlData(oControl);
						oRm.renderControl(oControl.getAggregation("_property"));
					}
				});