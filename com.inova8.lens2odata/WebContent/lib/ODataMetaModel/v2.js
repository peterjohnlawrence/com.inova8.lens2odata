jQuery.sap.require("sap.ui.model.odata.ODataMetaModel");
"use strict";
sap.ui.model.odata.ODataMetaModel.prototype.entityTypeContext = function(oQueryModel, oContext) {
	try {
		var path = oContext.getPath().split("clauses");
		var depth = (path.length - 1);

		var sConcept = oQueryModel.getProperty(path[0]).concept;
		var sEntityType = this.getODataConcept(sConcept).entityType;
		path.splice(path.length - 1, 1);
		var sContextPath = path[0];

		for (var index = 1; index < depth; index++) {
			sContextPath += "clauses" + path[index];
			var sObjectProperty = oQueryModel.getProperty(sContextPath).objectProperty;
			sEntityType = this.getODataAssociationEnd(this.getODataEntityType(sEntityType), sObjectProperty).type;
		}
		return oMetaModel.getODataEntityType(sEntityType);
	} catch (error) {
		jQuery.sap.log.fatal(error, 'Failed to locate entityTypeContext using context ' + oContext.getPath() + " with error " + error.message);
		return null;
		// throw ('Failed to locate entityTypeContext using context ' + oContext.getPath() + " with error " +
		// error.message);
	}
};

sap.ui.model.odata.ODataMetaModel.prototype.entityTypeQName = function(oQueryModel, oContext) {
	try {
		var path = oContext.getPath().split("clauses");

		var depth = (path.length - 1);

		var sConcept = oQueryModel.getProperty(path[0]).concept;
		var sEntityType = this.getODataConcept(sConcept).entityType;
		path.splice(path.length - 1, 1);
		var sContextPath = path[0];

		for (var index = 1; index < depth; index++) {
			sContextPath += "clauses" + path[index];
			switch (oQueryModel.getProperty(sContextPath)._class) {
			case "ComplexDataPropertyClause":
				var sComplexProperty = oQueryModel.getProperty(sContextPath).complexDataProperty;
				var oEntityType = this.getODataEntityType(sEntityType);
				var oComplexProperty = utils.lookupObject(oEntityType.property, "name", sComplexProperty);
				sEntityType = oComplexProperty.type;
				break;
			case "ObjectPropertyClause":
				var sObjectProperty = oQueryModel.getProperty(sContextPath).objectProperty;
				sEntityType = this.getODataInheritedAssociation(this.getODataEntityType(sEntityType), sObjectProperty).type;
				break;
			case "DataPropertyClause":
				break;
			default:
			}
		}
		return sEntityType;
	} catch (error) {
		jQuery.sap.log.fatal(error, 'Failed to locate qName using context ' + oContext.getPath() + " with error " + error.message);
		return null;
		// throw ('Failed to locate qName using context ' + oContext.getPath() + " with error " + error.message);
	}
};

