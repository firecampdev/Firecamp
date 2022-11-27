import { ReactNode } from 'react';

/** Table options */
export interface ITableOptions {
  /** disabled column's keys. One can not edit within the column included in to disabledColumns */
  disabledColumns?: Array<string>;

  /** a boolean value whether allow to remove row or not */
  allowRowRemove?: boolean;

  /** a boolean value whether allow to add new row or not */
  allowRowAdd?: boolean;

  /** a boolean value whether allow to sort rows or not */
  allowSort?: boolean;

  /** Table view/ mode language */
  mode?: string | { key: string; value: string };

  language?: string;
}

export interface ITable<R> {
  rows?: R[];
  columns: Array<IColumn>;
  renderColumn: (column: IColumn) => string | JSX.Element;
  renderCell: TRenderCell<R>;
  onChange: (rows: R[]) => void;
  defaultRow?: R;
  //@deprecated
  onMount?: (tableApi: TTableApi) => void;
  showDefaultEmptyRows?: boolean;
  options?: ITableOptions;
}

export interface IRow<R> {
  index: number;
  columns: IColumn[];
  row: R;
  tableApi?: TTableApi;
  options?: ITableOptions;
  renderCell: TRenderCell<R>;
  onChangeCell: TOnChangeCell;
  handleDrag: (row: R, index?: number) => void;
  handleDrop: (row: R) => any;
}
export interface IColumn {
  id: string;
  name: string;
  key: string;
  width?: string;
  fixedWidth?: boolean;
  resizeWithContainer?: boolean;
}

export type TTHead = {
  children: ReactNode;
  className?: string;
  style?: TPlainObject;
};
export type TTBody = {
  children: ReactNode;
  className?: string;
  style?: TPlainObject;
};
export type TTr = {
  children: ReactNode;
  className?: string;
  style?: TPlainObject;
};
export type TTh = {
  children: ReactNode;
  className?: string;
  style?: TPlainObject;
  additionalProp?: TPlainObject;
};
export type TTd<R> = {
  row: R;
  handleDrop: (row: R) => void;
  children: ReactNode;
  className?: string;
  style?: TPlainObject;
  options?: ITableOptions;
};

export type TPlainObject = { [K: string]: any };
export type TsORn = string | number;

export type TRenderCell<R> = (
  column: IColumn,
  cellValue: any,
  index: number,
  row: R,
  tableApi: TTableApi,
  onChange: (ck: string, cv: any, e?: any) => void,
  handleDrag: (row: R) => void,
  options?: ITableOptions
) => ReactNode;
export type TOnChangeCell = (
  cellKey: string,
  cellValue: any,
  rowId: string,
  e: any
) => void;
export type TTableApi<R = any> = {
  initialize: Function; //(rows: R[]) => void;
  getRows: () => R[];
  addRow: () => void;
  setRow: (row: R) => void;
  removeRow: (rowId: TsORn) => void;
};

type ITableRowValue = {
  key: string;
  value: string;
  description: string;
  disable?: boolean;
};
export type ITableRows = Array<ITableRowValue>;
