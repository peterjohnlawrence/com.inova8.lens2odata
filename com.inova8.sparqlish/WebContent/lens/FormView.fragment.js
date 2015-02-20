jQuery.sap.require("lens.QueryWriter");
sap.ui.jsfragment("lens.FormView", {
	createContent : function(oController) {
		var oFormViewLayout = new sap.ui.layout.form.GridLayout();
		
		var oFormViewFormContainer =new sap.ui.layout.form.FormContainer("FormViewFormContainer", {
	      expandable : true,
	      layoutData : new sap.ui.core.VariantLayoutData({
		      multipleLayoutData : [ new sap.ui.layout.form.GridContainerData({
			      halfGrid : false
		      }), new sap.ui.layout.ResponsiveFlowLayoutData({
			      minWidth : 350
		      }), new sap.ui.layout.GridData({
			      linebreak : false
		      }) ]
	      })
	   }) ;
		
		var resultsModel = oController.resultsModel;
		var sparql = oController.sparql;
		var vars = resultsModel.getData().head.vars;
		  
	   for (var i = 0; i < vars.length; ++i) {
		   sColumnId = vars[i];
				if (sparql.variableMapping != undefined) {
					if (sparql.variableMapping[sColumnId] != undefined) {
						if (sparql.variableMapping[sColumnId].label != undefined)
							columnName = sparql.variableMapping[sColumnId].label;
						hidden = sparql.variableMapping[sColumnId].hidden;
						URLDisplayField = sparql.variableMapping[sColumnId].URLDisplayField;
						format = sparql.variableMapping[sColumnId].format;
					}
				}
		   if(!hidden) oFormViewFormContainer.insertFormElement(new sap.ui.layout.form.FormElement({
		      label : sColumnId,
		      fields : new sap.ui.commons.FormattedTextView().bindProperty("tooltip", "resultsModel>" + sColumnId + "/value").bindProperty("htmlText", {
		         parts : [ {
		            path : "resultsModel>" + sColumnId + "/value",
		            type : new sap.ui.model.type.String()
		         }, {
		            path : "resultsModel>" + sColumnId + "/type",
		            type : new sap.ui.model.type.String()
		         }, {
								path : "resultsModel>" + sColumnId + "/datatype",
								type : new sap.ui.model.type.String()
							} , {
								path : "resultsModel>" + URLDisplayField + "/value",
								type : new sap.ui.model.type.String()
							} ],
			      formatter : lens.LensURLFormatter		         
		      }),
		      layoutData : new sap.ui.layout.ResponsiveFlowLayoutData({
		         linebreak : false,
		         margin : false
		      })
		   }), i);
	   }
		
			
		var oFormViewForm = new sap.ui.layout.form.Form(this.createId("FormViewForm"), {
		   layout : oFormViewLayout,
		   formContainers : [ oFormViewFormContainer ]
		});
		
		oFormViewForm.setModel(resultsModel, "resultsModel");
		
		var oFormViewDialog = new sap.ui.commons.Dialog("FormView",{
		   title : "{i18n>lensResultsForm}",
		   modal : false,
		   maxWidth : "700px"
		});
		
		oFormViewDialog.addContent(oFormViewForm);
		
		return oFormViewDialog;
	}
});