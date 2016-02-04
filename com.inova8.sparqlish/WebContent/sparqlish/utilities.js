jQuery.sap.require("sap.ui.model.MetaModel");
sap.ui.model.MetaModel.prototype.entityTypeContext = function(oQueryModel, oContext) {
	try {
		var path = oContext.getPath().split("clauses");
		var depth = (path.length - 1);

		var sConcept = oQueryModel.getProperty(path[0]).concept;
		var sEntityType = this.getODataEntitySet(sConcept).entityType;
		path.splice(path.length - 1, 1);
		var sContextPath = path[0];

		for (var index = 1; index < depth; index++) {
			sContextPath += "clauses" + path[index];
			var sObjectProperty = oQueryModel.getProperty(sContextPath).objectProperty;
			var navigationProperty = this.getNavigationProperty(sEntityType, sObjectProperty);
			var toEntitySet = navigationProperty.toRole;
			sEntityType = this.getODataEntitySet(toEntitySet).entityType;
		}
		return oMetaModel.getODataEntityType(sEntityType);
	} catch (error) {
		jQuery.sap.log.fatal(error, 'Failed to locate entityTypeContext using context ' + oContext.getPath() + " with error " + error.message);
		throw ('Failed to locate entityTypeContext using context ' + oContext.getPath() + " with error " + error.message);
	}
};

sap.ui.model.MetaModel.prototype.entityTypeQName = function(oQueryModel, oContext) {
	try {
		var path = oContext.getPath().split("clauses");

		var depth = (path.length - 1);

		var sConcept = oQueryModel.getProperty(path[0]).concept;
		var sEntityType = this.getODataEntitySet(sConcept).entityType;
		path.splice(path.length - 1, 1);
		var sContextPath = path[0];

		for (var index = 1; index < depth; index++) {
			sContextPath += "clauses" + path[index];
			var sObjectProperty = oQueryModel.getProperty(sContextPath).objectProperty;
			var navigationProperty = this.getNavigationProperty(sEntityType, sObjectProperty);
			var toEntitySet = navigationProperty.toRole;
			sEntityType = this.getODataEntitySet(toEntitySet).entityType;
		}
		return sEntityType;
	} catch (error) {
		jQuery.sap.log.fatal(error, 'Failed to locate qName using context ' + oContext.getPath() + " with error " + error.message);
		throw ('Failed to locate qName using context ' + oContext.getPath() + " with error " + error.message);
	}
};
sap.ui.model.MetaModel.prototype.getNavigationProperties = function(sEntityType) {
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
		throw ('Failed to locate navigation properties ' + sEntityType + " with error " + error.message);
	}
};
sap.ui.model.MetaModel.prototype.getNavigationProperty = function(sEntityType, sObjectProperty) {
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
		jQuery.sap.log.fatal(error, 'Failed to locate navigation property ' + sEntityType + " " + sObjectProperty + " with error " + error.message);
		throw ('Failed to locate navigation property ' + sEntityType + " " + sObjectProperty + " with error " + error.message);
	}
};
sap.ui.model.MetaModel.prototype.getDataProperties = function(sEntityType) {
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
		throw ('Failed to locate data properties ' + sEntityType + " with error " + error.message);
	}
};
sap.ui.model.MetaModel.prototype.getODataInheritedProperty = function(oEntityType, sProperty) {
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
sap.ui.model.MetaModel.prototype.getDataProperty = function(sEntityType, sProperty) {
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
		throw ('Failed to locate data property ' + sEntityType + " " + sProperty + " with error " + error.message);
	}
};
sap.ui.model.MetaModel.prototype.getEntityTypeKeyProperties = function(sEntityType) {
	try {
		var oEntityType = this.getODataEntityType(sEntityType);
		if ((jQuery.isEmptyObject(oEntityType.key) && (!jQuery.isEmptyObject(oEntityType.baseType)))) {
			return this.getEntityTypeKeyProperties(oEntityType.baseType);
		} else {
			return oEntityType.key.propertyRef;
		}
	} catch (error) {
		jQuery.sap.log.fatal(error, 'Failed to locate keys of ' + sEntityType + " with error " + error.message);
		throw ('Failed to locate keys of ' + sEntityType + " with error " + error.message);
	}
};
sap.ui.model.MetaModel.prototype.getEntityTypeModel = function(sEntityType) {
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

	}
};
