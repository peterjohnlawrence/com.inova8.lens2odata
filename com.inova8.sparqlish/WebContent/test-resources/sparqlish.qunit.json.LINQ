{
	"queries": 
	[
		{
			"_class": "Query",
			"name": "Test1:No clauses",
			"concept": "<http://northwind.com/Order>",
			"odataURL": "http://services.odata.org/V2/Northwind/Northwind.svc/Orders?$top=10",
			"LINQ": ""
		},

		{
			"_class": "Query",
			"name": "Test2:Single clauses",
			"concept": "<http://northwind.com/Order>",
			"odataURL": "http://services.odata.org/V2/Northwind/Northwind.svc/Orders()?$filter=substringof('Fr',ShipCountry)&$top=10",
			"LINQ": "(from order in Orders where order.ShipCountry.Contains(\"Fr\") select order).Take(10)",
			"label": "Order",
			"clauses": 
			{
				"_class": "Clauses",
				"clause": 
				{
					"_class": "Clause",
					"label": "Ship To Country",
					"propertyClause": 
					{
						"_class": "DataPropertyClause",
						"dataProperty": "<http://northwind.com/shipCountry>",
						"filters": 
						{
							"_class": "Filters",
							"filter": 
							{
								"_class": "Filter",
								"condition": "containing",
								"value": "Fr",
								"datatype": "<http://www.w3.org/2001/XMLSchema#string>"
							}
						}
					}
				}
			}
		},

		{
			"_class": "Query",
			"name": "Test3:Optional Single clauses",
			"concept": "<http://northwind.com/Order>",
			"clauses": 
			{
				"_class": "Clauses",
				"clause": 
				{
					"_class": "Clause",
					"ignore": false,
					"optional": true,
					"propertyClause": 
					{
						"_class": "DataPropertyClause",
						"dataProperty": "<http://northwind.com/shipCountry>",
						"filters": 
						{
							"_class": "Filters",
							"filter": 
							{
								"_class": "Filter",
								"condition": "containing",
								"value": "Fr",
								"datatype": "<http://www.w3.org/2001/XMLSchema#string>"
							}
						}
					}
				}
			}
		},

		{
			"_class": "Query",
			"name": "Test4:Optional two clauses",
			"concept": "<http://northwind.com/Order>",
			"odataURL": "http://services.odata.org/V2/Northwind/Northwind.svc/Orders()?$filter=substringof('Fr',ShipCountry) and ShippedDate lt datetime'1998-01-01T00:00:00'&$top=10",
			"LINQ": "(from order in Orders where order.ShipCountry.Contains(\"Fr\") where order.ShippedDate < DateTime.Parse(\"1998-01-01\") select order ).Take(10)",
			"clauses": 
			{
				"_class": "Clauses",
				"clause": 
				{
					"_class": "Clause",
					"ignore": false,
					"optional": true,
					"label": "Ship To Country",
					"propertyClause": 
					{
						"_class": "DataPropertyClause",
						"dataProperty": "<http://northwind.com/shipCountry>",
						"filters": 
						{
							"_class": "Filters",
							"filter": 
							{
								"_class": "Filter",
								"condition": "containing",
								"value": "Fr",
								"datatype": "<http://www.w3.org/2001/XMLSchema#string>"
							}
						}
					}
				},

				"conjunctionClauses": 
				[
					{
						"_class": "ConjunctionClause",
						"conjunction": "and",
						"clause": 
						{
							"_class": "Clause",
							"ignore": false,
							"optional": false,
							"label": "Shipping Date",
							"propertyClause": 
							{
								"_class": "DataPropertyClause",
								"dataProperty": "<http://northwind.com/shippedDate>",
								"filters": 
								{
									"_class": "Filters",
									"filter": 
									{
										"_class": "Filter",
										"condition": "<",
										"value": "1998-01-01",
										"datatype": "<http://www.w3.org/2001/XMLSchema#date>"
									}
								}
							}
						}
					}
				]
			}
		},

		{
			"_class": "Query",
			"name": "Test5:Object clause",
			"concept": "<http://northwind.com/Order>",
			"odataURL": "http://services.odata.org/V2/Northwind/Northwind.svc/Orders()?$filter=Customer/CustomerID eq 'ANATR' or Customer/CustomerID eq 'ALFKI'&$top=10&$expand=Customer&$select=OrderID,Customer/CustomerID",
			"LINQ": "(from order in Orders where order.Customer.CustomerID  ==\"ANATR\" || order.Customer.CustomerID  ==\"ALFKI\" select new { order.OrderID, order.Customer.CustomerID }).Take(10)",
			"clauses": 
			{
				"_class": "Clauses",
				"clause": 
				{
					"_class": "Clause",
					"ignore": false,
					"optional": false,
					"propertyClause": 
					{
						"_class": "ObjectPropertyClause",
						"objectProperty": "<http://northwind.com/customer>",
						"objectPropertyFilters": 
						[
							"<http://northwind.com/Customer-ALFKI>",
							"northwind:Customer-ANATR"
						]
					}
				}
			}
		},

		{
			"_class": "Query",
			"name": "Test6:Object clauses",
			"concept": "<http://northwind.com/Order>",
			"clauses": 
			{
				"_class": "Clauses",
				"clause": 
				{
					"_class": "Clause",
					"ignore": false,
					"optional": false,
					"propertyClause": 
					{
						"_class": "ObjectPropertyClause",
						"objectProperty": "<http://northwind.com/customer>"
					}
				},

				"conjunctionClauses": 
				[
					{
						"_class": "ConjunctionClause",
						"conjunction": "and",
						"clause": 
						{
							"_class": "Clause",
							"ignore": false,
							"optional": false,
							"propertyClause": 
							{
								"_class": "ObjectPropertyClause",
								"objectProperty": "<http://northwind.com/customer>"
							}
						}
					}
				]
			}
		},

		{
			"_class": "Query",
			"name": "Test7:Object clauses",
			"concept": "<http://northwind.com/Order>",
			"odataURL": "http://services.odata.org/V2/Northwind/Northwind.svc/Orders()?$filter=Customer/CustomerID eq 'ANATR' or Customer/CustomerID eq 'ALFKI'&$top=10&$expand=Customer&$select=OrderID,Customer/CustomerID",
			"LINQ": "(from order in Orders where order.Customer.CustomerID  ==\"ANATR\" || order.Customer.CustomerID  ==\"ALFKI\" select new { order.OrderID, order.Customer.CustomerID }).Take(10)",
			"clauses": 
			{
				"_class": "Clauses",
				"clause": 
				{
					"_class": "Clause",
					"ignore": false,
					"optional": false,
					"propertyClause": 
					{
						"_class": "ObjectPropertyClause",
						"objectProperty": "<http://northwind.com/customer>",
						"clauses": 
						{
							"_class": "Clauses",
							"clause": 
							{
								"_class": "Clause",
								"ignore": false,
								"optional": false,
								"propertyClause": 
								{
									"_class": "DataPropertyClause",
									"dataProperty": "<http://northwind.com/shippedDate>",
									"filters": 
									{
										"_class": "Filters",
										"filter": 
										{
											"_class": "Filter",
											"condition": "<",
											"value": "1998-01-01",
											"datatype": "<http://www.w3.org/2001/XMLSchema#date>"
										}
									}
								}
							}
						}
					}
				}
			}
		},

		{
			"_class": "Query",
			"name": "Test8:Object object clauses",
			"concept": "<http://northwind.com/Order>",
			"clauses": 
			{
				"_class": "Clauses",
				"clause": 
				{
					"_class": "Clause",
					"ignore": false,
					"optional": false,
					"propertyClause": 
					{
						"_class": "ObjectPropertyClause",
						"objectProperty": "<http://northwind.com/customer>",
						"clauses": 
						{
							"_class": "Clauses",
							"clause": 
							{
								"_class": "Clause",
								"ignore": false,
								"optional": false,
								"propertyClause": 
								{
									"_class": "InverseObjectPropertyClause",
									"inverseObjectProperty": "<http://northwind.com/isEmployeeOf>"
								}
							}
						}
					}
				}
			}
		},

		{
			"_class": "Query",
			"name": "Test9:Object object clauses",
			"concept": "<http://northwind.com/Order>",
			"odataURL": "http://services.odata.org/V2/Northwind/Northwind.svc/Orders()?$filter=(Customer/CustomerID eq 'ANATR' or Customer/CustomerID eq 'ALFKI') and ShippedDate lt datetime'1997-01-01T00:00:00'&$top=10&$expand=Customer&$select=OrderID,Customer/CustomerID,ShippedDate",
			"LINQ": "(from order in Orders where order.Customer.CustomerID  ==\"ANATR\" || order.Customer.CustomerID  ==\"ALFKI\"  where order.ShippedDate < DateTime.Parse(\"1997-01-01\") select new { order.OrderID, order.Customer.CustomerID, order.ShippedDate  }).Take(10)",
			"clauses": 
			{
				"_class": "Clauses",
				"clause": 
				{
					"_class": "Clause",
					"ignore": false,
					"optional": false,
					"propertyClause": 
					{
						"_class": "ObjectPropertyClause",
						"objectProperty": "<http://northwind.com/customer>",
						"objectPropertyFilters": 
						[
							"<http://northwind.com/Customer-ALFKI>",
							"northwind:Customer-ANATR"
						],

						"clauses": 
						{
							"_class": "Clauses",
							"clause": 
							{
								"_class": "Clause",
								"ignore": false,
								"optional": false,
								"propertyClause": 
								{
									"_class": "InverseObjectPropertyClause",
									"inverseObjectProperty": "<http://northwind.com/isEmployeeOf>"
								}
							}
						}
					}
				},

				"conjunctionClauses": 
				[
					{
						"_class": "ConjunctionClause",
						"conjunction": "and",
						"clause": 
						{
							"_class": "Clause",
							"ignore": false,
							"optional": false,
							"propertyClause": 
							{
								"_class": "DataPropertyClause",
								"dataProperty": "<http://northwind.com/shippedDate>",
								"filters": 
								{
									"_class": "Filters",
									"filter": 
									{
										"_class": "Filter",
										"condition": "<",
										"value": "1998-01-01",
										"datatype": "<http://www.w3.org/2001/XMLSchema#date>"
									}
								}
							}
						}
					}
				]
			}
		},

		{
			"_class": "Query",
			"name": "Test: Order query",
			"concept": "<http://northwind.com/Order>",
			"odataURL": "http://services.odata.org/V2/Northwind/Northwind.svc/Orders()?$filter=OrderID eq 10340 and (substringof('Fr',ShipCountry) or substringof('Ge',ShipCountry)) and ShippedDate lt datetime'1998-01-01T00:00:00' and (Customer/CustomerID eq 'BONAP' or Customer/CustomerID eq 'ALFKI') and substringof('Bon',Customer/CompanyName) and substringof('Leb',Customer/ContactName) and substringof('Nancy',Employee/FirstName)&$top=10&$expand=Customer,Employee&$select=OrderID,ShipCountry,ShippedDate,Customer/CustomerID,Customer/CompanyName,Customer/ContactName,Employee/EmployeeID,Employee/FirstName",
			"odata4URL": "http://services.odata.org/V4/Northwind/Northwind.svc/Orders()?$filter=OrderID eq 10340 and (contains(ShipCountry,'Fr') or contains(ShipCountry,'Ge')) and ShippedDate lt 1998-01-01T00:00:00Z and (Customer/CustomerID eq 'BONAP' or Customer/CustomerID eq 'ALFKI') and contains(Customer/CompanyName,'Bon') and contains(Customer/ContactName,'Leb') and contains(Employee/FirstName,'Nancy')&$top=10&$expand=Customer($select=CustomerID,ContactName),Employee($select=EmployeeID,FirstName)&$select=OrderID,ShipCountry,ShippedDate",
			"LINQ": "(from order in Orders 	where order.OrderID == 10340 where order.ShipCountry.Contains(\"Fr\")  || order.ShipCountry.Contains(\"Ge\") where order.ShippedDate < DateTime.Parse(\"1998-01-01\") where order.Customer.CustomerID  ==\"BONAP\" || order.Customer.CustomerID  ==\"ALFKI\"  where order.Customer.CompanyName.Contains(\"Bon\")	where order.Customer.ContactName.Contains(\"Leb\")	where order.Employee.FirstName.Contains(\"Nancy\")	select new { order.OrderID, 	order.ShipCountry,	order.ShippedDate,	order.Customer.CustomerID,order.Customer.CompanyName,	order.Customer.ContactName,	order.Employee.EmployeeID,	order.Employee.FirstName}).Take(10)			",
			"conceptFilters": 
			[
				"northwind:Order-10340"
			],

			"clauses": 
			{
				"_class": "Clauses",
				"clause": 
				{
					"_class": "Clause",
					"ignore": false,
					"optional": false,
					"label": "Shipped to Country",
					"propertyClause": 
					{
						"_class": "DataPropertyClause",
						"dataProperty": "<http://northwind.com/shipCountry>",
						"filters": 
						{
							"_class": "Filters",
							"filter": 
							{
								"_class": "Filter",
								"condition": "containing",
								"value": "Fr",
								"datatype": "<http://www.w3.org/2001/XMLSchema#string>"
							},

							"conjunctionFilters": 
							[
								{
									"_class": "ConjunctionFilter",
									"filterConjunction": "or",
									"filter": 
									{
										"_class": "Filter",
										"condition": "containing",
										"value": "Ge",
										"datatype": "<http://www.w3.org/2001/XMLSchema#string>"
									}
								}
							]
						}
					}
				},

				"conjunctionClauses": 
				[
					{
						"_class": "ConjunctionClause",
						"conjunction": "and",
						"clause": 
						{
							"_class": "Clause",
							"ignore": false,
							"optional": false,
							"propertyClause": 
							{
								"_class": "DataPropertyClause",
								"dataProperty": "<http://northwind.com/shippedDate>",
								"filters": 
								{
									"_class": "Filters",
									"filter": 
									{
										"_class": "Filter",
										"condition": "<",
										"value": "1998-01-01",
										"datatype": "<http://www.w3.org/2001/XMLSchema#date>"
									}
								}
							}
						}
					},

					{
						"_class": "ConjunctionClause",
						"conjunction": "and",
						"clause": 
						{
							"_class": "Clause",
							"ignore": false,
							"optional": false,
							"label": "Customer",
							"propertyClause": 
							{
								"_class": "ObjectPropertyClause",
								"objectProperty": "<http://northwind.com/customer>",
								"objectPropertyFilters": 
								[
									"<http://northwind.com/Customer-BONAP>",
									"northwind:Customer-ANATR"
								],

								"clauses": 
								{
									"_class": "Clauses",
									"clause": 
									{
										"_class": "Clause",
										"ignore": false,
										"optional": false,
										"propertyClause": 
										{
											"_class": "DataPropertyClause",
											"dataProperty": "<http://northwind.com/companyName>",
											"filters": 
											{
												"_class": "Filters",
												"filter": 
												{
													"_class": "Filter",
													"condition": "containing",
													"value": "Bon",
													"datatype": "<http://www.w3.org/2001/XMLSchema#string>"
												}
											}
										}
									},

									"conjunctionClauses": 
									[
										{
											"_class": "ConjunctionClause",
											"conjunction": "and",
											"clause": 
											{
												"_class": "Clause",
												"ignore": false,
												"optional": false,
												"label": "Contact name",
												"propertyClause": 
												{
													"_class": "DataPropertyClause",
													"dataProperty": "<http://northwind.com/contactName>",
													"filters": 
													{
														"_class": "Filters",
														"filter": 
														{
															"_class": "Filter",
															"condition": "containing",
															"value": "Leb",
															"datatype": "<http://www.w3.org/2001/XMLSchema#string>"
														}
													}
												}
											}
										}
									]
								}
							}
						}
					},

					{
						"_class": "ConjunctionClause",
						"conjunction": "and",
						"clause": 
						{
							"_class": "Clause",
							"ignore": false,
							"optional": true,
							"propertyClause": 
							{
								"_class": "ObjectPropertyClause",
								"objectProperty": "<http://northwind.com/employee>",
								"clauses": 
								{
									"_class": "Clauses",
									"clause": 
									{
										"_class": "Clause",
										"ignore": false,
										"optional": false,
										"propertyClause": 
										{
											"_class": "DataPropertyClause",
											"dataProperty": "<http://northwind.com/firstName>",
											"filters": 
											{
												"_class": "Filters",
												"filter": 
												{
													"_class": "Filter",
													"condition": "containing",
													"value": "Nancy",
													"datatype": "<http://www.w3.org/2001/XMLSchema#string>"
												}
											}
										}
									}
								}
							}
						}
					}
				]
			}
		},

		{
			"_class": "Query",
			"name": "Datastitching with operations",
			"concept": "qb:Observation",
			"clauses": 
			{
				"_class": "Clauses",
				"clause": 
				{
					"_class": "Clause",
					"ignore": false,
					"optional": false,
					"propertyClause": 
					{
						"_class": "ObjectPropertyClause",
						"objectProperty": "qb:dataset",
						"objectPropertyFilters": 
						[
							"DataSet:ZE015_designmatrix"
						]
					}
				},

				"conjunctionClauses": 
				[
					{
						"_class": "ConjunctionClause",
						"conjunction": "and",
						"clause": 
						{
							"_class": "Clause",
							"ignore": false,
							"optional": false,
							"propertyClause": 
							{
								"_class": "DataPropertyClause",
								"dataProperty": "computationalbiology:ecotype"
							}
						}
					},

					{
						"_class": "ConjunctionClause",
						"conjunction": "and",
						"clause": 
						{
							"_class": "Clause",
							"ignore": false,
							"optional": false,
							"propertyClause": 
							{
								"_class": "DataPropertyClause",
								"dataProperty": "computationalbiology:organism"
							}
						}
					},

					{
						"_class": "ConjunctionClause",
						"conjunction": "and",
						"clause": 
						{
							"_class": "Clause",
							"ignore": false,
							"optional": false,
							"propertyClause": 
							{
								"_class": "DataPropertyClause",
								"dataProperty": "computationalbiology:phenotype"
							}
						}
					},

					{
						"_class": "ConjunctionClause",
						"conjunction": "and",
						"clause": 
						{
							"_class": "Clause",
							"ignore": false,
							"optional": false,
							"propertyClause": 
							{
								"_class": "DataPropertyClause",
								"dataProperty": "computationalbiology:treatment"
							}
						}
					},

					{
						"_class": "ConjunctionClause",
						"conjunction": "and",
						"clause": 
						{
							"_class": "Clause",
							"ignore": false,
							"optional": false,
							"propertyClause": 
							{
								"_class": "OperationClause",
								"operation": "qb:linkToOtherDatasetObservations",
								"clauses": 
								{
									"_class": "Clauses",
									"clause": 
									{
										"_class": "Clause",
										"ignore": false,
										"optional": false,
										"propertyClause": 
										{
											"_class": "ObjectPropertyClause",
											"objectProperty": "qb:targetDataset",
											"objectPropertyFilters": 
											[
												"DataSet:rawZE015_fromRMA"
											]
										}
									},

									"conjunctionClauses": 
									[
										{
											"_class": "ConjunctionClause",
											"conjunction": "and",
											"clause": 
											{
												"_class": "Clause",
												"ignore": false,
												"optional": false,
												"propertyClause": 
												{
													"_class": "ObjectPropertyClause",
													"objectProperty": "qb:targetProperty",
													"objectPropertyFilters": 
													[
														"computationalbiology:sample"
													]
												}
											}
										},

										{
											"_class": "ConjunctionClause",
											"conjunction": "and",
											"clause": 
											{
												"_class": "Clause",
												"ignore": false,
												"optional": false,
												"propertyClause": 
												{
													"_class": "ObjectPropertyClause",
													"objectProperty": "qb:sourceProperty",
													"objectPropertyFilters": 
													[
														"computationalbiology:sample"
													]
												}
											}
										},

										{
											"_class": "ConjunctionClause",
											"conjunction": "and",
											"clause": 
											{
												"_class": "Clause",
												"ignore": false,
												"optional": false,
												"propertyClause": 
												{
													"_class": "DataPropertyClause",
													"dataProperty": "computationalbiology:log2p_value"
												}
											}
										},

										{
											"_class": "ConjunctionClause",
											"conjunction": "and",
											"clause": 
											{
												"_class": "Clause",
												"ignore": false,
												"optional": false,
												"propertyClause": 
												{
													"_class": "OperationClause",
													"operation": "qb:linkToOtherDatasetObservations",
													"clauses": 
													{
														"_class": "Clauses",
														"clause": 
														{
															"_class": "Clause",
															"ignore": false,
															"optional": false,
															"propertyClause": 
															{
																"_class": "ObjectPropertyClause",
																"objectProperty": "qb:targetDataset",
																"objectPropertyFilters": 
																[
																	"DataSet:SYNG007a_REF3_Probeset2GeneMapp "
																]
															}
														},

														"conjunctionClauses": 
														[
															{
																"_class": "ConjunctionClause",
																"conjunction": "and",
																"clause": 
																{
																	"_class": "Clause",
																	"ignore": false,
																	"optional": false,
																	"propertyClause": 
																	{
																		"_class": "ObjectPropertyClause",
																		"objectProperty": "qb:targetProperty",
																		"objectPropertyFilters": 
																		[
																			"computationalbiology:probeset"
																		]
																	}
																}
															},

															{
																"_class": "ConjunctionClause",
																"conjunction": "and",
																"clause": 
																{
																	"_class": "Clause",
																	"ignore": false,
																	"optional": false,
																	"propertyClause": 
																	{
																		"_class": "ObjectPropertyClause",
																		"objectProperty": "qb:sourceProperty",
																		"objectPropertyFilters": 
																		[
																			"computationalbiology:probeset"
																		]
																	}
																}
															},

															{
																"_class": "ConjunctionClause",
																"conjunction": "and",
																"clause": 
																{
																	"_class": "Clause",
																	"ignore": false,
																	"optional": false,
																	"propertyClause": 
																	{
																		"_class": "DataPropertyClause",
																		"dataProperty": "computationalbiology:uniprotId"
																	}
																}
															},

															{
																"_class": "ConjunctionClause",
																"conjunction": "and",
																"clause": 
																{
																	"_class": "Clause",
																	"ignore": false,
																	"optional": false,
																	"propertyClause": 
																	{
																		"_class": "OperationClause",
																		"operation": "qb:linkToOtherDatasetObservations",
																		"clauses": 
																		{
																			"_class": "Clauses",
																			"clause": 
																			{
																				"_class": "Clause",
																				"ignore": false,
																				"optional": false,
																				"propertyClause": 
																				{
																					"_class": "ObjectPropertyClause",
																					"objectProperty": "qb:targetDataset",
																					"objectPropertyFilters": 
																					[
																						"DataSet:ZB015_maize_ABAvC_RAWresults-for_BioXM-signif"
																					]
																				}
																			},

																			"conjunctionClauses": 
																			[
																				{
																					"_class": "ConjunctionClause",
																					"conjunction": "and",
																					"clause": 
																					{
																						"_class": "Clause",
																						"ignore": false,
																						"optional": false,
																						"propertyClause": 
																						{
																							"_class": "ObjectPropertyClause",
																							"objectProperty": "qb:targetProperty",
																							"objectPropertyFilters": 
																							[
																								"computationalbiology:probeset"
																							]
																						}
																					}
																				},

																				{
																					"_class": "ConjunctionClause",
																					"conjunction": "and",
																					"clause": 
																					{
																						"_class": "Clause",
																						"ignore": false,
																						"optional": false,
																						"propertyClause": 
																						{
																							"_class": "ObjectPropertyClause",
																							"objectProperty": "qb:sourceProperty",
																							"objectPropertyFilters": 
																							[
																								"computationalbiology:probeset"
																							]
																						}
																					}
																				},

																				{
																					"_class": "ConjunctionClause",
																					"conjunction": "and",
																					"clause": 
																					{
																						"_class": "Clause",
																						"ignore": false,
																						"optional": false,
																						"propertyClause": 
																						{
																							"_class": "DataPropertyClause",
																							"dataProperty": "computationalbiology:log2FC"
																						}
																					}
																				}
																			]
																		}
																	}
																}
															}
														]
													}
												}
											}
										}
									]
								}
							}
						}
					}
				]
			}
		}
	]
}