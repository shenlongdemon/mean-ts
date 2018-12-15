import {BaseRepo} from '../../../repositories/baserepo';
import UserRepo from './dbcontext/userrepo';
import MaterialRepo from './dbcontext/materialrepo';
import MaterialProcessRepo from './dbcontext/materialprocessrepo';
import CategoryRepo from './dbcontext/categoryrepo';

import {User, Material, MaterialProcess, Category} from '../shared/models';

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
  
  updateMaterial = async (material: Material): Promise<boolean> => {
    const res: boolean = await MaterialRepo.update(material.id, material);
    return res;
  }
  
  getUserById = async (userId: string): Promise<User | null> => {
    const res: User | null = await UserRepo.findOne(userId);
    return res;
  }
  
  getMaterialsByOwnerId = async (id: string): Promise<Material[]> => {
    const res: Material[] = await MaterialRepo.find({ownerId: id});
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
    const categories: Category[] = await CategoryRepo.find({});
    return categories;
  }
}

export default new SellRecognizerRepo();
