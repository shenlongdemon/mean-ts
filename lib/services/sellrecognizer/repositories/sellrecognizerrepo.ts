import { BaseRepo } from '../../../repositories/baserepo';
import UserRepo from './dbcontext/userrepo';
import MaterialRepo from './dbcontext/materialrepo';
import ProcessStepRepo from './dbcontext/processstepsrepo';
import { User } from '../shared/models/user';
import { Material } from '../shared/models/material';
import { ProcessStep } from '../shared/models/processstep';

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

  getProcessStep = async (ownerId: string): Promise<ProcessStep | null> => {
    const entity: ProcessStep | null = await ProcessStepRepo.findOneBy({ ownerId: ownerId });
    return entity;
  };
}

export default new SellRecognizerRepo();
