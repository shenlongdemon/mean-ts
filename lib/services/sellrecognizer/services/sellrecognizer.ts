import {BaseService} from './baseservice';
import {
  AddActivityReq,
  AssignWorkerReq,
  CreateMaterialReq,
  LoginReq,
  UpdateProcessField,
  UpdateProcessInfoReq,
  DoneProcessReq,
  SaveMaterialProcessReq
} from './requests';
import sellRepo from '../repositories/sellrecognizerrepo';
import {BusErr} from '../../models/buserr';
import {CONSTANTS, DateUtil} from '../../commons';
import {BUS_ERR_CODE} from './commons/errorcode';
import {DynProperty, Material, MaterialProcess, Process, ProcessStatus, ProcessStep, User, Category} from "../shared/models";

const uuid = require('uuid');

class SellRecognizer extends BaseService {
  
  constructor() {
    super();
  }
  
  login = async (req: LoginReq): Promise<User> => {
    const user: User | null = await sellRepo.getUserForLogin(req.phone, req.password);
    if (!user) {
      throw new BusErr(BUS_ERR_CODE.WRONG_LOGIN());
    }
    return user;
  };
  
  createMaterial = async (req: CreateMaterialReq): Promise<Material> => {
    const materialProcess: MaterialProcess | null = await sellRepo.getMaterialProcessByOwnerId(req.ownerId);
    if (!materialProcess) {
      throw new BusErr(BUS_ERR_CODE.HAVE_NO_PROCESS_STEP());
    }
    
    const processes: Process[] = materialProcess.processSteps.map((processStep: ProcessStep, index: number) => {
      processStep.dynProperties.forEach((dynProperty: DynProperty, index: number): void => {
        dynProperty.value = CONSTANTS.STR_EMPTY;
      });
      const process: Process = {
        ...processStep,
        status: ProcessStatus.TODO,
        activities: [],
        workers: []
      };
      return process;
    });
    
    const entity: Material = {
      ...req,
      id: uuid.v4(),
      createdAt: DateUtil.getTime(),
      updatedAt: DateUtil.getTime(),
      code: this.genUserInfoCode('OWNER ' + req.name, req.userInfo),
      processes: processes
    };
    
    const res: boolean = await sellRepo.insertMaterial(entity);
    return entity;
  };
  
  updateProcessInfo = async (req: UpdateProcessInfoReq): Promise<boolean> => {
    const data: { material: Material, process: Process } = await this.getMaterial_Process(req.materialId, req.processId);
    
    data.process.dynProperties.forEach((p: DynProperty): void => {
      const field: UpdateProcessField | undefined = req.values.find((v: UpdateProcessField): boolean => {
        return v.id === p.id;
      });
      if (field) {
        p.value = field.value;
      }
    });
    
    const res: boolean = await sellRepo.updateMaterial(data.material);
    return res;
    
  }
  
  assignWorker = async (req: AssignWorkerReq): Promise<boolean> => {
    const user: User | null = await sellRepo.getUserById(req.userId);
    if (!user) {
      throw new BusErr(BUS_ERR_CODE.WORKER_CANNOT_FOUND())
    }
    const data: { material: Material, process: Process } = await this.getMaterial_Process(req.materialId, req.processId);
    
    const worker: User | undefined = data.process.workers.find((w: User): boolean => {
      return w.id === req.userId;
    });
    if (worker) {
      throw new BusErr(BUS_ERR_CODE.WORKER_HAD_ASSIGNED())
    }
    data.process.workers.push(user);
    
    const res: boolean = await sellRepo.updateMaterial(data.material);
    return res;
  }
  
  addActivity = async (req: AddActivityReq): Promise<boolean> => {
    const data: { material: Material, process: Process } = await this.getMaterial_Process(req.materialId, req.processId);
    data.process.activities.push(req.activity);
    data.process.status = ProcessStatus.IN_PROGRESS;
    const res: boolean = await sellRepo.updateMaterial(data.material);
    return res;
    
  }
  
  doneProcess = async (req: DoneProcessReq): Promise<boolean> => {
    const data: { material: Material, process: Process } = await this.getMaterial_Process(req.materialId, req.processId);
    data.process.status = ProcessStatus.DONE;
    
    const code: string = this.genUserInfoCode(`[DONE ${data.material.name}]`, req.userInfo);
    data.material.code = code;
    data.material.updatedAt = DateUtil.getTime();
    const res: boolean = await sellRepo.updateMaterial(data.material);
    return res;
    
  }
  
  getMaterialById = async (req: { id: string }): Promise<Material> => {
    const material: Material = await this.getMaterial(req.id);
    return material;
  }
  
  getMaterialsByOwnerId = async (req: { id: string }): Promise<Material[]> => {
    const materials: Material[] = await sellRepo.getMaterialsByOwnerId(req.id);
    return materials;
  }
  
  getMaterialProcessByOwnerId = async (req: {id: string}): Promise<MaterialProcess | null> => {
    const materialProcess: MaterialProcess | null = await sellRepo.getMaterialProcessByOwnerId(req.id);
    return materialProcess;
  }
  
  saveMaterialProcess = async (req: SaveMaterialProcessReq): Promise<boolean | null> => {
    let materialProcess: MaterialProcess | null = await sellRepo.getMaterialProcessByOwnerId(req.ownerId);
    if (materialProcess) {
      console.log('MaterialProcess is exists');
      materialProcess.processSteps = req.processSteps;
      const res: boolean = await sellRepo.updateMaterialProcess(materialProcess);
      return res;
    }
    else {
      console.log('MaterialProcess is new');
  
      materialProcess = {
        ...req,
        id: uuid.v4()
      };
      const res: boolean = await sellRepo.insertMaterialProcess(materialProcess);
      return res;
    }
  }
  
  getCategories = async (): Promise<Category[]> => {
    const categories: Category[] = await sellRepo.getCategories();
    return categories;
  }
  
  private getMaterial = async (id: string): Promise<Material> => {
    const material: Material | null = await sellRepo.getMaterialById(id);
    if (!material) {
      throw new BusErr(BUS_ERR_CODE.MATERIAL_CANNOT_FOUND())
    }
    return material;
  }
  
  private getMaterial_Process = async (materialId: string, processId: string): Promise<{ material: Material, process: Process }> => {
    const material: Material = await this.getMaterial(materialId);
    const process: Process | undefined = material.processes.find((p: Process): boolean => {
      return p.id === processId;
    });
    
    if (!process) {
      throw new BusErr(BUS_ERR_CODE.PROCESS_CANNOT_FOUND())
    }
    return {material, process};
  }
}

export default new SellRecognizer();
