jQuery.sap.require("sap.ui.commons.Dialog");
jQuery.sap.require("sap.ui.commons.TextField");
jQuery.sap.require("sap.ui.commons.Button");
jQuery.sap.require("sap.ui.commons.CheckBox");
jQuery.sap.require("sap.ui.commons.layout.MatrixLayout");
sap.ui.jsfragment("sparqlish.menu.editLabel", {
	createContent : function(oController) {
		var oEditLabelDialog = new sap.ui.commons.Dialog();
		oEditLabelDialog.setTitle("Edit Variable Label");
		var oLayout = new sap.ui.commons.layout.MatrixLayout("oLayout", {
			columns : 2,
			width : "100%"
		});
		var oLabelText = new sap.ui.commons.TextField("oLabelText", {
			tooltip : "New label",
			editable : true,
			value : {path: "label"}
		});
		var oHiddenCheck = new sap.ui.commons.CheckBox("oHiddenCheck", {
			editable : true,
			checked : {path:"hidden"}
		});
		oLayout.createRow(oLabelText,oHiddenCheck)
		oEditLabelDialog.addContent(oLayout);
		oEditLabelDialog.addButton(new sap.ui.commons.Button({
			text : "OK",
			press : function(oEvent) {
				oEditLabelDialog.close();
			}
		}));
		return oEditLabelDialog;
	}
});