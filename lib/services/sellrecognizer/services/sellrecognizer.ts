import {BaseService} from './baseservice';
import {CreateMaterialReq, LoginReq} from './requests';
import sellRepo from '../repositories/sellrecognizerrepo';
import {BusErr} from '../../models/buserr';
import {BUS_ERR_CODE} from '../../commons/index';
import {User} from "../shared/models/user";
import {ProcessStep} from "../shared/models/processstep";
import {Material} from "../shared/models/material";

const uuid = require('uuid');

class SellRecognizer extends BaseService {
  
  login = async (req: LoginReq): Promise<User> => {
    const user: User | null = await sellRepo.getUserForLogin(req.phone, req.password);
    if (!user) {
      throw new BusErr(BUS_ERR_CODE.WRONG_LOGIN());
    }
    return user;
  };
  
  createMaterial = async (req: CreateMaterialReq): Promise<Material> => {
    const processStep: ProcessStep | null = await sellRepo.getProcessStep(req.ownerId);
    if (!processStep) {
      throw new BusErr(BUS_ERR_CODE.HAVE_NO_PROCESS_STEP());
    }
    
    const entity: Material = {
      ...req,
      id: uuid.v4(),
      createdAt: this.getTime(),
      updatedAt: this.getTime(),
      code: this.genUserInfoCode('OWNER ' + req.name, req.userInfo)
    };
    
    const res: boolean = await sellRepo.insertMaterial(entity);
    if (!res) {
      throw new BusErr(BUS_ERR_CODE.HAVE_NO_PROCESS_STEP());
    }
    
    return entity;
  };
}

export default new SellRecognizer();
