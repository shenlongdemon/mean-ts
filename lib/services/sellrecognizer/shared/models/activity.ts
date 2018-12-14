import { IObject } from "./iobject";
import {UserInfo} from "./userinfo";

export interface Activity extends IObject {
  title: string;
  description: string;
  time: number;
  image: string;
  file: string;
  userInfo: UserInfo;
}
