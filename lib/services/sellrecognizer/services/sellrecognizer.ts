import {BaseService} from './baseservice';
import {CreateMaterialReq, LoginReq} from './requests';
import sellRepo from '../repositories/sellrecognizerrepo';
import {BusErr} from '../../models/buserr';
import {BUS_ERR_CODE} from '../../commons/index';
import {User, ProcessStep, Material, MaterialProcess, Process} from "../shared/models";

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
    const materialProcess: MaterialProcess | null = await sellRepo.getMaterialProcess(req.ownerId);
    if (!materialProcess) {
      throw new BusErr(BUS_ERR_CODE.HAVE_NO_PROCESS_STEP());
    }
    
    const processes: Process[] = materialProcess.processSteps.map((processStep: ProcessStep, index: number) => {
      const process: Process = {
        ...processStep,
        activities: [],
        workers: []
      };
      return process;
    });
    
    const entity: Material = {
      ...req,
      id: uuid.v4(),
      createdAt: this.getTime(),
      updatedAt: this.getTime(),
      code: this.genUserInfoCode('OWNER ' + req.name, req.userInfo),
      processes: processes
    };
    
    const res: boolean = await sellRepo.insertMaterial(entity);
    return entity;
  };
}

export default new SellRecognizer();
