(function(window) {
	"use strict";

	jQuery.sap.declare('lib.utils');

	window.utils = {};

	utils.getCachedOdataModel = function(service,onFailure,onSuccess) {
		var odataModel = sap.ui.getCore().getModel(constants.ODATACACHE + service.code);
		if (jQuery.isEmptyObject(odataModel)) {
			// TODO should set maxDataServiceVersion based on declaration
			try {
				odataModel = new sap.ui.model.odata.v2.ODataModel(service.serviceUrl,{maxDataServiceVersion:"2.0"})
				.attachMetadataFailed(function(oEvent) {
					sap.m.MessageToast.show("Metada failed to load. Check < OdataV4 also check source: " + service.serviceUrl);
					onFailure();
				})
				.attachMetadataLoaded(function(oEvent) {
					sap.ui.getCore().setModel(odataModel, constants.ODATACACHE + service.code);
					odataModel.setUseBatch(false);
					onSuccess(odataModel);
				});
			} catch (e) {
				sap.m.MessageToast.show("Metada load error. Check < OdataV4 also check source: " + service.serviceUrl);
				throw new Error("MetadataFailed");
			}
		}
		onSuccess(odataModel);
	};
	utils.removeValue = function(thisArray, name, value) {
		var array = $.map(thisArray, function(v, i) {
			return v[name] === value ? null : v;
		});
		thisArray.length = 0; // clear original array
		thisArray.push.apply(this, array); // push all elements except the one we want to delete
	};
	utils.lookup = function(thisArray, name, value) {
		var lookup = [];
		for (var i = 0, len = thisArray.length; i < len; i++) {
			if (thisArray[i][name] === value)
				lookup.push(thisArray[i]);
		}
		return lookup;
	};
	utils.lookupIndex = function(thisArray, name, value) {
		for (var i = 0, len = thisArray.length; i < len; i++) {
			if (thisArray[i][name] === value)
				return i;
		}
		return undefined;
	};
})(window);