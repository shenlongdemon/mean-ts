export class DateUtil {
  static getTime = (): number => {
    const d = new Date();
    const time = d.getTime();
    return time;
  }
}