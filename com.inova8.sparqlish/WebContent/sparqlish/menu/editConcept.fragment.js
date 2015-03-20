jQuery.sap.require("sap.ui.commons.Dialog");
jQuery.sap.require("sap.ui.commons.TextField");
jQuery.sap.require("sap.ui.commons.Button");
jQuery.sap.require("sap.ui.commons.CheckBox");
jQuery.sap.require("sap.ui.commons.layout.MatrixLayout");
sap.ui.jsfragment("sparqlish.menu.editConcept", {
	createContent : function(oController) {
		var oEditConceptDialog = new sap.ui.commons.Dialog();
		oEditConceptDialog.setTitle("Edit Concept");
		var oConceptLayout = new sap.ui.commons.layout.MatrixLayout("oConceptLayout", {
			columns : 2,
			width : "100%"
		});
	 var oConceptText = new sap.ui.commons.TextField("oConceptText", {
			tooltip : "Clause",
			editable : true,
			width:"500px",
			value : {path: "concept"}
		});
		oConceptLayout.createRow(oConceptText)
		oEditConceptDialog.addContent(oConceptLayout);
		oEditConceptDialog.addButton(new sap.ui.commons.Button({
			text : "OK",
			press : function(oEvent) {
				oEditConceptDialog.close();
			}
		}));
		return oEditConceptDialog;
	}
});