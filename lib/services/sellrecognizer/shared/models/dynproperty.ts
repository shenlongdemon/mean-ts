import {IObject} from "./iobject";

export enum DynPropertyType {
  TEXT = 'TEXT',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  COMBOBOX = 'COMBOBOX'
}

export interface DynProperty extends IObject {
  type: DynPropertyType;
  title: string;
  value: string,
  items: string;
}

export {DynProperty, DynPropertyType};