import {UserInfo} from '../shared/models';
import {CONSTANTS} from "../../commons";

export class BaseService {
  
  constructor() {
  }
  
  protected STRS = [
    '0123456789',
    'abcdefghij',
    'klmnopqrs',
    'tuvwxyz',
    'ABCDEFGHIJ',
    'KLMNOPQRS',
    'TUVWXYZ',
    "-/ _+'.,;:",
    '[]{}'
  ];
  
  protected genUserInfoCode = (action: string, userInfo: UserInfo): string => {
    const allStr =
      '[' +
      action +
      ' ' +
      userInfo.time +
      ']' +
      '[' +
      userInfo.firstName +
      ' ' +
      userInfo.lastName +
      '][' +
      userInfo.state +
      '-' +
      userInfo.zipCode +
      '-' +
      userInfo.country +
      ']' +
      '[' +
      userInfo.position.latitude +
      ',' +
      userInfo.position.longitude +
      ' ' +
      userInfo.position.altitude +
      ']' +
      '[' +
      userInfo.weather.temp +
      'C]';
    const code = this.convertCodeToNum(allStr);
    return code;
  };
  
  protected convertCodeToNum = (codeStr: string): string => {
    let code = '';
    Array.from(codeStr).map((c, key) => {
      try {
        this.STRS.forEach((STR: string, index: number) => {
          try {
            const idx = STR.indexOf(c);
            if (idx > -1) {
              code += index + '' + idx;
            }
          } catch (es) {
          }
        });
      } catch (e) {
        console.log('convertToNum Error ' + e);
      }
    });
    return code;
  };
  protected convertCodeToDescription = (codeStr: string): string => {
    let description = "";
    let i = 0;
    try {
      for (i; i < codeStr.length / 2; i++) {
        const str = codeStr.substr(i * 2, 2);
        const idxStrs = parseInt(str.charAt(0));
        const idxStr = parseInt(str.charAt(1));
        description += this.STRS[idxStrs].charAt(idxStr);
      }
    }
    catch (e) {
    
    }
    return description;
  };
}
