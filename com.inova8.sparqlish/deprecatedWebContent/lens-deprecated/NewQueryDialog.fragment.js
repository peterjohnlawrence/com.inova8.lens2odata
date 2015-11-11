sap.ui.jsfragment("lens.NewQueryDialog", {
	createContent : function(oController) {
		var oNewQueryDialog = new sap.ui.commons.Dialog("NewQueryDialog", {
			title : "{i18nModel>newQueryDialogTitle}",
			modal : true,
			maxWidth : "500px",
			showCloseButton : false
		});
		var queryNameTemplate = new sap.ui.commons.TextField(this.createId("QueryNameTemplate"), {
			// value : "{queryData>queryName}",
			editable : true,
		});
		queryNameTemplate.onsapenter = function() {
			oCloseButton.focus();
			oCloseButton.firePress();
		};
		var oCloseButton = new sap.ui.commons.Button({
			text : "{i18nModel>dialogClose}",
			press : function() {
				var newQueryName = queryNameTemplate.getValue();
				if (newQueryName.length > 0) {
					if (lens.AddSimpleQuery(newQueryName, queryData)) {
						sQueryName.setValue(newQueryName);
						var queryIndex = lens.FindQueryIndex(queryData.getData(), newQueryName);
						sQueryController.initializeQueryForm("/queries/" + queryIndex);
						oNewQueryDialog.close();
					} else {
						queryNameTemplate.setValue("Invalid name:" + queryNameTemplate.getValue());
					}
				}
			}
		});
		crateNewSearch = function() {
			var newQueryName = queryNameTemplate.getValue();
			if (lens.AddSimpleQuery(newQueryName, queryData)) {
				sQueryName.setValue(newQueryName);
				var queryIndex = lens.FindQueryIndex(queryData.getData(), newQueryName)
				sQueryController.initializeQueryForm("/queries/" + queryIndex);
				oNewQueryDialog.close();
			} else {
				queryNameTemplate.setValue("Invalid name:" + queryNameTemplate.getValue());
			}
		};

		var oCancelButton = new sap.ui.commons.Button({
			text : "{i18nModel>dialogCancel}",
			press : function() {
				queryNameTemplate.setValue("");
				oNewQueryDialog.close();
			}
		});
		oNewQueryDialog.addButton(oCloseButton);
		oNewQueryDialog.addButton(oCancelButton);
		oNewQueryDialog.addContent(queryNameTemplate);
		return oNewQueryDialog;
	}
});