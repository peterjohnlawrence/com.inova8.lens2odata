sap.ui.jsfragment("lens.ObjectPropertyDialog", {
	createContent : function(oController) {
		var oObjectPropertyDialog = new sap.m.Dialog("ObjectPropertyDialog", {
			title : "{i18n>objectPropertyDialogTitle}",
			modal : true,
			maxWidth : "400px",
			contentWidth : "700px",
			showCloseButton : false,

		});

		var oCloseButton = new sap.ui.commons.Button({
			text : "{i18n>dialogClose}",
			press : function() {
				var queryObject= oObjectPropertyForm.getBindingContext("queryData").getObject();
				var objectPropertyLabel = queryObject.propertyLabel;
				var entityContext = objectPropertyTemplate.getBindingContext("modelData").getObject();
				var propertyObject = entityContext.NavigationProperty.getObject("rdfs:label", objectPropertyLabel);
				var objectProperty = propertyObject.Name;
				var toRole = propertyObject.ToRole;
				
				var entityContainer = sap.ui.getCore().getModel("modelData").getData().DataServices[0].Schema.getObject("Namespace", "Instances").EntityContainer[0];
				var entitySet = entityContainer.AssociationSet.getObject("rdfs:label", objectPropertyLabel).End.getObject("Role", toRole).EntitySet;
				var entityType = entityContainer.EntitySet.getObject("Name", entitySet).EntityType;

				queryObject.entityType = entityType;
				queryObject.property = objectProperty; 
				
				// Delete the dependent filter conditions that do not apply to the new range entityset.
				lens.RemoveRedundantFilterConditions(entityType,oObjectPropertyForm.getBindingContext("queryData"),sap.ui.getCore().getModel("modelData").getData());  

				oObjectPropertyDialog.close();
			}
		});
		var oCancelButton = new sap.ui.commons.Button({
			text : "{i18n>dialogCancel}",
			press : function() {
				sQueryController.undo();
				oObjectPropertyDialog.close();
			}
		});
		oObjectPropertyDialog.addButton(oCloseButton).addButton(oCancelButton);

		var objectPropertyTemplate = new sap.ui.commons.ComboBox(this.createId("ObjectPropertyTemplate"), {
			value : "{queryData>propertyLabel}",
			editable : true,
			layoutData : new sap.ui.layout.ResponsiveFlowLayoutData({
				linebreak : true,
				margin : false
			}),
			items : {
				path : "modelData>NavigationProperty",
				template : new sap.ui.core.ListItem().bindProperty("text", "modelData>rdfs:label")
			}
		});
//		var objectPropertyInPlaceEdit = new sap.ui.commons.InPlaceEdit("objectPropertyInPlaceEdit", {
//			content : objectPropertyTemplate
//		});
		var oObjectPropertyLayout = new sap.ui.layout.form.GridLayout();
		var oObjectPropertyForm = new sap.ui.layout.form.Form(this.createId("ObjectPropertyForm"), {
			layout : oObjectPropertyLayout,
			formContainers : [ new sap.ui.layout.form.FormContainer("ObjectPropertyFormContainer", {
				expandable : true,
				formElements : [ new sap.ui.layout.form.FormElement({
					label : "Property",
				  fields : [ objectPropertyTemplate ],
					//fields : [ objectPropertyInPlaceEdit ],
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
		oObjectPropertyDialog.addContent(oObjectPropertyForm);
		return oObjectPropertyDialog;
	}
});