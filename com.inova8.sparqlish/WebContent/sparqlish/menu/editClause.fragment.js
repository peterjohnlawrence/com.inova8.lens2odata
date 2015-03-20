jQuery.sap.require("sap.ui.commons.Dialog");
jQuery.sap.require("sap.ui.commons.TextField");
jQuery.sap.require("sap.ui.commons.Button");
jQuery.sap.require("sap.ui.commons.CheckBox");
jQuery.sap.require("sap.ui.commons.layout.MatrixLayout");
sap.ui.jsfragment("sparqlish.menu.editClause", {
	createContent : function(oController) {
		var oEditClauseDialog = new sap.ui.commons.Dialog();
		oEditClauseDialog.setTitle("Edit Clause");
		var oClauseLayout = new sap.ui.commons.layout.MatrixLayout("oClauseLayout", {
			columns : 3,
			width : "100%"
		});
		var oClauseText = new sap.ui.commons.TextField("oClauseText", {
			tooltip : "New clause",
			editable : true,
			width : "500px",
			value : {
				path : "_class"
			}
		});
		var oIgnoreCheck = new sap.ui.commons.CheckBox("oIgnoreCheck", {
			editable : true,
			checked : {
				path : "ignore"
			},
			text:"Ignore"
		});
		var oOptionalCheck = new sap.ui.commons.CheckBox("oOptionalCheck", {
			editable : true,
			checked : {
				path : "optional"
			},
			text:"Optional"
		});
		oClauseLayout.createRow(oClauseText, oOptionalCheck, oIgnoreCheck)
		oEditClauseDialog.addContent(oClauseLayout);
		oEditClauseDialog.addButton(new sap.ui.commons.Button({
			text : "OK",
			press : function(oEvent) {
				oEditClauseDialog.close();
			}
		}));
		return oEditClauseDialog;
	}
});