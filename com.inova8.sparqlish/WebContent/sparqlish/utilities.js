entityTypeContext = function(oQueryModel, oMetaModel, oContext) {
	var path = oContext.getPath().split("clauses");
	var depth = (path.length - 1);

	var sConcept = oQueryModel.getProperty(path[0]).concept;
	var sEntityType = oMetaModel.getODataEntitySet(sConcept).entityType;
	path.splice(path.length - 1, 1);
	var sContextPath = path[0];

	for (var index = 1; index < depth; index++) {
		sContextPath += "clauses" + path[index];
		var sObjectProperty = oQueryModel.getProperty(sContextPath).objectProperty;
		var navigationProperty = getNavigationProperty(sEntityType, sObjectProperty);
		var toEntitySet = navigationProperty.toRole;
		sEntityType = oMetaModel.getODataEntitySet(toEntitySet).entityType;
	}
	return oMetaModel.getODataEntityType(sEntityType);
};
entityTypeQName = function(oQueryModel, oMetaModel, oContext) {
	try {
		var path = oContext.getPath().split("clauses");

		var depth = (path.length - 1);

		var sConcept = oQueryModel.getProperty(path[0]).concept;
		var sEntityType = oMetaModel.getODataEntitySet(sConcept).entityType;
		path.splice(path.length - 1, 1);
		var sContextPath = path[0];

		for (var index = 1; index < depth; index++) {
			sContextPath += "clauses" + path[index];
			var sObjectProperty = oQueryModel.getProperty(sContextPath).objectProperty;
			var navigationProperty = getNavigationProperty(sEntityType, sObjectProperty);
			var toEntitySet = navigationProperty.toRole;
			sEntityType = oMetaModel.getODataEntitySet(toEntitySet).entityType;
		}
		return sEntityType;
	} catch (error) {
		jQuery.sap.log.fatal(error, 'Failed to locate qName using context ' + oContext.getPath());
	}
};
getNavigationProperty = function(oMetaModel,sEntityType, sObjectProperty) {
	var oEntityType = oMetaModel.getODataEntityType(sEntityType);
	var navigationProperties = oEntityType.navigationProperty;
	for (var index = 0; index < navigationProperties.length; index++) {
		if (navigationProperties[index].name == sObjectProperty)
			return navigationProperties[index];
	}
};
getProperty = function(oMetaModel,sEntityType, sProperty) {
	var oEntityType = oMetaModel.getODataEntityType(sEntityType);
	var properties = oEntityType.property;
	for (var index = 0; index < properties.length; index++) {
		if (properties[index].name == sProperty)
			return properties[index];
	}
	return properties[0];
};
checkClass = function(oControl, oRm, sModel, _class) {
	if (oControl.getModel(sModel).getProperty("_class", oControl.getBindingContext(sModel)) !=_class) {
		oRm.addClass("error");
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("Not referencing a " +  _class + " class");
		oRm.write("</div>");
		return false;
	}else{
		return true;
	}
}