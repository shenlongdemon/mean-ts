import {ProcessStep} from "../../shared/models";

export interface SaveMaterialProcessReq {
  ownerId: string;
  processSteps: ProcessStep[];
}