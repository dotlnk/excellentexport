/**
 * ExcellentExport 2.0.3
 * A client side Javascript export to Excel.
 *
 * @author: Jordi Burgos (jordiburgos@gmail.com)
 * @url: https://github.com/jmaister/excellentexport
 *
 */
/*jslint browser: true, bitwise: true, vars: true, white: true */
/*global define, exports, module */

(function (global) {
    'use strict';

    var ExcellentExport = (function () {

        function b64toBlob(b64Data, contentType, sliceSize) {
            // function taken from http://stackoverflow.com/a/16245768/2591950
            // author Jeremy Banks http://stackoverflow.com/users/1114/jeremy-banks
            contentType = contentType || '';
            sliceSize = sliceSize || 512;

            var byteCharacters = window.atob(b64Data);
            var byteArrays = [];

            var offset;
            for (offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                var i;
                for (i = 0; i < slice.length; i = i + 1) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new window.Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
            }

            var blob = new window.Blob(byteArrays, {
                type: contentType
            });
            return blob;
        }

        var version = "2.0.3";
        var uri = { excel: 'data:application/vnd.ms-excel;base64,', csv: 'data:application/csv;base64,' };
        var template = { excel: '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta name=ProgId content=Excel.Sheet> <meta name=Generator content="Microsoft Excel 11"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>' };
        var csvDelimiter = ",";
        var csvNewLine = "\r\n";
        var base64 = function (s) {
            return window.btoa(window.unescape(encodeURIComponent(s)));
        };
        var format = function (s, c) {
            return s.replace(new RegExp("{(\\w+)}", "g"), function (m, p) {
                return c[p];
            });
        };

        var get = function (element) {
            if (!element.nodeType) {
                return document.getElementById(element);
            }
            return element;
        };

        var fixCSVField = function (value) {
            var fixedValue = value;
            var addQuotes = (value.indexOf(csvDelimiter) !== -1) || (value.indexOf('\r') !== -1) || (value.indexOf('\n') !== -1);
            var replaceDoubleQuotes = (value.indexOf('"') !== -1);

            if (replaceDoubleQuotes) {
                fixedValue = fixedValue.replace(/"/g, '""');
            }
            if (addQuotes || replaceDoubleQuotes) {
                fixedValue = '"' + fixedValue + '"';
            }

            return fixedValue;
        };

        var tableToCSV = function (table) {
            var data = "";
            var i, j, row, col;
            for (i = 0; i < table.rows.length; i = i + 1) {
                row = table.rows[i];
                for (j = 0; j < row.cells.length; j = j + 1) {
                    col = row.cells[j];
                    data = data + (j ? csvDelimiter : '') + fixCSVField(col.textContent.trim());
                }
                data = data + csvNewLine;
            }
            return data;
        };

        function createDownloadLink(fileName, base64Data, exportType) {
            var blob;
            var anchor = document.createElement('a');
            anchor.innerHTML = fileName;
            anchor.download = fileName;
            if (window.navigator.msSaveBlob) {
                blob = b64toBlob(base64Data, exportType);
                window.navigator.msSaveBlob(blob, fileName);
            } else if (window.URL.createObjectURL) {
                blob = b64toBlob(base64Data, exportType);
                var blobUrl = window.URL.createObjectURL(blob);
                anchor.href = blobUrl;
            } else {
                var hrefvalue = "data:" + exportType + ";base64," + base64Data;
                anchor.download = fileName;
                anchor.href = hrefvalue;
            }
            document.body.appendChild(anchor);
            var evt = document.createEvent("MouseEvents");
            evt.initEvent("click", false, false);
            anchor.dispatchEvent(evt);
            document.body.removeChild(anchor);
        }

        var ee = {
            version: function () {
                return version;
            },
            excel: function (filename, sheetname, tableid) {
                var table = get(tableid);
                var ctx = { worksheet: sheetname || 'Worksheet', table: table.innerHTML };
                var b64 = base64(format(template.excel, ctx));
                createDownloadLink(filename + '.xls', b64, 'application/vnd.ms-excel');
            },
            csv: function (filename, tableid, delimiter, newLine) {
                if (delimiter !== undefined && delimiter) {
                    csvDelimiter = delimiter;
                }
                if (newLine !== undefined && newLine) {
                    csvNewLine = newLine;
                }

                var table = get(tableid);
                var csvData = "\uFEFF" + tableToCSV(table);
                var b64 = base64(csvData);
                createDownloadLink(filename + '.csv', b64, 'application/csv');
            }
        };

        return ee;
    }());

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return ExcellentExport; });
        // CommonJS and Node.js module support.
    } else if (typeof exports !== 'undefined') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = ExcellentExport;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.ExcellentExport = ExcellentExport;
    } else {
        global.ExcellentExport = ExcellentExport;
    }
})(this);
