interface ErrorData {
  code: number;
  message: string;
}

const SYSTEM_ERR_CODE = {
  HAVE_NO_SERVICE: (): ErrorData => {
    return { code: -1000, message: 'Cannot identify service to process.' };
  }
};

export { SYSTEM_ERR_CODE };
