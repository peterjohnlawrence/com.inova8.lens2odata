(function(window) {
	"use strict";
	jQuery.sap.require("sap.ui.core.format.DateFormat");
	jQuery.sap.declare('lib.utils');
	window.utils = {};
	var oDateTimeFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
		pattern : constants.DATETIMEFORMAT
	});
	var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
		pattern : constants.DATEFORMAT
	});
	var oTimeFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
		pattern : constants.TIMEFORMAT
	});
	utils.getCachedOdataModel = function(service, onFailure, onSuccess) {
		var odataModel = sap.ui.getCore().getModel(constants.ODATACACHE + service.code);
		if (jQuery.isEmptyObject(odataModel)) {
			// TODO should set maxDataServiceVersion based on declaration
			try {
				odataModel = new sap.ui.model.odata.v2.ODataModel(utils.proxyUrl(service.serviceUrl), {
					maxDataServiceVersion : "2.0"
				}).attachMetadataFailed(function(oEvent) {
					sap.m.MessageToast.show("Metada failed to load. Check < OdataV4 also check source: " + service.serviceUrl);
					onFailure();
				}).attachMetadataLoaded(function(oEvent) {
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
	utils.removeValue = function(thisArray, property, value) {
		thisArray.forEach(function(result, index) {
			if (result[property] === value) {
				// Remove from array
				array.splice(index, 1);
			}
		});
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
	utils.getLocalStorage = function() {
		var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		return oStorage.get("lens2odata.queries");
	};
	utils.saveToLocalStorage = function() {
		var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		oStorage.put("lens2odata.queries", sap.ui.getCore().getModel("queryModel").getData());
	};
	utils.proxyUrl = function(url) {
		return url.replace("http://", "proxy/http/");
	}
	utils.lensUri = function(uri, type, serviceCode) {
		// Workaround to avoid issue with sapui5 router that will not ignore '=' even if encoded
		return jQuery.isEmptyObject(uri) ? "" : "../lens2odata/#/" + serviceCode + "/lens?type=" + type + "&uri=" + uri.replace(/=/g, "~");
	};
	utils.lensUriLabel = function(uri) {
		return jQuery.isEmptyObject(uri) ? "" : decodeURIComponent(uri).split("/").pop();
	};
	utils.lensDeferredUri = function(uri, serviceCode) {
		if (jQuery.isEmptyObject(uri)) {
			return "";
		} else {
			var parts = uri.split("/");
			var collection = parts.pop();
			// Workaround to avoid issue with sapui5 router that will not ignore '=' even if encoded
			return "../lens2odata/#/" + serviceCode + "/lens?deferred=true&uri=" + uri.replace(/=/g, "~");
		}
	};
	utils.lensDeferredUriLabel = function(uri) {
		if (jQuery.isEmptyObject(uri)) {
			return "";
		} else {
			return decodeURIComponent(uri).split("/").pop();
		}
	};
	utils.edmDateTimeFormatter = function(value) {
		if (value != null) {
			if (typeof (value) == 'string') {
				// TODO when the Odata atom/xml response or json does not annotate the type of the response
				var rExp = /\/Date\((.+)\)\//;
				var sDate = rExp.exec(value)[1];
				// return eval("new " + rExp.$1);
				if (jQuery.isEmptyObject(sDate)) {
					value = oDateTimeFormat.parse(value);
				} else {
					value = new Date(sDate * 1);
				}
			}
			return oDateTimeFormat.format(value);
		} else {
			return null;
		}
	};
	utils.edmTimeFormatter = function(value) {
		if (value != null) {
			if (typeof (value) == 'string') {
				// TODO when the Odata atom/xml response or json does not annotate the type of the response
				var rExp = /\/Date\((.+)\)\//;
				var sDate = rExp.exec(value)[1];
				// return eval("new " + rExp.$1);
				if (jQuery.isEmptyObject(sDate)) {
					value = oTimeFormat.parse(value);
				} else {
					value = new Date(sDate * 1);
				}
			}
			return oTimeFormat.format(value);
		} else {
			return null;
		}
	};
	utils.columnWidth = function() {
		var args = [];
		var max = 0;
		for (var i = 0; i < arguments.length; ++i)
			max = Math.max(arguments[i].length, max);
		return max / constants.REMRATIO + "rem"
	};
	utils.bindStringToValues = function(sBindString, oBindValues) {
		var matches;
		do {
			matches = /\{(.*?)\}/g.exec(sBindString);
			if (matches) {
				if (!jQuery.isEmptyObject(oBindValues[matches[1]])) {
					sBindString = sBindString.replace(matches[0], oBindValues[matches[1]]);
				} else {
					sBindString = sBindString.replace(matches[0], "#" + matches[1] + "#");
				}
			}
		} while (matches);
		return sBindString
	};
	utils.parseDeferredUri = function(sDeferredUri) {
		var matches = /.*\/(.*?)\((.*?)\)\/(.*?)$/g.exec(sDeferredUri);
		var deferredUri = {
			entityType : matches[1],
			entity : matches[2],
			navigationProperty : matches[3]
		};
		return deferredUri;
	};
	utils.parseMetadataUri = function(sMetadataUri) {
		var matches = /.*\/(.*?)\((.*?)\)$/g.exec(sMetadataUri);
		var metadataUri = {
			entityType : matches[1],
			entity : matches[2]
		};

		return metadataUri;
	};
	utils.generateUUID = function() {
		var d = new Date().getTime();
		if (window.performance && typeof window.performance.now === "function") {
			d += performance.now(); // use high-precision timer if available
		}
		// 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
		var uuid = 'xxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
		return uuid;
	}
})(window);