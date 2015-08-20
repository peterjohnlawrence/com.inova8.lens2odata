;(function ($, window) {

    //Ensure that global variables exist
    var EQ = window.EQ = window.EQ || {};

    var EqDataTable = function (data) {
        if (typeof data === 'string') {
            this.table = JSON.parse(data);
        }
        else {
            this.table = data;
        }
    };

    EqDataTable.prototype = {
        getNumberOfColumns: function () {
            return this.table.cols.length;
        },

        getColumnLabel: function (colIndex) {
            var col = colIndex < this.table.cols.length ? this.table.cols[colIndex] : null;
            return col ? col.label : null;
        },

        getColumnType: function (colIndex) {
            var col = colIndex < this.table.cols.length ? this.table.cols[colIndex] : null;
            return col ? col.type : null;
        },

        getNumberOfRows: function () {
            return this.table.rows.length;
        },

        getFormattedValue: function (rowIndex, colIndex) {
            var row = rowIndex < this.table.rows.length ? this.table.rows[rowIndex] : null;
            if (row) {
                var cell = colIndex < this.table.cols.length ? row.c[colIndex] : null;
                if (cell) {
                    if (typeof cell.f != 'undefined') {
                        return cell.f;
                    }

                    var v = cell.v;
                    if (typeof v != 'undefined' && v !== null) {                    
                        var colType = this.getColumnType(colIndex);
                        if (colType == 'date' || colType == 'datetime') {
                            dt = eval("new " + v);
                            if (colType == 'date') {
                                v = dt.toLocaleDateString();
                            }
                            else {
                                v = dt.toLocaleString();
                            }
                        }
                        else if (colType == 'timeofday') {
                            dt = new Date();
                            dt.setHours(v[0], v[1], v[2], v[3]);
                            v = dt.toLocaleTimeString();
                        }

                        return v;
                    }
                }
            }
            return null;
        }
    };

    var isGoogleVisualizationDefined =  function() {
        return (typeof google != 'undefined') && (typeof google.visualization != 'undefined');
    };

    var isGoogleChartDefined = function() {
        return isGoogleVisualizationDefined() && (typeof google.visualization.PieChart != 'undefined');
    };


    var getDataTableClass = function () {
        var result = EqDataTable;
        if (isGoogleVisualizationDefined()) {
            result = google.visualization.DataTable;
        }
        return result;
    };


    /// <namespace name="EQ.view" version="1.0.0">
    /// <summary>
    /// Contains different functions for managing core EasyQuery pages (views): process user input, render result set, etc.
    /// </summary>
    /// </namespace>
    EQ.view = {

        _resultPanel : null,

        _sqlPanel : null,

        _clearQueryButton : null,

        _loadQueryButton : null,

        _saveQueryButton : null,

        _executeQueryButton : null,  

        _exportButtons : null,

        _funcs: {},

        _findControlById: function (controlId) {
            var result = $("#" + controlId);
            if (result.length == 0)
                result = null;

            return result;
        }, 

        _syncActionAvailable: true,

        init: function (options) {
            options = options || window.easyQueryViewSettings || {};

            var resultPanelId = options.resultPanelId || "ResultPanel";
            this._resultPanel = this._findControlById(resultPanelId);

            var sqlPanelId = options.sqlPanelId || "SqlPanel";
            this._sqlPanel = this._findControlById(sqlPanelId);

            var clearQueryButtonId = options.clearQueryButtonId || "ClearQueryButton";
            this._clearQueryButton = this._findControlById(clearQueryButtonId);

            var loadQueryButtonId = options.loadQueryButtonId || "LoadQueryButton";
            this._loadQueryButton = this._findControlById(loadQueryButtonId);

            var saveQueryButtonId = options.saveQueryButtonId || "SaveQueryButton";
            this._saveQueryButton = this._findControlById(saveQueryButtonId);

            var executeQueryButtonId = options.executeQueryButtonId || "ExecuteQueryButton";
            this._executeQueryButton = this._findControlById(executeQueryButtonId );

            var exportButtonsId = options.exportButtonsId || "ResultExportButtons";
            this._exportButtons = this._findControlById(exportButtonsId );
            
            if (typeof(options.rebuildOnQueryChange) === "undefined")    
                options.rebuildOnQueryChange =  true;

            if (typeof (options.syncQueryOnChange) === "undefined")
                options.syncQueryOnChange = true;

            this.showChart = typeof(options.showChart) !== "undefined" ? options.showChart : true;

            var self = this;

            EQ.client.init();


            if (!this._funcs.clearButtonClick) {
                this._funcs.clearButtonClick = function () {
                    self._clearErrors();
                    if (self._exportButtons) {
                        self._exportButtons.hide();
                    }
                    self._clearSqlPanel();
                    EQ.client.clearQuery();
                };
            }


            //clear button
            if (this._clearQueryButton) {
                this._clearQueryButton.off("click", this._funcs.clearButtonClick);
                this._clearQueryButton.on("click", this._funcs.clearButtonClick);
            }


            if (!this._funcs.loadQueryButtonClick) {
                this._funcs.loadQueryButtonClick = function () {
                    EQ.client.loadQuery({
                        queryName: "LastQuery",
                        sucess: function (data) {

                            self._clearErrors();
                            self._clearResultPanel();
                            //buildQuery();
                        },
                        error: self._errorHandler
                    });
                };
            }

            // load query button
            if (this._loadQueryButton) {
                this._loadQueryButton.off("click", this._funcs.loadQueryButtonClick);
                this._loadQueryButton.on("click", this._funcs.loadQueryButtonClick);
            }


            if (!this._funcs.saveQueryButtonClick) {
                this._funcs.saveQueryButtonClick = function () {
                    var queryObj = EQ.client.getQuery();
                    var queryName = queryObj.name;
                    if (!queryName)
                        queryName = "LastQuery";

                    EQ.client.saveQuery({
                        "query": queryObj,
                        "queryName": queryName,
                        "success": function () {
                            window.alert("Query saved!");
                        },
                        error: self._errorHandler
                    });
                };
            }


            // save query button
            if (this._saveQueryButton) {
                this._saveQueryButton.off("click", this._funcs.saveQueryButtonClick);
                this._saveQueryButton.on("click", this._funcs.saveQueryButtonClick);
            }

            if (!this._funcs.executeQueryButtonClick) {
                this._funcs.executeQueryButtonClick = function () {
                    self.buildAndExecute();
                };
            }

            // execute sql button             
            if (this._executeQueryButton) {
                this._executeQueryButton.off("click", this._funcs.executeQueryButtonClick);
                this._executeQueryButton.on("click", this._funcs.executeQueryButtonClick);
            }


            if (!this._funcs.queryChangedHandler) {
                this._funcs.queryChangedHandler = function (params) {
                    self._clearSqlPanel();
                    self._clearResultPanel();
                    if (options.syncQueryOnChange && options.rebuildOnQueryChange) {
                        if (self._syncActionAvailable)
                            self.syncQuery();
                        else
                            self.buildQuery();
                    }
                };
            }

            
            EQ.client.queryChanged(this._funcs.queryChangedHandler);
        },

        _clearErrorsInPanel : function(panel) {
            if (panel) {
                if (panel.hasClass('error')) {
                    panel.removeClass('error');
                }
                panel.empty();
            }        
        },

        _clearErrors: function () {
            this._clearErrorsInPanel(this._resultPanel);
            this._clearErrorsInPanel(this._sqlPanel);
        },

        _clearSqlPanel: function () {
            if (this._sqlPanel) {
                this._sqlPanel.empty();
            }

        },

        _clearResultPanel: function () {
            if (this._resultPanel) {
                this._resultPanel.empty();
            }

            if (this._exportButtons) {
                this._exportButtons.hide();
            }

        },

        syncQuery: function () {
            var self = this;

            var sqlProgressIndicator = $('<div></div>', { 'class': 'result-panel loader' });
            var sqlPanel = self._sqlPanel;

            EQ.client.syncQuery({
                beforeSend: function () {
                    if (sqlPanel) {
                        sqlPanel.animate({ opacity: '0.5' }, 200);
                        sqlPanel.append(sqlProgressIndicator);
                    }
                },
                success: function (result) {
                    var sqlText = result.statement || "";
                    self.renderSqlStatement(sqlText);
                    sqlProgressIndicator.remove();
                },
                error: function (statusCode, errorMessage, operation) {
                    sqlProgressIndicator.remove();
                    if (statusCode == 404) {
                        self.buildQuery();
                        self._syncActionAvailable = false;
                    }
                }
            });
        },


        //deprecated
        buildQuery: function() {
            var self = this;
            var query = EQ.client.getQuery();

            var sqlProgressIndicator = $('<div></div>', { 'class': 'result-panel loader' });
            var sqlPanel = self._sqlPanel;

            EQ.client.buildQuery({
                "query": query,
                beforeSend: function () {
                    if (sqlPanel) {
                        sqlPanel.animate({ opacity: '0.5' }, 200);
                        sqlPanel.append(sqlProgressIndicator);
                    }
                },
                success: function (result) {
                    var sqlText = result.statement || "";
                    self.renderSqlStatement(sqlText);    
                    sqlProgressIndicator.remove();
                },
                error: function(statusCode, errorMessage, operation) {
                    sqlProgressIndicator.remove();
                    if (sqlPanel) {
                        sqlPanel.empty();
                        sqlPanel.animate({ 'opacity': 1 }, 200);
                        sqlPanel.addClass('error').append('<div>Error during ' + operation + ' request:  <div>' + errorMessage + '</div></div>');
                    }
                }
            });
        },

        renderSqlStatement: function(sql) {
            var sqlPanel = this._sqlPanel;
            if (sqlPanel) {
                this._clearErrorsInPanel(sqlPanel);
                sqlPanel.animate({ 'opacity': 1 }, 200);
                sqlPanel.html('<div class="sql-panel-result">' + sql ? sql.replace(/\r\n/g, "<br />").replace(/  /g, "&nbsp;&nbsp;") : "" + '</div>');
            }                

        },

        buildAndExecute:function () {
            var self = this;
            var query = EQ.client.getQuery();

            var resultProgressIndicator = $('<div></div>', { 'class': 'result-panel loader' });
            var resultPanel = self._resultPanel;
            EQ.client.buildAndExecute({
                "query": query,
                "options": {
                    "resultFormat": 1
                },
                beforeSend: function () {
                    if (resultPanel) {
                        resultPanel.animate({ opacity: '0.5' }, 200);
                        resultPanel.html(resultProgressIndicator);
                    }
                },
                success: function (result) {
                    try {
                        if (result.statement) {
                            self.renderSqlStatement(result.statement);    
                        }
                                
                        if (resultPanel) {
                            resultPanel.empty();
                            if (result.resultSet) {
                                
                                var grid;
                                if (result.resultSet.table) {
                                    //old format
                                    grid = self.renderGridOldStyle(result.resultSet.table);                                
                                }
                                else {
                                    var DataTable = getDataTableClass();

                                    // Create the data table.
                                    var dataTable = new DataTable(result.resultSet);
                                    //var myDataTable = new EqDataTable(result.resultSet);
                                    if (self.showChart) {
                                        var chartPanel = $("<div />").addClass("chart-panel").css({ "float": "right" }).appendTo(resultPanel);
                                        self.drawChart(dataTable, chartPanel.get(0));
                                    }

                                    grid = self.renderGridByDataTable(dataTable);
                                }

                                var gridPanel = $("<div />").addClass("grid-panel").appendTo(resultPanel);
                                gridPanel.append(grid).delay(100);

                                if (self._exportButtons) {
                                    self._exportButtons.show();
                                }

                                resultPanel.animate({ 'opacity': 1 }, 200);
                            }
                        }
                    }
                    finally {
                        resultProgressIndicator.remove();
                    }

                },
                error: function(statusCode, errorMessage, operation) {
                    resultProgressIndicator.remove();
                    if (resultPanel) {
                        resultPanel.empty();
                        resultPanel.animate({ 'opacity': 1 }, 200);
                        resultPanel.addClass('error').append('<div>Error during ' + operation + ' request:  <div>' + errorMessage + '</div></div>');
                    }
                }
            });
        },

        _prepareForChart: function(dataTable) {
            if (!isGoogleChartDefined()) return false;
            if (dataTable.getNumberOfColumns() < 2)  return false;
            if (dataTable.getColumnType(0) != "string") return false;
            if (dataTable.getColumnType(1) != "number") return false;

            return true;
        },

        drawChart: function (dataTable, chartPanel) {
            if (this._prepareForChart(dataTable)) {
                // Set chart options
                var options = { 'width': 300 };

                // Instantiate and draw our chart, passing in some options.
                var chart = new google.visualization.PieChart(chartPanel);
                chart.draw(dataTable, options);
            }
        },


        renderGridByDataTable: function (dataTable) {
            var tbl = $('<table></table>').css('width', '100%');

            var colCount = dataTable.getNumberOfColumns();
            for (var i = 0; i < colCount; i++) {
                var colLabel = dataTable.getColumnLabel(i);
                tbl.append('<th>' + colLabel + '</th>');
            }

            tbl.wrapInner('<tr class="result-grid-header"></tr>');
            var rowCount = dataTable.getNumberOfRows();
            for (i = 0; i < rowCount; i++) {
                var trbody = '';
                for (var j = 0; j < colCount; j++) {
                    var val = dataTable.getFormattedValue(i, j);
                    var td = '<td>' + val + '</td>';
                    trbody += td;
                }
                tbl.append('<tr>' + trbody + '</tr>');
            }

            return tbl;
        },


        renderGridOldStyle:function (resultSet) {
            var tbl = $('<table />').css('width', '100%');

            for (var i = 0; i < resultSet.cols.length; i++) {
                tbl.append('<th>' + resultSet.cols[i] + '</th>');
            }

            tbl.wrapInner('<tr class="result-grid-header"></tr>');
            for (i = 0; i < resultSet.rows.length; i++) {
                var trbody = '';
                var row = resultSet.rows[i];

                for (var j = 0; j < row.length; j++) {
                    trbody += '<td>' + row[j] + '</td>';
                }
                tbl.append('<tr>' + trbody + '</tr>');
            }
            return tbl;
        }

    }

    $(function () {
        EQ.view.init();
    });

})(jQuery, window);
