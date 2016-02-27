jQuery.sap.require("sap.m.P13nDialog");
jQuery.sap.require("sap.m.P13nColumnsPanel");
jQuery.sap.require("sap.m.P13nItem");
jQuery.sap.require("sparqlish.control.extendFilter");

sap.ui.commons.Link.extend("sparqlish.control.addClauses", {
	metadata : {
		properties : {},
		aggregations : {
			_icon : {
				type : "sparqlish.control.extendFilter", // "sap.ui.core.Icon",
				multiple : false
			}
		},
		events : {
			clausesSelected : {
				enablePreventDefault : true
			}
		}
	},

	init : function() {
		var self = this;

		self.oAddClauseLink = new sparqlish.control.extendFilter({
			visible : true,
			icon : "add-process",
			tooltip : "{i18nModel>addClause.tooltip}"
		});
		self.oDialog = new sap.m.P13nDialog({
			title : "{i18nModel>addClause.title}",
			cancel : function() {
				self.oDialog.close();
			},
			ok : function() {
				// TODO is this the correct order?
				self.oDialog.close();
				self.fireClausesSelected({
					objectPropertyPayload : self.oObjectPropertyList.getOkPayload(),
					dataPropertyPayload : self.oDataPropertyList.getOkPayload()
				});
			}
		});

		self.oDialog.bindElement("queryModel>");
		self.oObjectPropertyList = new sap.m.P13nColumnsPanel({
			title : "{i18nModel>addClause.navigationProperties}",
			items : {
				path : "entityTypeModel>/navigationProperty",
				template : new sap.m.P13nItem({
					columnKey : "{entityTypeModel>name}",
					text : "{= ${entityTypeModel>sap:label} || ${entityTypeModel>name}}"
				})
			}
		});

		self.oDataPropertyList = new sap.m.P13nColumnsPanel({
			title : "{i18nModel>addClause.dataProperties}",
			items : {
				path : "entityTypeModel>/property",
				template : new sap.m.P13nItem({
					columnKey : "{entityTypeModel>name}",
					text : "{= ${entityTypeModel>sap:label} || ${entityTypeModel>name}}"
				})
			}
		});
		self.oDialog.addPanel(self.oObjectPropertyList);
		self.oDialog.addPanel(self.oDataPropertyList);

		self.oAddClauseLink.attachPress(function(oEvent) {
			var self = oEvent.getSource().getParent();
			// Setup property menu according to current model context if not already set
			var oEntityTypeContext = self.getParent().getRangeEntityTypeContext();
			var sEntityTypeQName = self.getParent().getRangeEntityTypeQName();

			self.oDialog.setModel(self.getModel("metaModel").getEntityTypeModel(sEntityTypeQName), "entityTypeModel");
			// self.initData();
			if (self.oDialog.isOpen()) {
				self.oDialog.close();
			} else {
				self.oDialog.open();
			}
		});
		self.setAggregation("_icon", self.oAddClauseLink);
	},
	renderer : function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_icon"));
	}
});