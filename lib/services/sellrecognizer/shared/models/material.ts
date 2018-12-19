import {IObject} from "./iobject";
import {UserInfo} from "./userinfo";
import {Process} from "./process";
import {Bluetooth} from "./bluetooth";

export interface Material extends IObject {
  name: string;
  description: string;
  code: string;
  bluetooth: Bluetooth | null;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
  owner: UserInfo;
  processes: Process[];
}
