jQuery.sap.require("sap.m.P13nDialog");
jQuery.sap.require("sap.m.P13nColumnsPanel");
jQuery.sap.require("sap.m.P13nItem");
jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("lib.ODataMetaModel.v2");
sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.propertyMenu", {
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
					// Cleanup
					delete currentPropertyClause.multiplicity;
					delete currentPropertyClause.objectProperty;
					delete currentPropertyClause.objectPropertyFilters;
					// clauses only apply to objectProperties but we have switched to a dataProperty
					delete currentPropertyClause.clauses;

					// TODO Why do I need to do this when property bound to model???
					// self.getAggregation("_property").setText(sSelectedProperty);
					// currentModel.refresh();
					// TODO ??????????
					self.getParent().rerender();
					self.firePropertyChanged({
						dataProperty : sSelectedProperty
					});
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

					currentPropertyClause.multiplicity = self.getModel("metaModel").getODataInheritedAssociation(self.getParent().getDomainEntityTypeContext(),
							sSelectedProperty).multiplicity;
					currentPropertyClause.objectPropertyFilters = [];
					currentPropertyClause.clauses = {};
					// Cleanup
					delete currentPropertyClause.type;
					delete currentPropertyClause.dataProperty;
					delete currentPropertyClause.dataPropertyFilters;

					// TODO Why do I need to do this when property bound to model???
					// self.getAggregation("_property").setText(sSelectedProperty);
					// currentModel.refresh();
					// TODO ??????????
					// self.getAggregation("_objectPropertyFilters").getAggregation("_extendFilter").setVisible(true);
					self.getParent().rerender();
					self.firePropertyChanged({
						objectProperty : sSelectedProperty
					});
				} else {
					self.fireSelected({
						objectProperty : sSelectedProperty
					});
				}
			};
			var oPropertyLink = new sap.m.Link({
				text : {
					parts : [ {
						path : "queryModel>propertyClause/dataProperty",
						type : new sap.ui.model.type.String()
					}, {
						path : "queryModel>propertyClause/objectProperty",
						type : new sap.ui.model.type.String()
					}, {
						path : "queryModel>propertyClause/complexDataProperty",
						type : new sap.ui.model.type.String()
					} ],
					formatter : function(sDataProperty, sObjectProperty, sComplexDataProperty) {
						var oProperty;
						try {
							if (!jQuery.isEmptyObject(sDataProperty)) {
								oProperty = this.getModel("metaModel").getODataInheritedProperty(this.getParent().getParent().getDomainEntityTypeContext(), sDataProperty);
							} else if (!jQuery.isEmptyObject(sObjectProperty)) {
								oProperty = this.getModel("metaModel").getODataInheritedNavigationProperty(this.getParent().getParent().getDomainEntityTypeContext(),
										sObjectProperty);
							} else if (!jQuery.isEmptyObject(sComplexDataProperty)) {
								oProperty = this.getModel("metaModel").getODataInheritedComplexProperty(this.getParent().getParent().getDomainEntityTypeContext(),
										sComplexDataProperty);
							} else {
								return "";
							}
						} catch (e) {
							return "";
						}
						return oProperty["sap:label"] || oProperty["name"]
					}
				},
				tooltip : "{i18nModel>propertyMenu.tooltip}"
			});

			self.oObjectPropertyMenu = new sap.m.P13nColumnsPanel({
				title : "{= ${i18nModel>propertyMenu.navigationProperties}}",
				items : {
					path : "entityTypeModel>/navigationProperty",
					template : new sap.m.P13nItem({
						columnKey : "{entityTypeModel>name}",
						text : "{= ${entityTypeModel>sap:label} || ${entityTypeModel>name}}"
					})
				// TODO .attachSelect(objectPropertySelect)
				}
			});
			// TODO Undocumented hack to make P13nColumnsPanel to be single select
			self.oObjectPropertyMenu._oTable.setMode(sap.m.ListMode.SingleSelect);
			self.oDataPropertyMenu = new sap.m.P13nColumnsPanel({
				title : "{i18nModel>propertyMenu.dataProperties}",
				items : {
					path : "entityTypeModel>/property",
					template : new sap.m.P13nItem({
						columnKey : "{entityTypeModel>name}",
						text : "{= ${entityTypeModel>sap:label} || ${entityTypeModel>name}}"
					})
				}
			});
			// TODO Undocumented hack to make P13nColumnsPanel to be single select
			self.oDataPropertyMenu._oTable.setMode(sap.m.ListMode.SingleSelect);

			self.oDialog = new sap.m.P13nDialog({
				title : "{i18nModel>propertyMenu.title}",
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
				self.oDialog.setModel(self.getModel("metaModel").getEntityTypeModel(sEntityTypeQName), "entityTypeModel");
				if (self.oDialog.isOpen()) {
					self.oDialog.close();
				} else {
					self.oDialog.open();
				}
			});
			self.setAggregation("_property", oPropertyLink);
		},
		renderer : function(oRm, oControl) {
			//Need to distinguish between object, complex, and data properties
			if (!jQuery.isEmptyObject(oControl.getParent().getObjectProperty())) {
				oRm.renderControl(oControl.getAggregation("_property").addStyleClass("objectPropertyMenuLink"));
			} else {
				oRm.renderControl(oControl.getAggregation("_property").addStyleClass("dataPropertyMenuLink"));
			}
		}
	});
});