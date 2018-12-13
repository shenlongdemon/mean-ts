export class BusErr extends Error {
  code: number;
  message: string;
  data: any | null;

  constructor(error: { code: number; message: string }, data: any | null = null) {
    super(error.message);
    this.code = error.code;
    this.message = error.message;
    this.data = null;
  }
}
