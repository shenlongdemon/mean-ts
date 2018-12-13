import {IObject} from "./iobject";
import {UserInfo} from "./userinfo";
import {ProcessStep} from "./processstep";
import {Process} from "./process";

export interface Material extends IObject{
  name: string;
  ownerId: string;
  description: string;
  code: string;
  bluetooth: string;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
  userInfo: UserInfo;
  processes: Process[];
}
