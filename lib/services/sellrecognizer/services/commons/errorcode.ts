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
  },
  CANNOT_CREATE_GOODS: (): ErrorData => {
    return { code: 1007, message: 'Cannot create goods. Please try again' };
  },
  CANNOT_FOUND_GOODS: (): ErrorData => {
    return { code: 1008, message: 'Cannot identify goods' };
  },
  CANNOT_PUBLICH_SELL: (): ErrorData => {
    return { code: 1009, message: 'Cannot publish to sell. Please try again.' };
  },
  CANNOT_CANCEL_SELL: (): ErrorData => {
    return { code: 1010, message: 'Cannot cancel. Please try again.' };
  },
  CANNOT_SAVE: (): ErrorData => {
    return { code: 1011, message: 'Cannot save. Please try again.' };
  },
  ITEM_CANNOT_FOUND: (): ErrorData => {
    return { code: 1012, message: 'Item cannot be found.' };
  },
  BOUGHT_BY_OTHER: (): ErrorData => {
    return { code: 1012, message: 'Item is bought by other' };
  },
  ITEM_NOT_YOURS: (): ErrorData => {
    return { code: 1012, message: 'Item is not yours' };
  },
  
};

export { BUS_ERR_CODE };