sap.ui.model.odata.ODataMetaModel.prototype.getNavigationProperties = function(sEntityType) {
	try {
		var oEntityType = this.getODataEntityType(sEntityType);
		var navigationProperties = [];
		if (!jQuery.isEmptyObject(oEntityType.baseType)) {
			if (jQuery.isEmptyObject(oEntityType.navigationProperty)) {
				navigationProperties = this.getNavigationProperties(oEntityType.baseType);
			} else {
				navigationProperties = oEntityType.navigationProperty.slice(0);
				navigationProperties = navigationProperties.concat(this.getNavigationProperties(oEntityType.baseType));
			}
		} else {
			if (!jQuery.isEmptyObject(oEntityType.navigationProperty))
				navigationProperties = oEntityType.navigationProperty.slice(0);
		}
		return navigationProperties;
	} catch (error) {
		jQuery.sap.log.fatal(error, 'Failed to locate navigation properties ' + sEntityType + " with error " + error.message);
		return null;
	}
};
sap.ui.model.odata.ODataMetaModel.prototype.getComplexNavigationProperties = function(sComplexType) {
	try {
		var oComplexType = this.getODataComplexType(sComplexType);
		var complexNavigationProperties = [];
		if (!jQuery.isEmptyObject(oComplexType.baseType)) {
			if (jQuery.isEmptyObject(oComplexType.navigationProperty)) {
				complexNavigationProperties = this.getComplexNavigationProperties(oComplexType.baseType);
			} else {
				complexNavigationProperties = oEntityType.navigationProperty.slice(0);
				complexNavigationProperties = getComplexNavigationProperties.concat(this.getNavigationProperties(oComplexType.baseType));
			}
		} else {
			if (!jQuery.isEmptyObject(oComplexType.navigationProperty))
				complexNavigationProperties = oComplexType.navigationProperty.slice(0);
		}
		return complexNavigationProperties;
	} catch (error) {
		jQuery.sap.log.fatal(error, 'Failed to locate complex navigation properties ' + sComplexType + " with error " + error.message);
		return null;
	}
};
sap.ui.model.odata.ODataMetaModel.prototype.getODataInheritedNavigationProperty = function(oEntityType, sObjectProperty) {
	var oObjectProperty = this.getODataNavigationProperty(oEntityType, sObjectProperty);
	if (jQuery.isEmptyObject(oObjectProperty)) {
		if (!jQuery.isEmptyObject(oEntityType.baseType)) {
			return this.getODataInheritedNavigationProperty(this.getODataEntityType(oEntityType.baseType), sObjectProperty);
		} else {
			return null;
		}
	} else {
		return oObjectProperty;
	}
};
sap.ui.model.odata.ODataMetaModel.prototype.getODataInheritedComplexProperty = function(oEntityType, sComplexDataProperty) {
	var oComplexDataProperty = utils.lookupObject(oEntityType.property, "name", sComplexDataProperty);
	if (jQuery.isEmptyObject(oComplexDataProperty)) {
		if (!jQuery.isEmptyObject(oEntityType.baseType)) {
			return this.getODataInheritedComplexProperty(this.getODataEntityType(oEntityType.baseType), sComplexDataProperty);
		} else {
			return null;
		}
	} else {
		return oComplexDataProperty;
	}
};
sap.ui.model.odata.ODataMetaModel.prototype.getODataInheritedAssociation = function(oEntityType, sObjectProperty) {
	var oObjectProperty = this.getODataNavigationProperty(oEntityType, sObjectProperty);
	if (jQuery.isEmptyObject(oObjectProperty)) {
		if (!jQuery.isEmptyObject(oEntityType.baseType)) {
			return this.getODataInheritedAssociation(this.getODataEntityType(oEntityType.baseType), sObjectProperty);
		} else {
			return null;
		}
	} else {
		return this.getODataAssociationEnd(oEntityType, oObjectProperty.name);
	}
};

