import {IObject} from "./iobject";
import {UserInfo} from "./userinfo";

export interface Section extends IObject{
  code: string;
  histories: UserInfo[];
}