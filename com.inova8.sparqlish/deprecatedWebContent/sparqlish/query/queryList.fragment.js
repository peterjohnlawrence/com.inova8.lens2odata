jQuery.sap.require("sap.ui.commons.ComboBox");
jQuery.sap.require("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.model.json.JSONModel");
sap.ui.jsfragment("sparqlish.query.queryList", {
	createContent : function(oController) {
		var oComboBox = new sap.ui.commons.ComboBox("oComboBox");
		oComboBox.setModel(oController.oQueriesModel);
		oComboBox.setMaxPopupItems(20);
		oComboBox.setWidth("400px");
		var oItemTemplate = new sap.ui.core.ListItem();
		oItemTemplate.bindProperty("text", "name");
		oComboBox.bindItems("/services/0/queries", oItemTemplate);
		oComboBox.attachChange(function() {
			var i;
			for (i = 0; i < oController.oQueriesModel.getData().services[0].queries.length; i++) {
				if (oController.oQueriesModel.getData().services[0].queries[i].name == oComboBox.getValue()) {
					oController.iCurrentQuery = i;
					break;
				} else
					oController.iCurrentQuery = null;
			}
			if (oController.iCurrentQuery != null) {
				oController.querySelectionChange(i);

			}
		});
		return oComboBox;
	}
});
