var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var _a;
import { DataGridPro, GridToolbar, LicenseInfo, } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { useStudioNode } from '@mui/studio-core';
import { debounce } from '@mui/material';
const LICENSE = (_a = window === null || window === void 0 ? void 0 : window.document.querySelector('meta[name=x-data-grid-pro-license]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content');
if (LICENSE) {
    LicenseInfo.setLicenseKey(LICENSE);
}
const EMPTY_COLUMNS = [];
const EMPTY_ROWS = [];
const DataGridComponent = React.forwardRef(function DataGridComponent(_a, ref) {
    var { dataQuery, columns: columnsProp, rows: rowsProp } = _a, props = __rest(_a, ["dataQuery", "columns", "rows"]);
    const studioNode = useStudioNode();
    const handleResize = React.useMemo(() => debounce((params) => {
        if (!studioNode) {
            return;
        }
        studioNode.setProp('columns', (columns) => columns.map((column) => column.field === params.colDef.field ? Object.assign(Object.assign({}, column), { width: params.width }) : column));
    }, 500), [studioNode]);
    React.useEffect(() => handleResize.clear(), [handleResize]);
    const handleColumnOrderChange = React.useMemo(() => debounce((params) => {
        if (!studioNode) {
            return;
        }
        studioNode.setProp('columns', (columns) => {
            const old = columns.find((colDef) => colDef.field === params.field);
            if (!old) {
                return columns;
            }
            const withoutOld = columns.filter((column) => column.field !== params.field);
            return [
                ...withoutOld.slice(0, params.targetIndex),
                old,
                ...withoutOld.slice(params.targetIndex),
            ];
        });
    }, 500), [studioNode]);
    React.useEffect(() => handleColumnOrderChange.clear(), [handleColumnOrderChange]);
    const _b = dataQuery || {}, { rows: dataQueryRows } = _b, dataQueryRest = __rest(_b, ["rows"]);
    const columns = columnsProp || EMPTY_COLUMNS;
    const rows = rowsProp || dataQueryRows || EMPTY_ROWS;
    return (React.createElement("div", { ref: ref, style: { height: 350, width: '100%' } },
        React.createElement(DataGridPro, Object.assign({ components: { Toolbar: GridToolbar }, onColumnResize: handleResize, onColumnOrderChange: handleColumnOrderChange, rows: rows, columns: columns }, dataQueryRest, props))));
});
export default DataGridComponent;
