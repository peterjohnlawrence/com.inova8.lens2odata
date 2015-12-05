jQuery.sap.require("sap.ui.commons.CheckBox");
sap.ui.commons.TreeNode.extend("sparqlish.control.treeNodeCheckBox", { 
	metadata : {
		properties : {
			tooltip : {
				type : "string",
				defaultValue : "Select a dataproperty to find"
			}
		},
		aggregations : {
			_checkbox : {
				type : "sap.ui.commons.CheckBox",
				multiple : false
			}
		},
		events : {
		}
	},
	init : function() {
		var self = this;
		var oCheckBox = new sap.ui.commons.CheckBox({
			tooltip : self.getProperty("tooltip")
		});
		self.setAggregation("_checkbox", oCheckBox);
	}
});


