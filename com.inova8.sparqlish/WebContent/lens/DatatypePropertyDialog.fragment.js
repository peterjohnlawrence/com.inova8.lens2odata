sap.ui.jsfragment("lens.DatatypePropertyDialog", {
	createContent : function(oController) {
		var datatype = null;
		var oDatatypePropertyDialog = new sap.m.Dialog({
			title : "{i18n>datatypePropertyDialogTitle}",
			modal : true,
			maxWidth : "600px",
			contentWidth : "700px",
			showCloseButton : false,
			afterOpen : function() {
				if (oDatatypePropertyForm.getBindingContext("queryData").getObject() != null) {
					propertyChangeHandler(oDatatypePropertyForm.getBindingContext("queryData").getObject().datatype);
				}
			}
		});

		var oCloseButton = new sap.ui.commons.Button({
			text : "{i18n>dialogClose}",
			press : function() {
				var datatypePropertyLabel = oDatatypePropertyForm.getBindingContext("queryData").getObject().propertyLabel;
				var entityContext = datatypePropertyTemplate.getBindingContext("modelData").getObject();
				var datatypeProperty = entityContext.Property.getObject("rdfs:label", datatypePropertyLabel).Name;
				oDatatypePropertyForm.getBindingContext("queryData").getObject().property = datatypeProperty;
				oDatatypePropertyDialog.close();
			}
		});
		var oCancelButton = new sap.ui.commons.Button({
			text : "{i18n>dialogCancel}",
			press : function() {
				sQueryController.undo();
				oDatatypePropertyDialog.close();
			}
		});
		propertyChangeHandler = function(datatype) {
			datatypeConditionTemplate.bindElement("datatypeData>/datatypes/" + datatype);

			datatypeTextValue.setVisible(false);
			datatypeDateTimeValue.setVisible(false);
			datatypeBooleanValue.setVisible(false);
			datatypeNumberValue.setVisible(false);
			switch (datatype) {
			case "rdf.langString":
			case "Edm.String":
			case "Collection(rdf.langString)":
			case "Collection(Edm.String)":
				datatypeTextValue.setVisible(true);
				break;

			case "Edm.Boolean":
			case "Collection(Edm.Boolean)":

				datatypeBooleanValue.setVisible(true);
				break;

			case "Edm.Binary":
			case "Edm.Byte":
			case "Edm.Decimal":
			case "Edm.Double":
			case "Edm.Int16":
			case "Edm.Int32":
			case "Edm.Int64":
			case "Edm.SByte":
			case "Edm.Single":
			case "Collection(Edm.Binary)":
			case "Collection(Edm.Byte)":
			case "Collection(Edm.Decimal)":
			case "Collection(Edm.Double)":
			case "Collection(Edm.Int16)":
			case "Collection(Edm.Int32)":
			case "Collection(Edm.Int64)":
			case "Collection(Edm.SByte)":
			case "Collection(Edm.Single)":
				datatypeNumberValue.setVisible(true);
				break;

			case "Edm.DateTime":
			case "Edm.Time":
			case "Collection(Edm.DateTime)":
			case "Collection(Edm.Time)":

				datatypeDateTimeValue.setVisible(true);
				break;

			case "Edm.DateTimeOffset":
			case "Edm.Guid":
			case "Collection(Edm.DateTimeOffset)":

				datatypeTextValueTemplate.setVisible(true);
				break;
			}
		};
		oDatatypePropertyDialog.addButton(oCloseButton).addButton(oCancelButton);

		var datatypePropertyTemplate = new sap.ui.commons.ComboBox(this.createId("DatatypePropertyTemplate"), {
			value : "{queryData>propertyLabel}",
			editable : true,
			layoutData : new sap.ui.layout.ResponsiveFlowLayoutData({
				linebreak : true,
				margin : false
			}),
			items : {
				path : "modelData>Property",
				template : new sap.ui.core.ListItem().bindProperty("text", "modelData>rdfs:label")
			}
		}).attachChange(// propertyChangeHandler
		function(oEvent) {
			var datatype = sap.ui.getCore().getModel("modelData").getProperty("Type", oEvent.getParameter("selectedItem").getBindingContext("modelData"));
			if( this.getBindingContext("queryData").getObject()!=null) this.getBindingContext("queryData").getObject().datatype = datatype;
			propertyChangeHandler(datatype);
			datatypeTextValueTemplate.setValue(null);
			datatypeDateTimeValueTemplate.setYyyymmdd();
			datatypeTextValueTemplate.setValue(null);
		});

		var datatypeConditionTemplate = new sap.ui.commons.DropdownBox(this.createId("ConditionTemplate"), {
			value : "{queryData>condition}",
			editable : true,
			items : {
				path : "datatypeData>conditions",
				template : new sap.ui.core.ListItem().bindProperty("text", "datatypeData>condition")
			}
		});

		var datatypeTextValueTemplate = new sap.m.Input(this.createId("TextValueTemplate"), {
			value : "{queryData>value}",
			editable : true,
			visible : true
		});
		var datatypeTextValue = new sap.ui.layout.form.FormElement({
			label : "Text Value",
			fields : [ datatypeTextValueTemplate ],

		});

		var datatypeDateTimeValueTemplate = new sap.ui.commons.DatePicker(this.createId("DateTimeValueTemplate"), {

			value : "{queryData>value}",
			editable : true
		});
		var datatypeDateTimeValue = new sap.ui.layout.form.FormElement({
			label : "Date Value",
			fields : [ datatypeDateTimeValueTemplate ],
			visible : false
		});

		var datatypeNumberValueTemplate = new sap.m.Input(this.createId("NumberValueTemplate"), {
			value : "{queryData>value}",
			type: sap.m.InputType.Number,
			editable : true
		});
		var datatypeNumberValue = new sap.ui.layout.form.FormElement({
			label : "Numeric Value",
			fields : [ datatypeNumberValueTemplate ],
			visible : false

		});
		var datatypeBooleanValueTemplate = new sap.ui.commons.ListBox(this.createId("BooleanValueTemplate"), {
			value : "{queryData>value}",
			editable : true,
			items : [ new sap.ui.core.ListItem({	text : "true"	}),
			          new sap.ui.core.ListItem({	text : "false"}) ]
		});
		var datatypeBooleanValue = new sap.ui.layout.form.FormElement({
			label : "Boolean Value",
			fields : [ datatypeBooleanValueTemplate ],
			visible : false
		});

		var oDatatypePropertyForm = new sap.ui.layout.form.Form(this.createId("DatatypePropertyForm"), {
			layout : new sap.ui.layout.form.GridLayout(),
			formContainers : [ new sap.ui.layout.form.FormContainer("DatatypePropertyFormContainer", {
				expandable : true,
				formElements : [ new sap.ui.layout.form.FormElement({
					label : "Property",
					fields : [ datatypePropertyTemplate ],
				}), new sap.ui.layout.form.FormElement({
					label : "Condition",
					fields : [ datatypeConditionTemplate ],
					layoutData : new sap.ui.layout.ResponsiveFlowLayoutData({
						linebreak : true,
						margin : false
					})
				}), datatypeTextValue, datatypeDateTimeValue, datatypeNumberValue, datatypeBooleanValue,
				],
				layoutData : new sap.ui.core.VariantLayoutData({
					multipleLayoutData : [ new sap.ui.layout.form.GridContainerData({
						halfGrid : false
					}), new sap.ui.layout.ResponsiveFlowLayoutData({
						minWidth : 200
					}), new sap.ui.layout.GridData({
						linebreak : false
					}) ]
				})
			}) ]
		});

		oDatatypePropertyDialog.addContent(oDatatypePropertyForm);

		return oDatatypePropertyDialog;
	}
});