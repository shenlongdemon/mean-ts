import { UserInfo } from '../shared/models/userinfo';

export class BaseService {
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

  protected getTime = (): number => {
    const d = new Date();
    const time = d.getTime();
    return time;
  };

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
      userInfo.position.coord.latitude +
      ',' +
      userInfo.position.coord.longitude +
      ' ' +
      userInfo.position.coord.altitude +
      ']' +
      '[' +
      userInfo.weather.main.temp +
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
          } catch (es) {}
        });
      } catch (e) {
        console.log('convertToNum Error ' + e);
      }
    });
    return code;
  };
}
