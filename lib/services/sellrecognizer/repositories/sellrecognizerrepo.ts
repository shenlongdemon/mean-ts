import {BaseRepo} from '../../../repositories/baserepo';
import UserRepo from './dbcontext/userrepo';
import MaterialRepo from './dbcontext/materialrepo';
import MaterialProcessRepo from './dbcontext/materialprocessrepo';
import CategoryRepo from './dbcontext/categoryrepo';
import ItemRepo from './dbcontext/itemrepo';

import {User, Material, MaterialProcess, Category, Item} from '../shared/models';
import materialrepo from "./dbcontext/materialrepo";
import {CONSTANTS} from "../../commons";
import itemrepo from "./dbcontext/itemrepo";

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
  };
  
  getMaterialByCode = async (code: string): Promise<Material | null> => {
    const res: Material | null = await MaterialRepo.findOneBy({
      code: code
    });
    return res;
  };
  
  updateMaterial = async (material: Material): Promise<boolean> => {
    const res: boolean = await MaterialRepo.update(material.id, material);
    return res;
  };
  
  getUserById = async (userId: string): Promise<User | null> => {
    const res: User | null = await UserRepo.findOne(userId);
    return res;
  };
  
  getMaterialsByOwnerId = async (id: string): Promise<Material[]> => {
    const orQ: any[] = [
      {'owner.id': id},
      {
        'processes.workers.id': id
      }
    ];
    const res: Material[] = await MaterialRepo.find({$or: orQ});
    return res;
  };
  
  updateMaterialProcess = async (materialProcess: MaterialProcess): Promise<boolean> => {
    const res: boolean = await MaterialProcessRepo.replace(materialProcess.id, materialProcess);
    return res;
  };
  
  insertMaterialProcess = async (materialProcess: MaterialProcess): Promise<boolean> => {
    const res: boolean = await MaterialProcessRepo.create(materialProcess);
    return res;
  };
  
  getCategories = async (): Promise<Category[]> => {
    const res: Category[] = await CategoryRepo.find({});
    return res;
  };
  
  createItem = async (item: Item): Promise<boolean> => {
    const res: boolean = await ItemRepo.create(item);
    return res;
  };
  
  getItembyId = async (id: string): Promise<Item | null> => {
    return ItemRepo.findOne(id);
  };
  
  getItemByCode = async (code: string): Promise<Item | null> => {
    
    const query: any[] = [
      {id: code},
      {code: code},
      {sellCode: code},
    
    ];
    return ItemRepo.findOneBy({$or: query});
  };
  
  updateItem = async (item: Item): Promise<boolean> => {
    return ItemRepo.update(item.id, item);
  };
  
  getItemsByOwnerId = async (ownerId: string): Promise<Item[]> => {
    const query: any[] = [
      {'owner.id': ownerId},
      {
        $and: [
          {buyer: {$ne: null}},
          {'buyer.id': ownerId}
        ]
      }
    ];
    
    return ItemRepo.find({$or: query});
    
    
    // const res: Item[] = await ItemRepo.find({'owner.id': ownerId});
    // return res;
  };
  
  getMaterialsByBluetoothIds = async (ids: string[]): Promise<Material[]> => {
    const res: Material[] = await materialrepo.find({'bluetooth.id': {"$in": ids}});
    return res;
  };
  
  getItemsByBluetoothIds = async (ids: string[]): Promise<Item[]> => {
    const query: any[] = [
      {'bluetooth.id': {"$in": ids}},
      {'bluetooth.mac': {"$in": ids}},
      {'bluetooth.proximityUUID': {"$in": ids}}
    ];
    const res: Item[] = await itemrepo.find({$or: query});
    return res;
  };
  
  getPublishItems = async (categoryId: string | null | undefined): Promise<Item[]> => {
    const query: any[] = [
      {$where: 'this.sellCode.length > 0'},
      {buyer: {$eq: null}}
    ];
    if (categoryId && categoryId !== CONSTANTS.STR_EMPTY) {
      query.push({'category.id': categoryId});
    }
    
    return ItemRepo.find({$and: query});
  }
  
  getActivityInMaintain = async (itemId: string, activityId: string): Promise<Item | null> => {
    const query: any[] = [
      {id: itemId},
      {
        $or: [
          {'maintains.id': activityId},
          {'material.processes.activities.id': activityId}
        ]
      }
    
    ];
    return ItemRepo.findOneBy({$and: query});
  };
  
  getActivityInMaterial = async (materialId: string, processId: string, activityId: string): Promise<Material | null> => {
    const query: any[] = [
      {id: materialId},
      {'processes.id': processId},
      {'processes.activities.id': activityId}
    ];
    return MaterialRepo.findOneBy({$and: query});
  };
}

export default new SellRecognizerRepo();
