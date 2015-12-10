jQuery.sap.require("sap.ui.model.MetaModel");
Array.prototype.removeValue = function(name, value) {
	var array = $.map(this, function(v, i) {
		return v[name] === value ? null : v;
	});
	this.length = 0; // clear original array
	this.push.apply(this, array); // push all elements except the one we want to delete
};

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

