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
  },
  MATERIAL_CANNOT_FOUND: (): ErrorData => {
    return { code: 1003, message: 'Material cannot be found.' };
  },
  PROCESS_CANNOT_FOUND: (): ErrorData => {
    return { code: 1004, message: 'Process cannot be found.' };
  },
  WORKER_CANNOT_FOUND: (): ErrorData => {
    return { code: 1005, message: 'Cannot identify worker.' };
  },
  WORKER_HAD_ASSIGNED: (): ErrorData => {
    return { code: 1006, message: 'Worker had assigned.' };
  }
};

export { BUS_ERR_CODE };
