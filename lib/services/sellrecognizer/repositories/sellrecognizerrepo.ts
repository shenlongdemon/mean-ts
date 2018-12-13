import { BaseRepo } from '../../../repositories/baserepo';
import UserRepo from './dbcontext/userrepo';
import MaterialRepo from './dbcontext/materialrepo';
import MaterialProcessRepo from './dbcontext/materialprocessrepo';
import { User, Material, MaterialProcess } from '../shared/models';

///<reference path="../services/sellrecognizer.ts"/>

class SellRecognizerRepo extends BaseRepo {
  
  getUserForLogin = async (phone: string, password: string): Promise<User | null> => {
    const entity: User | null = await UserRepo.findOneBy({ phone: phone, password: password });
    return entity;
  };

  insertMaterial = async (material: Material): Promise<boolean> => {
    const res: boolean = await MaterialRepo.create(material);
    return res;
  };

  getMaterialProcess = async (ownerId: string): Promise<MaterialProcess | null> => {
    const entity: MaterialProcess | null = await MaterialProcessRepo.findOneBy({ ownerId: ownerId });
    return entity;
  };
}

export default new SellRecognizerRepo();
