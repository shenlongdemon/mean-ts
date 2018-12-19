import {IObject} from "./iobject";
import {Category} from "./category";
import {Activity} from "./activity";
import {Material} from "./material";
import {UserInfo} from "./userinfo";
import {Bluetooth} from "./bluetooth";
import {Transaction} from "./transaction";

export interface Item extends IObject{
  name: string;
  price: number;
  description: string;
  category: Category;
  imageUrl: string;
  sellCode: string;
  buyerCode: string;
  transactions: Transaction[];
  owner: UserInfo;
  buyer: UserInfo | null;
  bluetooth: Bluetooth | null;
  view3d: string;
  material: Material | null;
  time: number;
  maintains: Activity[];
}