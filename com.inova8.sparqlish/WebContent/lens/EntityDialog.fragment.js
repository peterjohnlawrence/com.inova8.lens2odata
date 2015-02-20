sap.ui.jsfragment("lens.EntityDialog", {
	createContent : function(oController) {
		var oEntityDialog = new sap.ui.commons.Dialog({
		   title : "{i18n>entityDialogTitle}",
		   modal : true,
		   maxWidth : "400px"
		});

		var oButton = new sap.ui.commons.Button({
		   text : "{i18n>dialogClose}",
		   press : function() {
			   oEntityDialog.close();
		   }
		});
		oEntityDialog.addButton(oButton);

		var entityTemplate = new sap.ui.commons.ComboBox("entityTemplate", {
		   value : "{queryData>entityType}",
		   editable : true,
		   layoutData : new sap.ui.layout.ResponsiveFlowLayoutData({
		      linebreak : true,
		      margin : false
		   }),
		   items : {
		      path : "modelData>/entityTypes/",
		      template : new sap.ui.core.ListItem().bindProperty("text", "modelData>name")
		   }
		});

		var oEntityLayout = new sap.ui.layout.form.GridLayout();
		var oEntityForm = new sap.ui.layout.form.Form(this.createId("EntityForm"), {
		   layout : oEntityLayout,
		   formContainers : [ new sap.ui.layout.form.FormContainer("EntityFormContainer", {
		      expandable : true,
		      formElements : [ new sap.ui.layout.form.FormElement({
		         label : "Entity",
		         fields : [ entityTemplate ],
		      }) ],
		      layoutData : new sap.ui.core.VariantLayoutData({
			      multipleLayoutData : [ new sap.ui.layout.form.GridContainerData({
				      halfGrid : false
			      }), new sap.ui.layout.ResponsiveFlowLayoutData({
				      minWidth : 350
			      }), new sap.ui.layout.GridData({
				      linebreakL : false
			      }) ]
		      })
		   }) ]
		});
		oEntityDialog.addContent(oEntityForm);
		return oEntityDialog;
	}
});