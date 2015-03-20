jQuery.sap.require("sap.ui.commons.ComboBox");
jQuery.sap.require("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.model.json.JSONModel");
sap.ui.jsfragment("sparqlish.query.queryList", {
	createContent : function(oController) {
		var oComboBox = new sap.ui.commons.ComboBox("oComboBox");
		oComboBox.setModel(oController.oQueryModel);
		oComboBox.setMaxPopupItems(20);
		var oItemTemplate = new sap.ui.core.ListItem();
		oItemTemplate.bindProperty("text", "name");
		oComboBox.bindItems("/queries", oItemTemplate);
		oComboBox.attachChange(function() {
			var i;
			for (i = 0; i < oController.queries.oQueries.length; i++) {
				if (oController.queries.oQueries[i].sName == oComboBox.getValue()) {
					oController.iCurrentQuery = i;
					break;
				} else
					oController.iCurrentQuery = null;
			}
			if (oController.iCurrentQuery != null) {
				oController.oViewModel = new sap.ui.model.json.JSONModel();
				oController.oViewModel.setData(queries.oQueries[i].oViewModel);
				oController.oTable.setModel(oController.oViewModel, "viewModel");
				oController.oTable.bindRows("viewModel>/");
//				oCol = new sap.ui.table.Column({
//					label : "I",
//					template : "viewModel>index",
//					editable : false,
//					visible : true,
//					width : "40px"
//				});
//				oController.oTable.addColumn(oCol);
//				oFilter = new sap.ui.model.Filter({
//					path : "viewModel>index",
//					operator : sap.ui.model.FilterOperator.NE,
//					value1 : "0"
//				});
//				oController.oTable.filter(oCol, 0);
			}
		});
		return oComboBox;
	}
});
