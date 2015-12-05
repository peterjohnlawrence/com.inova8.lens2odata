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
			//TODO should we really do this?
			return properties[0];
		}
	} catch (error) {
		jQuery.sap.log.fatal(error, 'Failed to locate data property ' + sEntityType + " " + sProperty + " with error " + error.message);
	}
};
// entityTypeContext = function(oQueryModel, oMetaModel, oContext) {
// var path = oContext.getPath().split("clauses");
// var depth = (path.length - 1);
//
// var sConcept = oQueryModel.getProperty(path[0]).concept;
// var sEntityType = oMetaModel.getODataEntitySet(sConcept).entityType;
// path.splice(path.length - 1, 1);
// var sContextPath = path[0];
//
// for (var index = 1; index < depth; index++) {
// sContextPath += "clauses" + path[index];
// var sObjectProperty = oQueryModel.getProperty(sContextPath).objectProperty;
// var navigationProperty = getNavigationProperty(oMetaModel,sEntityType, sObjectProperty);
// var toEntitySet = navigationProperty.toRole;
// sEntityType = oMetaModel.getODataEntitySet(toEntitySet).entityType;
// }
// return oMetaModel.getODataEntityType(sEntityType);
// };
// entityTypeQName = function(oQueryModel, oMetaModel, oContext) {
// try {
// var path = oContext.getPath().split("clauses");
//
// var depth = (path.length - 1);
//
// var sConcept = oQueryModel.getProperty(path[0]).concept;
// var sEntityType = oMetaModel.getODataEntitySet(sConcept).entityType;
// path.splice(path.length - 1, 1);
// var sContextPath = path[0];
//
// for (var index = 1; index < depth; index++) {
// sContextPath += "clauses" + path[index];
// var sObjectProperty = oQueryModel.getProperty(sContextPath).objectProperty;
// var navigationProperty = getNavigationProperty(oMetaModel,sEntityType, sObjectProperty);
// var toEntitySet = navigationProperty.toRole;
// sEntityType = oMetaModel.getODataEntitySet(toEntitySet).entityType;
// }
// return sEntityType;
// } catch (error) {
// jQuery.sap.log.fatal(error, 'Failed to locate qName using context ' + oContext.getPath());
// }
// };
// getNavigationProperty = function(oMetaModel,sEntityType, sObjectProperty) {
// var oEntityType = oMetaModel.getODataEntityType(sEntityType);
// var navigationProperties = oEntityType.navigationProperty;
// for (var index = 0; index < navigationProperties.length; index++) {
// if (navigationProperties[index].name == sObjectProperty)
// return navigationProperties[index];
// }
// };
// getProperty = function(oMetaModel,sEntityType, sProperty) {
// var oEntityType = oMetaModel.getODataEntityType(sEntityType);
// var properties = oEntityType.property;
// for (var index = 0; index < properties.length; index++) {
// if (properties[index].name == sProperty)
// return properties[index];
// }
// return properties[0];
// };
// checkClass = function(oControl, oRm, sModel, _class) {
// if (oControl.getModel(sModel).getProperty("_class", oControl.getBindingContext(sModel)) !=_class) {
// oRm.addClass("error");
// oRm.write("<div ");
// oRm.writeControlData(oControl);
// oRm.writeClasses();
// oRm.write(">");
// oRm.write("Not referencing a " + _class + " class");
// oRm.write("</div>");
// return false;
// }else{
// return true;
// }
// }
