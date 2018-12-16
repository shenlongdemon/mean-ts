import { Bluetooth, Category, Material, UserInfo} from "../../shared/models";

export interface CreateItemReq {
  name: string;
  price: number;
  description: string;
  category: Category;
  imageUrl: string;
  owner: UserInfo;
  bluetooth: Bluetooth | null;
  material: Material | null;
}