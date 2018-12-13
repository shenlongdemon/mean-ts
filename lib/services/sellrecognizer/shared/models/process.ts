import {ProcessStep} from "./processstep";
import {User} from "./user";
import {Activity} from "./activity";

export interface Process extends ProcessStep{
  workers: User[];
  activities: Activity[];
}
