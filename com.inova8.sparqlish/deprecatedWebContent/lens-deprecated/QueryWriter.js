jQuery.sap.require("sap.ui.commons.MessageBox");
jQuery.sap.declare("lens.QueryWriter");
if (!Array.prototype.last) {
	Array.prototype.last = function() {
		return this[this.length - 1];
	};
};
if (!Array.prototype.remove) {
	Array.prototype.remove = function(from, to) {
		var rest = this.slice((to || from) + 1 || this.length);
		this.length = from < 0 ? this.length + from : from;
		return this.push.apply(this, rest);
	};
}
if (!Array.prototype.getIndex) {
	Array.prototype.getIndex = function(name, value) {
		for (var i = 0, len = this.length; i < len; i++) {
			if (typeof this[i] != "object")
				continue;
			if (this[i][name] == value)
				return i;
		}
	};
};
if (!Array.prototype.getObject) {
	Array.prototype.getObject = function(name, value) {
		for (var i = 0, len = this.length; i < len; i++) {
			if (typeof this[i] != "object")
				continue;
			if (this[i][name] == value)
				return this[i];
		}
		return undefined;
	};
};
lens.ErrorMessage = function(message) {
	function fnCallbackMessageBox(sResult) {
	}
	sap.ui.commons.MessageBox.show(message, sap.ui.commons.MessageBox.Icon.ERROR, "This could be dangerous, and should not be happening!",
			[ sap.ui.commons.MessageBox.Action.OK ], fnCallbackMessageBox, sap.ui.commons.MessageBox.Action.OK);
};
lens.ConfirmationMessage = function(message) {
	function fnCallbackMessageBox(sResult) {
	}
	sap.ui.commons.MessageBox.show(message, sap.ui.commons.MessageBox.Icon.SUCCESS, "Yes, it worked", [ sap.ui.commons.MessageBox.Action.OK ],
			fnCallbackMessageBox, sap.ui.commons.MessageBox.Action.OK);
};
lens.RemoveRedundantFilterConditions = function(entityType, bindingContext, modelData) {
	// var filterConditions = oObjectPropertyForm.getBindingContext("queryData").getObject()["filterConditions"];
	var filterConditions = bindingContext.getObject()["filterConditions"];
	if (filterConditions != undefined) {
		if (filterConditions.length > 0) {
			var rangeEntityContext = lens.FindEntityType(sap.ui.getCore().getModel("modelData").getData(), entityType);
			var remove = new Array();
			for (var index = filterConditions.length - 1; index >= 0; index--) {
				switch (filterConditions[index].propertyType) {
				case "object": {
					if (jQuery.isArray(rangeEntityContext.NavigationProperty)) {
						if (rangeEntityContext.NavigationProperty.getObject("Name", filterConditions[index].property) == undefined)
							remove.push(index);
					} else {
						if (rangeEntityContext.NavigationProperty.Name != filterConditions[index].property)
							remove.push(index);
					}
					break;
				}
				case "datatype": {
					if (jQuery.isArray(rangeEntityContext.Property)) {
						if (rangeEntityContext.Property.getObject("Name", filterConditions[index].property) == undefined)
							remove.push(index);
					} else {
						if (rangeEntityContext.Property.Name != filterConditions[index].property)
							remove.push(index);
					}
					break;
				}
				}
			}
			if (remove.length > 0) {
				for (var index = 0; index < remove.length; index++) {
					bindingContext.getObject()["filterConditions"].splice(remove[index], 1);
				}
			}
		}
	}
};
lens.LensURIlabel = function(value) {
	if (RegExp("^<.*>$").test(value)) {
		// URL wrapped within <...>, so strip them
		value = value.substring(1, value.length - 1);
	}
	var text = jQuery.uri(value).fragment;
	if (text == undefined) {
		text = jQuery.uri(value).path;
		var textArray = text.toString().split("/");
		if (textArray.length > 2) {
			text = textArray[textArray.length - 1];
		}
	}
	return text;
};
lens.LensURLFormatter = function(value, type, datatype, URLlabel) {
	this.destroyControls();
	if (type == 'uri') {
		var text = lens.LensURIlabel(value);
		if (URLlabel != undefined) {
			text = URLlabel;
		}
		var URL = lens.WriteLensURL("(default)", null, value);
		this.addControl(new sap.ui.commons.Link({
			text : text,
			helpId : URL, // value,
			// TODO hard-coded lens and entityType for now
			href : URL
		}));
		return "<strong><embed data-index='0'></strong>";
	} else {
		if (value == null) {
			return "";
		} else {
			switch (datatype) {
			case "http://www.w3.org/2001/XMLSchema#anyURI":
				this.addControl(new sap.ui.commons.Link({
					text : value,
					helpId : value,
					href : value
				}));
				return "<strong><embed data-index='0'></strong>";
				break;
			case "http://www.w3.org/2001/XMLSchema#decimal":
				return value;
				break;
			default:
				return "<strong>" + value + "</strong>";
			}
		}
	}
};
lens.LensNumberFormatter = function(value) {
	return value;
	// var result = parseFloat(value);
	// if (isNaN(result)) return null;
	// return result;
};
lens.WriteLensURL = function(lens, entityType, entity) {
	var URL = window.location.protocol + "//" + window.location.host + window.location.pathname + "#/lens/";
	URL = URL + lens + "/?entityType=" + entityType + "&entity=" + "<" + encodeURI(encodeURIComponent(entity)) + ">";
	return URL;
};
lens.GetObjectPropertyRangeEntityType = function(model, entityType, objectProperty) {
	var entitySet = lens.FindObjectProperty(model, entityType, objectProperty).ToRole;
	return lens.FindEntitySetFromEntitySet(model, entitySet).EntityType;
};
lens.GetEntityTypeFromEntity = function(resultsModel, entity) {
	var entityObject = new Object();
	entityObject.URL = entity;
	var entityModel = new sap.ui.model.json.JSONModel();
	var entityQuery = "select ?entityType  ?entityLabel where{ " + entity + " a ?entityType  ; rdfs:label ?entityLabel }";
	var entityURL = resultsModel.sparqlEndpoint;
	entityModel.loadData(entityURL, "query=" + encodeURIComponent(entityQuery), false, "POST", false, false, resultsModel.headers);
	var results = entityModel.getData().results.bindings[0];

	var entityTypeURL = results.entityType.value;
	var entityTypeObject = lens.FindEntityTypeFromURL(sap.ui.getCore().getModel("modelData").getData(), entityTypeURL);
	if (entityTypeObject != null) {
		entityObject.Type = entityTypeObject.Name;
	} else {
		entityObject.Type = "(default)";
	}
	entityObject.Label = results.entityLabel.value;

	return entityObject;
};
lens.GetModelContextfromEntity = function(modeldata, sEntityType) {
	var sNamespace = sEntityType.split(".")[0];
	var sEntityTypeName = sEntityType.split(".")[1];
	var entityTypeSchemaIndex = modelData.getData().DataServices[0].Schema.getIndex("Namespace", sNamespace);
	var entityTypeIndex = modelData.getData().DataServices[0].Schema[entityTypeSchemaIndex].EntityType.getIndex("Name", sEntityTypeName);
	var oContext = new sap.ui.model.Context(modelData, "/DataServices/0/Schema/" + entityTypeSchemaIndex + "/EntityType/" + entityTypeIndex);
	return oContext;
};
lens.parentContextOf = function(sContext) {
	// TODO is there not a better way to find the parent context in the tree?
	var sArray = sContext.toString().split("/");
	if (sArray.length > 2) {
		;
		sArray = sArray.slice(0, sArray.length - 2).toString().replace(/,/g, "/");
	} else {
		sArray = sArray.toString().replace(/,/g, "/");
	}
	return sArray;
};
lens.SimpleQueryWriter = function(filter, query, model) {
	query.filter = filter;
	query.alias = query.entitySet;
	if (query.entitySet != undefined || query.entitySet != null || query.entitySet != "") {
		query.entityType = lens.FindEntitySetFromEntitySet(model, query.entitySet).EntityType;
		// query.simple=false;
		var datatypeProperties = lens.FindEntityType(model, query.entityType).Property;
		if (datatypeProperties != undefined) {
			query.filterConditions = [];
			for (var index = 0; index < datatypeProperties.length; index++) {
				if (datatypeProperties[index].Type == "rdf.langString" || datatypeProperties[index].Type == "Collection(rdf.langString)"
						|| datatypeProperties[index].Type == "Edm.String" || datatypeProperties[index].Type == "Collection(Edm.String)") {
					query.filterConditions.push({
						propertyType : "datatype",
						propertyLabel : datatypeProperties[index]["rdfs:label"],
						property : datatypeProperties[index].Name,
						condition : "contains",
						datatype : datatypeProperties[index].Type,
						value : filter,
						optional : true,
						include : true
					});
				}
			}
			return query;
		} else {
			alert("No search properties defined for entitySet:" + query.entitySet);
		}
	}
	return query;
};
lens.AddSimpleQuery = function(newQueryName, queryData) {
	var newQueryData = queryData.getData();
	if (lens.FindQuery(newQueryData, newQueryName) == null) {
		newQueryData.queries.push({
			"queryName" : newQueryName,
			"entityType" : null,
			"entitySet" : null,
			"simple" : true,
			"filter" : null
		});
		queryData.setData(newQueryData);
		return true;
	} else {
		return false;
	}
};
lens.PushSimpleQuery = function(searchText, queryNameValue, queryData, modelData) {
	var query = lens.SimpleQueryWriter(searchText, lens.FindQuery(queryData.getData(), queryNameValue), modelData.getData());
	var newQueryData = queryData.getData();
	newQueryData.queries[queryNameValue] = query;
	queryData.setData(newQueryData);
};
lens.FindQuery = function(query, queryName) {
	for (var index = 0; index < query.queries.length; index++) {
		if (query.queries[index].queryName == queryName) {
			return query.queries[index];
		}
	}
	return null;
};
lens.FindQueryIndex = function(queries, queryName) {
	for (var index = 0; index < queries.queries.length; index++) {
		if (queries.queries[index].queryName == queryName) {
			return index;
		}
	}
	return null;
};
lens.FindEntityType = function(model, entityType) {
	var sNamespace = entityType.split(".")[0];
	var sEntityTypeName = entityType.split(".")[1];
	var entityTypeSchemaIndex = model.DataServices[0].Schema.getIndex("Namespace", sNamespace);
	var entityTypeIndex = model.DataServices[0].Schema[entityTypeSchemaIndex].EntityType.getIndex("Name", sEntityTypeName);
	return model.DataServices[0].Schema[entityTypeSchemaIndex].EntityType[entityTypeIndex];
};
lens.FindEntitySet = function(model, entityType) {
	var entitySetSchemaIndex = model.DataServices[0].Schema.getIndex("Namespace", "Instances");
	var entityTypeIndex = model.DataServices[0].Schema[entitySetSchemaIndex].EntityContainer[0].EntitySet.getIndex("EntityType", entityType);
	return model.DataServices[0].Schema[entitySetSchemaIndex].EntityContainer[0].EntitySet[entityTypeIndex];
};
lens.FindEntitySetFromEntitySet = function(model, entitySet) {
	var entitySetSchemaIndex = model.DataServices[0].Schema.getIndex("Namespace", "Instances");
	var entitySetIndex = model.DataServices[0].Schema[entitySetSchemaIndex].EntityContainer[0].EntitySet.getIndex("Name", entitySet);
	return model.DataServices[0].Schema[entitySetSchemaIndex].EntityContainer[0].EntitySet[entitySetIndex];
};
lens.FindEntitySetFromEntitySetLabel = function(model, entitySetLabel) {
	var entitySetSchemaIndex = model.DataServices[0].Schema.getIndex("Namespace", "Instances");
	var entitySetIndex = model.DataServices[0].Schema[entitySetSchemaIndex].EntityContainer[0].EntitySet.getIndex("rdfs:label", entitySetLabel);
	return model.DataServices[0].Schema[entitySetSchemaIndex].EntityContainer[0].EntitySet[entitySetIndex];
};
lens.FindEntityTypeFromURL = function(model, entityTypeURL) {
	for (var schemaIndex = 0; schemaIndex < model.DataServices[0].Schema.length; schemaIndex++) {
		var entityTypes = model.DataServices[0].Schema[schemaIndex].EntityType;
		if (entityTypes != undefined) {
			for (var index = 0; index < entityTypes.length; index++) {
				if (entityTypes[index]["rdfs:Class"] == entityTypeURL) {
					return entityTypes[index];
				}
			}
		}
	}
	return null;
};
lens.FindDatatypeProperty = function(model, entityType, datatypeProperty) {
	var datatypeProperties = lens.FindEntityType(model, entityType).Property;

	for (var index = 0; index < datatypeProperties.length; index++) {
		if (datatypeProperties[index].Name == datatypeProperty) {
			return datatypeProperties[index];
		}
	}
	return null;
};
lens.FindObjectProperty = function(model, entityType, objectProperty) {
	var objectProperties = lens.FindEntityType(model, entityType).NavigationProperty;
	for (var index = 0; index < objectProperties.length; index++) {
		if (objectProperties[index].Name == objectProperty) {
			return objectProperties[index];
			;
		}
	}
	return null;
};
lens.QueryWriter = function(query, model) {
	var currentEntitySet = {
		Name : query.entitySet,
		EntityType : query.entityType
	};
	// var selectVars = { };
	// selectVars[currentEntitySet.Name]=true;
	var sparql = {
		subWhereClauses : "WHERE { { ?" + currentEntitySet.Name + " a <" + lens.FindEntityType(model, currentEntitySet.EntityType)["rdfs:Class"] + "> .}\n",
		labelVariables : "?" + currentEntitySet.Name + "_label ",
		labelVariableClauses : "OPTIONAL{?" + currentEntitySet.Name + " rdfs:label ?" + currentEntitySet.Name + "_label }.\n",
		whereClauses : "WHERE { { ?" + currentEntitySet.Name + " a <" + lens.FindEntityType(model, currentEntitySet.EntityType)["rdfs:Class"] + "> .}\n",
		subSelectVariables : "SELECT  ?" + currentEntitySet.Name,
		boundClause : "FILTER (",
		allOptional : true,
		// empty : true,
		cartesian : 0,
		variableMapping : {}
	};
	sparql.variableMapping = new Object();
	sparql.variableMapping[currentEntitySet.Name] = new Object();
	sparql.variableMapping[currentEntitySet.Name + "_label"] = new Object();
	sparql.variableMapping[currentEntitySet.Name].URLDisplayField = currentEntitySet.Name + "_label";
	sparql.variableMapping[currentEntitySet.Name + "_label"].hidden = true;

	sparql.selectVars = {};
	sparql.selectVars[currentEntitySet.Name] = true;
	var currentFilterConditions = query.filterConditions;
	sparql = lens.FilterConditionsClause(model, sparql, currentEntitySet, currentFilterConditions);
	sparql.selectVariables = "SELECT DISTINCT ";

	for (variable in sparql.selectVars) {
		sparql.selectVariables = sparql.selectVariables + "?" + variable + " ";
	}
	sparql.selectVariables = sparql.selectVariables + sparql.labelVariables;
	if (sparql.boundClause.slice(-2) == "||") {
		sparql.boundClause = sparql.boundClause.slice(0, sparql.boundClause.length - 2) + ")";
	} else {
		sparql.boundClause = sparql.boundClause + ")";
	}
	if ((sparql.allOptional == true) && (sparql.cartesian > 1)) {
		if (query.simple) {
			sparql.sparql = sparql.selectVariables + " \n" + sparql.whereClauses + sparql.labelVariableClauses + "{" + sparql.subSelectVariables + "\n"
					+ sparql.subWhereClauses + sparql.boundClause + "}}}";
			return sparql;
		} else {
			// sparql.sparql = sparql.selectVariables + "\n" + sparql.subWhereClauses + sparql.labelVariableClauses +
			// sparql.boundClause + "}";
			sparql.sparql = sparql.selectVariables + "\n" + sparql.whereClauses + sparql.labelVariableClauses + "{" + sparql.subSelectVariables + "\n"
					+ sparql.subWhereClauses + sparql.boundClause + "}}}";
			return sparql;
		}
	} else {
		if (query.simple) {
			sparql.sparql = sparql.selectVariables + " \n" + sparql.whereClauses + sparql.labelVariableClauses + " {" + sparql.subSelectVariables + "\n"
					+ sparql.subWhereClauses + "}}}";
			return sparql;
		} else {
			if (sparql.cartesian > 1) {
				sparql.sparql = sparql.selectVariables + "\n" + sparql.subWhereClauses + sparql.labelVariableClauses + sparql.boundClause + "}";
				return sparql;
			} else {
				sparql.sparql = sparql.selectVariables + "\n" + sparql.subWhereClauses + sparql.labelVariableClauses + "}";
				return sparql;
			}
		}
	}
};
lens.FilterConditionsClause = function(model, sparql, currentEntitySet, currentFilterConditions) {
	if (currentFilterConditions != undefined) {
		for (var condition = 0; condition < currentFilterConditions.length; condition++) {
			var currentCondition = currentFilterConditions[condition];
			if (currentCondition.include != false) {
				if (currentCondition.propertyType == "datatype") {
					sparql = lens.DatatypePropertyClause(model, sparql, currentEntitySet, currentCondition);
				} else if (currentCondition.propertyType == "object") {
					sparql = lens.ObjectPropertyClause(model, sparql, currentEntitySet, currentCondition);
				} else {
					// Error: Should not be here
					sparql.whereClauses = "*ERROR*";
					sparql.selectVariables = "*ERROR*";
				}
			}
		}
	}
	return sparql;
};

