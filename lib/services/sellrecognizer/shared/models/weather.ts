import { IObject } from './iobject';

interface WeatherMain {
  temp: number;
}

interface WeatherSys {
  country: string;
}

export interface Weather extends IObject {
  main: WeatherMain;
  sys: WeatherSys;
}
