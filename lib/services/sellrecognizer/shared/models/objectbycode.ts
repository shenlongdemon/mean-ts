export enum ObjectType {
  unknown = 0,
  material = 1,
  product = 2,
  user = 3,
  bluetooth = 4
}

export interface ObjectByCode {
  item: any | null;
  type: ObjectType;
}