lens.DatatypePropertyClause = function(model, sparql, currentEntitySet, currentCondition) {
	var currentPropertyValue = currentCondition.property;
	var datatypePropertyURI;
	var datatypeProperty = lens.FindDatatypeProperty(model, currentEntitySet.EntityType, currentPropertyValue);
	var equivalentProperty = datatypeProperty["owl:equivalentProperty"];
	if (equivalentProperty != "" && equivalentProperty != null && equivalentProperty != undefined) {
		if (equivalentProperty == "http://www.w3.org/2000/01/rdf-schema#label") {
			datatypePropertyURI = "http://www.w3.org/2000/01/rdf-schema#label";
			// Hide variable by not adding to select list
		} else {
			if (!(currentPropertyValue in sparql.selectVars)) {
				sparql.selectVars[currentPropertyValue] = true;
			}
			datatypePropertyURI = datatypeProperty["rdf:Property"];
		}
	} else {
		if (!(currentPropertyValue in sparql.selectVars)) {
			sparql.selectVars[currentPropertyValue] = true;
		}
		datatypePropertyURI = datatypeProperty["rdf:Property"];
	}

	var filterClause = "";
	if (currentCondition.value != "" && currentCondition != null && currentCondition.value != undefined) {
		filterClause = lens.FilterCondition(currentCondition, datatypeProperty["rdfs:Datatype"]);
	}
	if (currentCondition.optional == true) {
		// filterClause = "OPTIONAL{" + filterClause + "}";
		sparql.subWhereClauses = sparql.subWhereClauses + "OPTIONAL";
		sparql.whereClauses = sparql.whereClauses + "OPTIONAL";
		sparql.boundClause = sparql.boundClause + "BOUND(?" + currentPropertyValue + ")||";
		sparql.cartesian = sparql.cartesian + 1;
		// sparql.empty = false;
	} else {
		sparql.allOptional = false;
	}
	sparql.subWhereClauses = sparql.subWhereClauses + "{?" + currentEntitySet.Name + " <" + datatypePropertyURI + "> ?" + currentPropertyValue + ".\n"
			+ filterClause + "}.\n";
	sparql.whereClauses = sparql.whereClauses + "{?" + currentEntitySet.Name + " <" + datatypePropertyURI + "> ?" + currentPropertyValue + ".\n" + "}.\n";
	return sparql;
};
lens.ObjectPropertyClause = function(model, sparql, currentEntitySet, currentCondition) {
	var objectEntitySet = lens.FindEntitySet(model, currentCondition.entityType);
	if (!(objectEntitySet.Name in sparql.selectVars)) {
		sparql.selectVars[objectEntitySet.Name] = true;
	}
	if (currentCondition.optional == true) {
		sparql.subWhereClauses = sparql.subWhereClauses + "OPTIONAL";
		sparql.whereClauses = sparql.whereClauses + "OPTIONAL";
		sparql.boundClause = sparql.boundClause + "BOUND(?" + objectEntitySet.Name + ")||";
		sparql.cartesian = sparql.cartesian + 1;
	} else {
		sparql.allOptional = false;
	}
	sparql.labelVariables = sparql.labelVariables + "?" + objectEntitySet.Name + "_label ";
	sparql.labelVariableClauses = sparql.labelVariableClauses + "OPTIONAL{?" + objectEntitySet.Name + " rdfs:label ?" + objectEntitySet.Name + "_label } .\n";

	sparql.variableMapping[objectEntitySet.Name] = new Object();
	sparql.variableMapping[objectEntitySet.Name + "_label"] = new Object();
	sparql.variableMapping[objectEntitySet.Name].URLDisplayField = objectEntitySet.Name + "_label";
	sparql.variableMapping[objectEntitySet.Name + "_label"].hidden = true;

	sparql.subWhereClauses = sparql.subWhereClauses + "{?" + currentEntitySet.Name + " <"
			+ lens.FindObjectProperty(model, currentEntitySet.EntityType, currentCondition.property)["rdf:Property"] + "> ?" + objectEntitySet.Name + ".\n";
	sparql.whereClauses = sparql.whereClauses + "{?" + currentEntitySet.Name + " <"
			+ lens.FindObjectProperty(model, currentEntitySet.EntityType, currentCondition.property)["rdf:Property"] + "> ?" + objectEntitySet.Name + ".\n";
	sparql = lens.FilterConditionsClause(model, sparql, objectEntitySet, currentCondition.filterConditions);
	sparql.whereClauses = sparql.whereClauses + "}.\n";
	sparql.subWhereClauses = sparql.subWhereClauses + "}.\n";
	return sparql;
};
lens.FilterCondition = function(condition, datatype) {
	switch (condition.condition) {
	case "is":
	case "equals": {
		return "FILTER(?" + condition.property + "= '" + condition.value + "'^^<" + datatype + ">)";
	}
		;
	case "is not":
	case "not equals": {
		return "FILTER(?" + condition.property + " != '" + condition.value + "'^^<" + datatype + ">)";
	}
		;
	case "greater than": {
		return "FILTER(?" + condition.property + " >= '" + condition.value + "'^^<" + datatype + ">)";
	}
		;
	case "greater than or equal": {
		return "FILTER(?" + condition.property + " >= '" + condition.value + "'^^<" + datatype + ">)";
	}
		;
	case "less than": {
		return "FILTER(?" + condition.property + " < '" + condition.value + "'^^<" + datatype + ">)";
	}
		;
	case "less than or equal": {
		return "FILTER(?" + condition.property + " <+ '" + condition.value + "'^^<" + datatype + ">)";
	}
		;
	case "contains": {
		return "FILTER(REGEX(?" + condition.property + ", '" + condition.value + "'^^<" + datatype + ">,'i'))";
	}
		;
	case "ends with": {
		return "*ERROR*";
	}
		;
	case "starts with": {
		return "*ERROR*";
	}
		;
	case "between": {
		return "*ERROR*";
	}
		;
	case "after": {
		return "FILTER(?" + condition.property + " > '" + condition.value + "'^^<" + datatype + ">)";
	}
		;
	case "before": {
		return "FILTER(?" + condition.property + " < '" + condition.value + "'^^<" + datatype + ">)";
	}
		;
	}
};