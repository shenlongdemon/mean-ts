import {BaseRepo} from '../../../repositories/baserepo';
import UserRepo from './dbcontext/userrepo';
import MaterialRepo from './dbcontext/materialrepo';
import MaterialProcessRepo from './dbcontext/materialprocessrepo';
import CategoryRepo from './dbcontext/categoryrepo';
import ItemRepo from './dbcontext/itemrepo';

import {User, Material, MaterialProcess, Category, Item} from '../shared/models';
import materialrepo from "./dbcontext/materialrepo";

///<reference path="../services/sellrecognizer.ts"/>

class SellRecognizerRepo extends BaseRepo {
  
  getUserForLogin = async (phone: string, password: string): Promise<User | null> => {
    const res: User | null = await UserRepo.findOneBy({phone: phone, password: password});
    return res;
  };
  
  insertMaterial = async (material: Material): Promise<boolean> => {
    const res: boolean = await MaterialRepo.create(material);
    return res;
  };
  
  getMaterialProcessByOwnerId = async (ownerId: string): Promise<MaterialProcess | null> => {
    const res: MaterialProcess | null = await MaterialProcessRepo.findOneBy({ownerId: ownerId});
    return res;
  };
  
  getMaterialById = async (materialId: string): Promise<Material | null> => {
    const res: Material | null = await MaterialRepo.findOne(materialId);
    return res;
  }
  
  getMaterialByCode = async (code: string): Promise<Material | null> => {
    const res: Material | null = await MaterialRepo.findOneBy({
      code: code
    });
    return res;
  }
  
  updateMaterial = async (material: Material): Promise<boolean> => {
    const res: boolean = await MaterialRepo.update(material.id, material);
    return res;
  }
  
  getUserById = async (userId: string): Promise<User | null> => {
    const res: User | null = await UserRepo.findOne(userId);
    return res;
  }
  
  getMaterialsByOwnerId = async (id: string): Promise<Material[]> => {
    const res: Material[] = await MaterialRepo.find({'owner.id': id});
    return res;
  }
  
  updateMaterialProcess = async (materialProcess: MaterialProcess): Promise<boolean> => {
    const res: boolean = await MaterialProcessRepo.replace(materialProcess.id, materialProcess);
    return res;
  }
  
  insertMaterialProcess = async (materialProcess: MaterialProcess): Promise<boolean> => {
    const res: boolean = await MaterialProcessRepo.create(materialProcess);
    return res;
  }
  
  getCategories = async (): Promise<Category[]> => {
    const res: Category[] = await CategoryRepo.find({});
    return res;
  }
  
  createItem = async (item: Item): Promise<boolean> => {
    const res: boolean = await ItemRepo.create(item);
    return res;
  }
  
  getItembyId = async (id: string): Promise<Item | null> => {
    const res: Item | null = await ItemRepo.findOne(id);
    return res;
  }
  
  updateItem = async (item: Item): Promise<boolean> => {
    const res: boolean = await ItemRepo.update(item.id, item);
    return res;
  }
  
  getItemsByOwnerId = async (ownerId: string): Promise<Item[]> => {
    const res: Item[] = await ItemRepo.find({'owner.id': ownerId});
    return res;
  }
  
  getMaterialsByBluetoothIds = async (ids: string[]) : Promise<Material[]> => {
    const res: Material[] = await materialrepo.find({'bluetooth.id': { "$in": ids } });
    return res;
  }
}

export default new SellRecognizerRepo();
