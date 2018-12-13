import {IObject} from "./iobject";

export interface Material extends IObject{
  name: string;
  ownerId: string;
  description: string;
  code: string;
  bluetooth: string;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
}
