import {ProcessStep} from "./processstep";
import {User} from "./user";
import {Activity} from "./activity";

enum ProcessStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  DONE = 2
};

interface Process extends ProcessStep {
  code: string;
  status: ProcessStatus,
  workers: User[];
  activities: Activity[];
  updateAt: number;
}

export {Process, ProcessStatus};
