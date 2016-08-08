(function(window) {
	"use strict";
	jQuery.sap.require("sap.ui.core.format.DateFormat");
	jQuery.sap.require("sap.m.MessageToast");
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
	utils.isNumeric = function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	};
	utils.stringifyNumeric = function(n) {
		return utils.isNumeric(n) ? "'" + n + "'" : n;
	};
	utils.constructFilterSet = function(oFilterSet) {
		if (oFilterSet._class === "filterset") {
			var filterset = {
				path : null,
				filters : [],
				and : oFilterSet.and
			};
			for ( var filter in oFilterSet.filters) {
				var subFilter = utils.constructFilter(oFilterSet.filters[filter]);
				if (!jQuery.isEmptyObject(subFilter))
					filterset.filters.push(subFilter);
			}
			return new sap.ui.model.Filter(filterset);
		}
	};
	utils.constructFilter = function(oFilter) {
		if (!jQuery.isEmptyObject(oFilter)) {
			switch (oFilter._class) {
			case "filterset":
				return utils.constructFilterSet(oFilter);
				break;
			case "filter":
				var filter = {
					path : oFilter.path,
					operator : oFilter.operator,
					value1 : oFilter.value1,
					value2 : oFilter.value2
				};
				var oFilter = new sap.ui.model.Filter(filter);
				return oFilter;
				break;
			default:
				return null;
			}
		} else {
			return null;
		}
	};
	utils.queryModel = function(oModel, oQuery, fnReceivedHandler) {

		var oFilter = null;
		var oFilterSet = oQuery.odataFilterSet("V2");
		if (!jQuery.isEmptyObject(oFilterSet))
			oFilter = utils.constructFilterSet(oFilterSet);

		// var oBinding = oModel.bindList(oQuery.odataPath("V2"), null, null, oFilter, {
		// select : oQuery.odataSelectList("V2"),
		// expand : oQuery.odataExpandList("V2"),
		// custom : oQuery.odataCustomQueryOptions("V2"),
		// countMode : sap.ui.model.odata.CountMode.None,
		// operationMode : sap.ui.model.odata.OperationMode.Server
		// });
		// oBinding.attachRefresh(function() {
		// //oBinding.getContexts(0, 4);
		// //oBinding.getContexts();
		// oBinding.getDownloadUrl("json");
		// });
		// oBinding.attachDataReceived(fnReceivedHandler);
		// oBinding.initialize();
		var urlParameters = {
			$select : oQuery.odataSelectList("V2"),
			$expand : oQuery.odataExpandList("V2"),
			$top : 2
		}
		jQuery.extend(urlParameters, oQuery.odataCustomQueryOptionsList("V2"));
		oModel.read(oQuery.odataPath("V2"), {
			filters : (oFilter) ? [ oFilter ] : null,
			success : function(oData, response) {
				var oResults = response.data;
			},
			error : function(oData, oError) {
				alert('error');
			},
			urlParameters : urlParameters
		});

	};
	utils.mergeLensesModel = function(localLensesData, remoteLensesData) {
		var mergedData = {
			templates : remoteLensesData.templates,
			pages : remoteLensesData.pages,
			lenses : remoteLensesData.lenses
		};
		// Now overwrite with any local data
		if (!jQuery.isEmptyObject(localLensesData)) {
			for ( var entity in localLensesData.lenses) {
				// if (jQuery.isEmptyObject(mergedData.lenses[entity]))
				{
					mergedData.lenses[entity] = jQuery.extend(true, {}, localLensesData.lenses[entity])
				}
			}
		}
		return mergedData;
	};
	utils.mergeQueryModel = function(localQueryData, remoteQueryData) {
		var mergedData = {
			services : {}
		};
		for ( var service in remoteQueryData.services) {
			mergedData.services[service] = {
				"code" : service,
				"name" : remoteQueryData.services[service].name,
				"serviceUrl" : remoteQueryData.services[service].serviceUrl,
				"version" : remoteQueryData.services[service].version,
				"useProxy" : remoteQueryData.services[service].useProxy,
				"json" : remoteQueryData.services[service].json,
				queries : {}
			};
			for ( var query in remoteQueryData.services[service].queries) {
				mergedData.services[service].queries[query] = jQuery.extend(true, {}, remoteQueryData.services[service].queries[query])
			}
		}
		// Now overwrite with any local data
		if (!jQuery.isEmptyObject(localQueryData)) {
			for ( var service in localQueryData.services) {
				if (jQuery.isEmptyObject(mergedData.services[service])) {
					mergedData.services[service] = {
						"code" : service,
						"name" : localQueryData.services[service].name,
						"serviceUrl" : localQueryData.services[service].serviceUrl,
						"version" : localQueryData.services[service].version,
						"useProxy" : localQueryData.services[service].useProxy,
						"json" : localQueryData.services[service].json,
						queries : {}
					};
				} else {
					mergedData.services[service].name = localQueryData.services[service].name;
					mergedData.services[service].serviceUrl = localQueryData.services[service].serviceUrl;
					mergedData.services[service].version = localQueryData.services[service].version;
					mergedData.services[service].useProxy = localQueryData.services[service].useProxy;
					mergedData.services[service].json = localQueryData.services[service].json;
				}
				for ( var query in localQueryData.services[service].queries) {
					mergedData.services[service].queries[query] = jQuery.extend(true, {}, localQueryData.services[service].queries[query])
				}
			}
		}
		return mergedData;// jQuery.extend(true, {}, localQueryData, remoteQueryData);
	};
	utils.getCachedOdataModel = function(service, onFailure, onSuccess, args) {
		if (jQuery.isEmptyObject(service)) {
			sap.m.MessageToast.show("Service not recognized");
			onFailure();
		} else {
			var odataModel = sap.ui.getCore().getModel(constants.ODATACACHE + service.code);
			if (jQuery.isEmptyObject(odataModel)) {
				// TODO should set maxDataServiceVersion based on declaration
				try {
					switch (service.version) {
					case "2.0":
						odataModel = new sap.ui.model.odata.v2.ODataModel(utils.proxyUrl(service.serviceUrl, service.useProxy), {
							maxDataServiceVersion : "2.0",
							json : service.json
						}).attachMetadataFailed(function(oEvent) {
							sap.m.MessageToast.show("Metada failed to load. Check less than OdataV4, also check source and proxy: " + service.serviceUrl);
							onFailure();
						}).attachMetadataLoaded(function(oEvent) {
							sap.ui.getCore().setModel(odataModel, constants.ODATACACHE + service.code);
							odataModel.setUseBatch(false);
							onSuccess(odataModel, args);
						});
						break;
					case "4.0":
						odataModel = new sap.ui.model.odata.v4.ODataModel({
							serviceUrl : utils.proxyUrl(service.serviceUrl, service.useProxy),
							synchronizationMode : "None",
							updateGroupId : "$direct"
						});
						odataModel.sMaxDataServiceVersion="4.0"; // For compatibility with v2.odatamodel
						var odataMetaModel = odataModel.getMetaModel();
						//Force a promise to fetch metamodel
						var oMetaModelPromise = odataMetaModel.requestObject("/");
						oMetaModelPromise.then(function(value) {
							//Since promise fulfilled then the entire metamodel is now available
							sap.ui.getCore().setModel(odataModel, constants.ODATACACHE + service.code);
						//	var obj = sap.ui.getCore().getModel(constants.ODATACACHE + "o4").getMetaModel().getObject("/$EntityContainer/Persons/$Type/PersonDetail/$Type/")
						//	jQuery.each(obj, function(a, value) {
						//		if (value.hasOwnProperty("$kind")) if(value["$kind"]==="NavigationProperty")
						//			console.log(a);
						//	});
							onSuccess(odataModel, args);
						}, function(reason) {
							sap.m.MessageToast.show("V4 Metada failed to load. Check actually OdataV4, also check source and proxy: " + service.serviceUrl);
							onFailure();
						});
						// var oMetaModelBinding = odataMetaModel.bindList("/");
						// oMetaModelBinding.attachDataRequested(function(e) {
						// alert("requested");
						// });
						// oMetaModelBinding.attachDataReceived(function(e) {
						// oMetaModelBinding.getContexts(0, 4);
						// oMetaModelBinding.getContexts();
						// oMetaModelBinding.getDownloadUrl("json");
						// });
						// oBinding.attachDataReceived(fnReceivedHandler);
						// oMetaModelBinding.initialize();
						// if (odataMetaModel.loaded()) {
						// onFailure();
						// } else {
						// oMetaModelBinding.getContexts();
						//sap.ui.getCore().setModel(odataModel, constants.ODATACACHE + service.code);
						// odataModel.setUseBatch(false);
						//onSuccess(odataModel, args);
						// }
						break;
					}
				} catch (e) {
					sap.m.MessageToast.show("Metada load error. Check < OdataV4 also check source: " + service.serviceUrl);
					onFailure(e);
				}
			} else {
				onSuccess(odataModel, args);
			}
		}
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
			if (!jQuery.isEmptyObject(thisArray[i]) && thisArray[i][name] === value)
				lookup.push(thisArray[i]);
		}
		return lookup;
	};
	utils.lookupIndices = function(thisArray, name, value) {
		var lookup = [];
		for (var i = 0, len = thisArray.length; i < len; i++) {
			if (!jQuery.isEmptyObject(thisArray[i]) && thisArray[i][name] === value)
				lookup.push(i);
		}
		return lookup;
	};
	utils.lookupIndex = function(thisArray, name, value) {
		for (var i = 0, len = thisArray.length; i < len; i++) {
			if (!jQuery.isEmptyObject(thisArray[i]) && thisArray[i][name] === value)
				return i;
		}
		return undefined;
	};
	utils.lookupObject = function(thisArray, name, value) {
		for (var i = 0, len = thisArray.length; i < len; i++) {
			if (!jQuery.isEmptyObject(thisArray[i]) && thisArray[i][name] === value)
				return thisArray[i];
		}
		return undefined;
	};
	utils.appname = function() {
		var pathname = document.location.pathname
		return pathname.substring(1, pathname.length - 1);
	}
	utils.getLocalStorage = function(remoteFile) {
		var file = utils.appname() + "." + remoteFile;
		var url = 'JSONServlet';
		var result = null;
		jQuery.ajaxSetup({
			async : false
		});
		jQuery.get(url, {
			filename : file
		}, function(data) {
			result = data;
		}, "json");
		jQuery.ajaxSetup({
			async : true
		});
		return result;
	};
	utils.saveToLocalStorage = function(remoteFile, model) {
		var file = utils.appname() + "." + remoteFile;
		var data = sap.ui.getCore().getModel(model).getData();
		var url = 'JSONServlet';
		jQuery.post(url, {
			data : JSON.stringify(data),
			filename : file
		}, function(data) {
			$(".result").html(data);
		}, "json")

	};
	utils.writeQueryModelToLocalFile = function() {
		navigator.webkitPersistentStorage.requestQuota(1024 * 1024, function(grantedBytes) {
			window.webkitRequestFileSystem(PERSISTENT, grantedBytes, utils.onInitFs, function(e) {
				alert(e.message);
			});
		}, function(e) {
			alert(e.message);
		});
	};
	utils.onInitFs = function(fs) {
		fs.root.getFile('/queries.json', {
			create : true
		}, function(fileEntry) {
			// Create a FileWriter object for our FileEntry.
			fileEntry.createWriter(function(fileWriter) {
				fileWriter.onwrite = function(e) {
					console.log('Write completed.');
				};
				fileWriter.onerror = function(e) {
					console.log('Write failed: ' + e.toString());
				};
				var bb = new Blob([ "Lorem Ipsum" ], {
					type : "text/plain"
				});
				fileWriter.write(bb);
			}, function(e) {
				alert(e.message)
			});
		}, function(e) {
			alert(e.message)
		});
	};

	utils.writeQueryModelToConsoleLog = function() {
		jQuery.sap.log.error(JSON.stringify(sap.ui.getCore().getModel("queryModel").getData()));
	};
	utils.proxyUrl = function(url, useProxy) {
		if (useProxy) {
			return url.replace("http://", "proxy/http/");
		} else {
			return url;
		}
	}
	utils.lensUri = function(uri, type, serviceCode, sSubjectId, sLabel) {
		// Workaround to avoid issue with sapui5 router that will not ignore '=' even if encoded
		return jQuery.isEmptyObject(uri) ? "" : ".." + document.location.pathname + "#/" + serviceCode + "/lens?type=" + type + "&uri=" + uri.replace(/=/g, "~")
				+ "&label=" + utils.lensUriLabel(uri, sSubjectId, sLabel);
	};
	utils.lensUriLabel = function(uri, sSubjectId, sLabel) {
		if (sLabel) {
			return sLabel;
		} else if (sSubjectId) {
			return decodeURIComponent(sSubjectId);
		} else
			return jQuery.isEmptyObject(uri) ? "" : decodeURIComponent(decodeURIComponent(uri).split("/").pop());
	};
	utils.lensDeferredUri = function(uri, serviceCode, sSubjectId, sLabel, me) {
		if (jQuery.isEmptyObject(uri)) {
			return "";
		} else {
			var parts = uri.split("/");
			var collection = parts.pop();
			// Workaround to avoid issue with sapui5 router that will not ignore '=' even if encoded
			return ".." + document.location.pathname + "#/" + serviceCode + "/lens?deferred=true&type=" + me.deferredEntityTypeMap[collection] + "&uri="
					+ uri.replace(/=/g, "~") + "&label=" + utils.lensDeferredUriLabel(uri, sSubjectId, sLabel);
		}
	};
	utils.lensDeferredUriLabel = function(uri, sSubjectId, sLabel) {
		var navProperty;
		if (jQuery.isEmptyObject(uri)) {
			navProperty = "";
		} else {
			navProperty = decodeURIComponent(decodeURIComponent(uri).split("/").pop());
		}
		if (sLabel) {
			return sLabel + "/" + navProperty;
		} else if (sSubjectId) {
			return decodeURIComponent(sSubjectId) + "/" + navProperty;
		} else {
			return navProperty;
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
	};
	utils.validateUrl = function(sUrl) {
		var oParser = document.createElement('a');
		oParser.href = sUrl;
		return (oParser.hostname && oParser.host != window.location.host) ? oParser : false;
	};
	utils.getTemplatePositions = function(oContent) {
		var positions = [];
		switch (oContent.type) {
		case "rows":
			for ( var content in oContent.rows) {
				positions = positions.concat(utils.getTemplatePositions(oContent.rows[content].content));
			}
			break;
		case "columns":
			for ( var content in oContent.columns) {
				positions = positions.concat(utils.getTemplatePositions(oContent.columns[content].content));
			}
			break
		case "lens":
			return oContent.id;
			break;
		default:

		}
		return positions;
	};
	utils.addPropertyClauses = function(me, currentModelData, selectedObjectProperties, selectedDataProperties) {

		for (var i = 0; i < selectedDataProperties.length; i++) {
			var dataProperty = selectedDataProperties[i].columnKey;// getText();
			// self.addClause(currentModelData, "DataPropertyClause", dataProperty);
			utils.addPropertyClause(me, currentModelData, "DataPropertyClause", dataProperty);
		}
		for (var i = 0; i < selectedObjectProperties.length; i++) {
			var objectProperty = selectedObjectProperties[i].columnKey;// getText();
			// self.addClause(currentModelData, "ObjectPropertyClause", objectProperty);
			utils.addPropertyClause(me, currentModelData, "ObjectPropertyClause", objectProperty);
		}
	};
	utils.addPropertyClause = function(me, currentModelData, clauseClass, property) {
		var clauseProperty = (clauseClass == "DataPropertyClause") ? "dataProperty" : "objectProperty";
		var currentClause;
		if (jQuery.isEmptyObject(currentModelData.clauses) || jQuery.isEmptyObject(currentModelData.clauses.clause)) {
			// No dependent clauses at all so start element
			currentModelData.clauses = {
				"_class" : "Clauses",
				"clause" : {}
			};
			currentClause = currentModelData.clauses.clause;
		} else if (!jQuery.isEmptyObject(currentModelData.clauses.conjunctionClauses)) {
			// Conjunction clauses exist so add at the end of the array
			var last = currentModelData.clauses.conjunctionClauses.length;
			currentModelData.clauses.conjunctionClauses[last] = {
				"_class" : "ConjunctionClause",
				"conjunction" : "and",
				"clause" : {}
			};
			currentClause = currentModelData.clauses.conjunctionClauses[last].clause;
		} else {
			// Must be the first of a ConjunctionClause
			currentModelData.clauses.conjunctionClauses = [];
			currentModelData.clauses.conjunctionClauses[0] = {
				"_class" : "ConjunctionClause",
				"conjunction" : "and",
				"clause" : {}
			};
			currentClause = currentModelData.clauses.conjunctionClauses[0].clause;
		}
		currentClause._class = "Clause";
		currentClause.ignore = false;
		currentClause.optional = false;
		currentClause.propertyClause = {};
		currentClause.propertyClause._class = clauseClass;
		if (clauseClass == "DataPropertyClause") {
			switch (currentModelData._class) {
			case "Query":
			case "ObjectPropertyClause":
				currentClause.propertyClause.type = me.getModel("metaModel").getODataInheritedProperty(me.getRangeEntityTypeContext(), property).type;
				break;
			case "ComplexDataPropertyClause":
				currentClause.propertyClause.type = utils.lookupObject(me.getModel("metaModel").getODataComplexType(currentModelData.type).property, "name", property).type;
				break;
			default:
			}

			if (!jQuery.isEmptyObject(me.getModel("metaModel").getODataComplexType(currentClause.propertyClause.type))) {
				currentClause.propertyClause._class = "ComplexDataPropertyClause";
				currentClause.propertyClause.complexDataProperty = property;
			} else {
				currentClause.propertyClause.dataPropertyFilters = {};
				currentClause.propertyClause.dataPropertyFilters._class = "DataPropertyFilters";
				currentClause.propertyClause.dataProperty = property;
			}
		} else {
			// add type = __metadata
			currentClause.propertyClause.objectProperty = property;
			currentClause.propertyClause.multiplicity = me.getModel("metaModel").getODataInheritedAssociation(me.getRangeEntityTypeContext(), property).multiplicity;
			currentClause.propertyClause.objectPropertyFilters = [];
		}
	};
})(window);