sap.ui.model.odata.ODataMetaModel.prototype.getODataNavigationProperty = function(oEntityType, sObjectProperty) {
	try {
		var navigationProperties = oEntityType.navigationProperty;
		if (jQuery.isEmptyObject(navigationProperties)) {
			return null;
		} else {
			for (var index = 0; index < navigationProperties.length; index++) {
				if (navigationProperties[index].name == sObjectProperty)
					return navigationProperties[index];
			}
		}
	} catch (error) {
		return null;
	}
};
sap.ui.model.odata.ODataMetaModel.prototype.getNavigationProperty = function(sEntityType, sObjectProperty) {
	try {
		var oEntityType = this.getODataEntityType(sEntityType);
		var navigationProperties = oEntityType.navigationProperty;
		if (jQuery.isEmptyObject(navigationProperties)) {
			return null;
		} else {
			for (var index = 0; index < navigationProperties.length; index++) {
				if (navigationProperties[index].name == sObjectProperty)
					return navigationProperties[index];
			}
		}
	} catch (error) {
		// return null;
		jQuery.sap.log.fatal(error, 'Failed to locate navigation property ' + sEntityType + " " + sObjectProperty + " with error " + error.message);
		return null;
		// throw ('Failed to locate navigation property ' + sEntityType + " " + sObjectProperty + " with error " +
		// error.message);
	}
};
sap.ui.model.odata.ODataMetaModel.prototype.getDataProperties = function(sEntityType) {
	try {
		var oEntityType = this.getODataEntityType(sEntityType);
		var dataProperties = [];
		if (!jQuery.isEmptyObject(oEntityType.baseType)) {
			if (jQuery.isEmptyObject(oEntityType.property)) {
				dataProperties = this.getDataProperties(oEntityType.baseType);
			} else {
				dataProperties = oEntityType.property.slice(0);
				dataProperties = dataProperties.concat(this.getDataProperties(oEntityType.baseType));
			}
		} else {
			if (!jQuery.isEmptyObject(oEntityType.property))
				dataProperties = oEntityType.property.slice(0);
		}
		return dataProperties;
	} catch (error) {
		jQuery.sap.log.fatal(error, 'Failed to locate data properties ' + sEntityType + " with error " + error.message);
		return null;
	}
};
sap.ui.model.odata.ODataMetaModel.prototype.getComplexDataProperties = function(sComplexType) {
	try {
		var oComplexType = this.getODataComplexType(sComplexType);
		var complexDataProperties = [];
		if (!jQuery.isEmptyObject(oComplexType.baseType)) {
			if (jQuery.isEmptyObject(oComplexType.property)) {
				complexDataProperties = this.getComplexDataProperties(oComplexType.baseType);
			} else {
				complexDataProperties = oComplexType.property.slice(0);
				complexDataProperties = complexDataProperties.concat(this.getComplexDataProperties(oComplexType.baseType));
			}
		} else {
			if (!jQuery.isEmptyObject(oComplexType.property))
				complexDataProperties = oComplexType.property.slice(0);
		}
		return complexDataProperties;
	} catch (error) {
		jQuery.sap.log.fatal(error, 'Failed to locate complex data properties ' + sComplexType + " with error " + error.message);
		return null;
	}
};
sap.ui.model.odata.ODataMetaModel.prototype.getODataInheritedProperty = function(oEntityType, sProperty) {
	var oProperty = this.getODataProperty(oEntityType, sProperty);
	if (jQuery.isEmptyObject(oProperty)) {
		if (!jQuery.isEmptyObject(oEntityType.baseType)) {
			return this.getODataInheritedProperty(this.getODataEntityType(oEntityType.baseType), sProperty);
		} else {
			return null;
		}
	} else {
		return oProperty;
	}
};
sap.ui.model.odata.ODataMetaModel.prototype.getDataProperty = function(sEntityType, sProperty) {
	try {
		var oEntityType = this.getODataEntityType(sEntityType);
		var properties = oEntityType.property;
		if (jQuery.isEmptyObject(properties)) {
			return null;
		} else {
			for (var index = 0; index < properties.length; index++) {
				if (properties[index].name == sProperty)
					return properties[index];
			}
			// TODO should we really do this?
			return properties[0];
		}
	} catch (error) {
		jQuery.sap.log.fatal(error, 'Failed to locate data property ' + sEntityType + " " + sProperty + " with error " + error.message);
		return null;
		// throw ('Failed to locate data property ' + sEntityType + " " + sProperty + " with error " + error.message);
	}
};
sap.ui.model.odata.ODataMetaModel.prototype.getEntityTypeKeyProperties = function(sEntityType) {
	try {
		var oEntityType = this.getODataEntityType(sEntityType);
		if ((jQuery.isEmptyObject(oEntityType.key) && (!jQuery.isEmptyObject(oEntityType.baseType)))) {
			return this.getEntityTypeKeyProperties(oEntityType.baseType);
		} else {
			return oEntityType.key.propertyRef;
		}
	} catch (error) {
		jQuery.sap.log.fatal(error, 'Failed to locate keys of ' + sEntityType + " with error " + error.message);
		return null;
		// throw ('Failed to locate keys of ' + sEntityType + " with error " + error.message);
	}
};
sap.ui.model.odata.ODataMetaModel.prototype.getEntityTypeModel = function(sEntityType) {
	try {
		var oEntityTypeModelData = {};
		var navigationProperties = this.getNavigationProperties(sEntityType);
		var dataProperties = this.getDataProperties(sEntityType);
		oEntityTypeModelData.navigationProperty = navigationProperties;
		oEntityTypeModelData.property = dataProperties;
		var oEntityTypeModel = new sap.ui.model.json.JSONModel();
		oEntityTypeModel.setData(oEntityTypeModelData);
		return oEntityTypeModel;
	} catch (error) {
		jQuery.sap.log.fatal(error, 'Failed to locate EntityTypeModel ' + sEntityType + " with error " + error.message);
		return null;
	}
};
sap.ui.model.odata.ODataMetaModel.prototype.getComplexTypeModel = function(sComplexType) {
	try {
		var oComplexTypeModelData = {};
		var complexNavigationProperties = this.getComplexNavigationProperties(sComplexType);
		var complexDataProperties = this.getComplexDataProperties(sComplexType);
		// var complexTypes = [];
		// for (var index = 0; index < dataProperties.length; index++) {
		// if ((dataProperties[index].type).split(".")[0] != "Edm") {
		// // Must be a complex property
		// complexTypes.push(dataProperties[index]);
		// }
		// }
		oComplexTypeModelData.navigationProperty = complexNavigationProperties;
		oComplexTypeModelData.property = complexDataProperties;
		// oEntityTypeModelData.complexType = complexTypes;
		var oComplexTypeModel = new sap.ui.model.json.JSONModel();
		oComplexTypeModel.setData(oComplexTypeModelData);
		return oComplexTypeModel;
	} catch (error) {
		jQuery.sap.log.fatal(error, 'Failed to locate ComplexTypeModel ' + sComplexType + " with error " + error.message);
		return null;
	}
};
sap.ui.model.odata.ODataMetaModel.prototype.getODataAssociationSetsForToEnd = function(sToEntitySet) {
	var associationSets = [ {
		key : "{uri}",
		value : sToEntitySet,
		concept : sToEntitySet
	} ];
	try {
		var associationSet = this.getODataEntityContainer()["associationSet"];// sap.ui.getCore().getModel("odataModel_LNW2").getMetaModel().getODataEntityContainer()["associationSet"];
		for (var index = 0; index < associationSet.length; index++) {
			if (associationSet[index].end[1].entitySet == sToEntitySet)
				associationSets = associationSets.concat({
					key : "{uri}/" + associationSet[index].name,
					value : associationSet[index].end[0].entitySet + "/" + associationSet[index].name,
					concept : associationSet[index].end[0].entitySet
				});
		}
	} catch (error) {
	}
	return associationSets;
};
sap.ui.model.odata.ODataMetaModel.prototype.getODataCollections = function() {
	var oDataCollections = this.getODataEntityContainer();
	oDataCollections.collections = [];
	jQuery.merge(oDataCollections.collections, oDataCollections.entitySet);
	for ( var functionImport in oDataCollections.functionImport) {
		var oFunctionImport = oDataCollections.functionImport[functionImport];
		if (jQuery.isEmptyObject(utils.lookup(oDataCollections.collections, "entityset", oFunctionImport.name))) {
			var oEntitySet = utils.lookup(oDataCollections.collections, "name", oFunctionImport.entitySet);
			oFunctionImport.entityType = oEntitySet.entityType;
			oDataCollections.collections.push(oFunctionImport);
		}
	}
	return oDataCollections;
};
sap.ui.model.odata.ODataMetaModel.prototype.getODataConcept = function(sConcept) {
	var oDataConcept =this.getODataEntitySet(sConcept);
	if(oDataConcept){
		return oDataConcept;
	}else{
		oDataConcept = this.getODataFunctionImport(sConcept)
		oDataConcept.entityType=utils.lookupObject( this.getODataEntityContainer().entitySet, "name", oDataConcept.entitySet).entityType;
		return oDataConcept;
	}
};

