jQuery.sap.require("sap.m.P13nDialog");
jQuery.sap.require("sap.m.P13nColumnsPanel");
jQuery.sap.require("sap.m.P13nItem");

sap.ui.define([ "sap/ui/core/Control" ], function(Control) {
	"use strict";
	return Control.extend("control.conceptMenu", {
		metadata : {
			aggregations : {
				_concept : {
					type : "sap.m.Link",
					multiple : false
				}
			},
			events : {
				conceptChanged : {
					enablePreventDefault : true
				}
			}
		},
		init : function() {
			var self = this;
			self.oConceptLink = new sap.m.Link({
				text : {
					parts : [ {
						path : "queryModel>concept",
						type : new sap.ui.model.type.String()
					}],
					formatter : function( sConcept) {
						var oEntitySet;
						if (!jQuery.isEmptyObject(sConcept)) {
							oEntitySet = this.getModel("metaModel").getODataEntitySet(sConcept);
						} else{
							return "";
						}
						return oEntitySet["sap:label"] || oEntitySet["Name"]
					}
				},
				tooltip : "{i18nModel>conceptMenu.tooltip}"
			});
			self.oConceptLink.addStyleClass("conceptMenuLink");
			self.oConceptList = new sap.m.P13nColumnsPanel({
				title : "{i18nModel>conceptMenu.conceptList}",
				type:"columns",
				visible: true,
				items : {
					path : "entityContainer>/entitySet",
					template : new sap.m.P13nItem({
						columnKey : "{entityContainer>name}",
						text : 	"{= ${entityContainer>sap:label} || ${entityContainer>name}}",
						visible: true
					})
				},
			});
			// TODO Undocumented hack to make P13nColumnsPanel to be single select
			self.oConceptList._oTable.setMode(sap.m.ListMode.SingleSelect);
			self.oDialog = new sap.m.P13nDialog({
				title : "{i18nModel>conceptMenu.title}",
				cancel : function() {
					self.oDialog.close();
				},
				ok : function(oEvent) {
					var newConcept = self.oConceptList.getOkPayload().selectedItems[0].columnKey;
					if (self.getAggregation("_concept").getText() != newConcept) {
						self.getAggregation("_concept").setText(newConcept);
						self.fireConceptChanged({
							concept : newConcept
						});
					}
					self.oDialog.close();
				}
			});
			self.oDialog.addPanel(self.oConceptList);

			self.oConceptLink.attachPress(function(oEvent) {
				if (self.oDialog.isOpen()) {
					self.oDialog.close();
				} else {
					
					self.oDialog.open();
				}
			});
			self.setAggregation("_concept", self.oConceptLink);
		},
		renderer : function(oRm, oControl) {
			// TODO really this should be done on a binding change event but where is it?
			if (oControl.getAggregation("_concept").getText() == "") {
				// not yet defined so lets bind to the first concept in collection
				oControl.getAggregation("_concept").setText(oControl.getModel("entityContainer").getProperty("/entitySet/0/name"));
			}
			oRm.renderControl(oControl.getAggregation("_concept"));
		}
	});
});