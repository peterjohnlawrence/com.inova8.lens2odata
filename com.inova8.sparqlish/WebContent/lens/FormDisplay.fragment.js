sap.ui.jsfragment("lens.FormDisplay", {
	destroyContent : function() {
		sap.ui.commons.Panel(this.createId("fragmentPanel")).destroy();
	},
	createContent : function(oController) {

		var lensFragmentId = this.toLocaleString().split("#fragment").slice(-1)[0];
		//var lensFragment = oController.lenses[oController.focus][oController.entityType][lensFragmentId];
		var lensFragment = oController.lenses[oController.focus][oController.entityType].fragments[lensFragmentId];
		var sparqlEndpoint = oController.lenses.sparqlEndpoint;
		var URL = lensFragment.URL;
		if (URL == undefined)
			URL = sparqlEndpoint;
		var fragmentQuery = lensFragment.fragmentQuery;
		var variableMapping = lensFragment.variableMapping;

		var oFormDisplayPanel = new sap.ui.commons.Panel(this.createId("fragmentPanel"), {
			title : new sap.ui.core.Title().setText(lensFragment.title),
			width : "100%",
			height : "100%"
		});

		fragmentQuery = fragmentQuery.replace(/%entity%/, oController.entity);
		console.debug("SPARQL fragmentQuery=", fragmentQuery);
		var fragmentModel = new sap.ui.model.json.JSONModel();
		var headers = {};
		headers.Authorization = "Access-Control-Allow-Origin: *";
		headers.Accept = "application/sparql-results+json";
		try {
			fragmentModel.loadData(URL, "query=" + encodeURIComponent(fragmentQuery), false, "POST", false, false, headers);

			var vars = fragmentModel.getData().head.vars;

			var oFormDisplayLayout = new sap.ui.layout.form.GridLayout({
				singleColumn : false
			});

			var oFormDisplayFormContainer = new sap.ui.layout.form.FormContainer({
				expandable : true
			});
			if (vars == undefined) {
				throw "No results";
			}
			;
			for (var i = 0; i < vars.length; ++i) {
				sColumnId = vars[i];
				var columnName = sColumnId;
				var hidden = false;
				var URLDisplayField = null;
				var format = "Text";
				if (variableMapping != undefined) {
					if (variableMapping[sColumnId] != undefined) {
						if(variableMapping[sColumnId].label!=undefined) columnName = variableMapping[sColumnId].label;
						hidden =variableMapping[sColumnId].hidden;
						URLDisplayField =variableMapping[sColumnId].URLDisplayField;
						format= variableMapping[sColumnId].format;
					}
				}
				if (!hidden){
					
				oFormDisplayFormContainer.insertFormElement(new sap.ui.layout.form.FormElement({
					label : new sap.m.Label({
						text : columnName,
						textAlign : "Right",
						layoutData : new sap.ui.layout.form.GridElementData({
							hCells : "5"
						})
					}),
					fields : new sap.ui.commons.FormattedTextView().bindProperty("tooltip", "fragmentModel>" + sColumnId + "/value").bindProperty("htmlText", {
						parts : [ {
							path : "fragmentModel>" + sColumnId + "/value",
							type : new sap.ui.model.type.String()
						}, {
							path : "fragmentModel>" + sColumnId + "/type",
							type : new sap.ui.model.type.String()
						} , {
							path : "fragmentModel>" + sColumnId + "/datatype",
							type : new sap.ui.model.type.String()
						}, {
							path : "fragmentModel>" + URLDisplayField + "/value",
							type : new sap.ui.model.type.String()
						} ],
						formatter : lens.LensURLFormatter
					}),
					layoutData : new sap.ui.layout.form.GridElementData({
						hCells : "auto"
					})
				}), i)};
			}

			var oFormDisplayForm = new sap.ui.layout.form.Form({
				layout : oFormDisplayLayout,
				width : "100%",
				formContainers : [ oFormDisplayFormContainer ]
			});
			oFormDisplayForm.setModel(fragmentModel, "fragmentModel");
			oFormDisplayForm.setBindingContext("fragmentModel>/results/bindings");
			oFormDisplayForm.bindElement("fragmentModel>/results/bindings/0");

			oFormDisplayPaginator = new sap.ui.commons.Paginator({
				currentPage : 1,
				page : function(oEvent) {
					oFormDisplayForm.bindElement("fragmentModel>/results/bindings/" + (parseInt(oEvent.getParameter("targetPage")) - 1).toString());
				}
			});
			oFormDisplayPaginator.setNumberOfPages(fragmentModel.getData().results.bindings.length);
			oFormDisplayPanel.addContent(oFormDisplayForm);
			oFormDisplayPanel.addContent(oFormDisplayPaginator);
		} catch (error) {
			console.log(error);
		} finally {
		}
		;
		return oFormDisplayPanel;
	}
});