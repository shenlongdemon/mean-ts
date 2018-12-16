import {IObject} from "./iobject";
import {Category} from "./category";
import {Activity} from "./activity";
import {Material} from "./material";
import {UserInfo} from "./userinfo";
import {Bluetooth} from "./bluetooth";
import {Section} from "./section";

export interface Item extends IObject{
  name: string;
  price: string;
  description: string;
  category: Category;
  imageUrl: string;
  sellCode: string;
  buyerCode: string;
  section: Section;
  owner: UserInfo;
  buyer: UserInfo | null;
  bluetooth: Bluetooth | null;
  view3d: string;
  material: Material | null;
  time: number;
  maintains: Activity[];
}