jQuery.sap.require("lens.QueryWriter");
jQuery.sap.require("rdfquery");
jQuery.sap.require("sap.ui.core.Fragment");
sap.ui.controller("lens.LensView", {
	lensesData : null,
	resultsModel : null,
	lenses : null,
	goBack : function(oItem) {
		window.history.go(-1);
	},
	goSearch : function(oItem) {
		sap.ui.core.UIComponent.getRouterFor(this).navTo("search");
	},
	onInit : function() {
		this.oRouter = sap.ui.core.routing.Router.getRouter("router");
		sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(this.onRouteMatched, this);
		resultsModel = sap.ui.getCore().getModel("resultsModel");
		lensesData = sap.ui.getCore().getModel("lensesData");
		lenses = lensesData.getData();
		this.lenses = lenses;

		this.lensDisplay = sap.ui.getCore().byId(this.createId("lens"));
	},
	onRouteMatched : function(oEvent) {
		try {
			if ("lens" !== oEvent.getParameter("name")) {
				return;
			}
			this.lensDisplay.destroyRows();

			this.focus = oEvent.getParameter("arguments").focus;
			if (lenses[this.focus] == undefined) {
				this.focus = "(default)";
			}
			this.entityType = oEvent.getParameter("arguments")["?entity"].entityType;
			this.entityTypeLabel = this.entityType;
			this.entity = oEvent.getParameter("arguments")["?entity"].entity;	
			if (this.entityType == undefined || this.entityType == "null") {
				var entityObject = lens.GetEntityTypeFromEntity(resultsModel, this.entity);
				this.entityType = entityObject.Type;
				this.entityTypeLabel = this.entityType;
				this.entityLabel =entityObject.Label;
			}
			var lensDefinition = lenses[this.focus][this.entityType];

			if (lensDefinition == undefined) {
				// revert to default lens if nothing defined for this entitytype
				this.entityType = "(default)";
				lensDefinition = lenses[this.focus]["(default)"];
			}else{
				
			}
			if (lenses[this.focus][this.entityType] != undefined) {
				if (this.entity != undefined) {

					sap.ui.getCore().byId(this.createId("fragmentFocus")).setText(this.focus);
					sap.ui.getCore().byId(this.createId("fragmentEntityType")).setText(this.entityTypeLabel);
					sap.ui.getCore().byId(this.createId("fragmentEntity")).setText(this.entityLabel);

					this.lensDisplay.setColumns((lensDefinition.columns != undefined) ? lensDefinition.columns : 4);
					var maxRows = (lensDefinition.rows != undefined) ? lensDefinition.rows : 4;
					var height = (lensDefinition.height != undefined) ? lensDefinition.height : "320px";
					for (var nRows = 0; nRows < maxRows; nRows++) {
						this.lensDisplay.addRow(new sap.ui.commons.layout.MatrixLayoutRow(this.createId("lensR" + nRows.toString())).setHeight(height));
					}

					for (var fragment = 0, len = lensDefinition.fragments.length; fragment < len; fragment++) {

						var oFragment = lensDefinition.fragments[fragment];
						var fragmentName = "fragment" + fragment.toString();
						switch (oFragment.fragmentType) {
						case "JS": {
							oDisplayFragment = new sap.ui.jsfragment(fragmentName, oFragment.fragmentId, this);
							var oDisplayCell = new sap.ui.commons.layout.MatrixLayoutCell();
							oDisplayCell.addContent(oDisplayFragment).setRowSpan((oFragment.rowSpan != undefined) ? oFragment.rowSpan : 1).setColSpan(
									(oFragment.colSpan != undefined) ? oFragment.colSpan : 2).setVAlign("Top");
							var calculatedRow = Math.floor(fragment / 2);
							calculatedRow = (calculatedRow > maxRows) ? maxRows : calculatedRow;
							var currentRow = (oFragment.row != undefined) ? oFragment.row : calculatedRow;
							sap.ui.getCore().byId(this.createId("lensR" + currentRow.toString())).addCell(oDisplayCell);
						}
							break;
						case "XML": {
						}
							break;
						case "HTML": {
						}
							break;
						case "Image": {
						}
							break;
						default:
							lens.ErrorMessage(fragment + ":" + JSON.stringify(oFragment) + " incorrectly defined");
						}
					}
				} else {
					sap.ui.getCore().byId(this.createId("fragmentFocus")).setText(this.focus);
					sap.ui.getCore().byId(this.createId("fragmentEntityType")).setText(this.entityType);
					sap.ui.getCore().byId(this.createId("fragmentEntity")).setText("undefined entity");

					lens.ErrorMessage("Undefined entity:", JSON.stringify(oEvent.getParameter("arguments")));
				}
			} else {
				sap.ui.getCore().byId(this.createId("fragmentFocus")).setText(this.focus);
				sap.ui.getCore().byId(this.createId("fragmentEntityType")).setText("undefined entityType");
				sap.ui.getCore().byId(this.createId("fragmentEntity")).setText("undefined entity");

				lens.ErrorMessage("No lens defined lens for entityType:", this.entityType);
			}
		} catch (error) {
			lens.ErrorMessage("Uncaught error:" + error);
		}
	},
});