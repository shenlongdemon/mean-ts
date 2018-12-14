interface ErrorData {
  code: number;
  message: string;
}

const BUS_ERR_CODE = {
  WRONG_LOGIN: (): ErrorData => {
    return { code: 1000, message: 'Phone number or password is invalid.' };
  },
  HAVE_NO_PROCESS_STEP: (): ErrorData => {
    return { code: 1001, message: 'You did not create process on website yet. ' };
  },
  HAVE_NO_SERVICE: (): ErrorData => {
    return { code: 1002, message: 'Cannot identify service to process.' };
  }
};

export { BUS_ERR_CODE };
