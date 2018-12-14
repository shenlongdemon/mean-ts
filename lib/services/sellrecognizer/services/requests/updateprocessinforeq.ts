interface UpdateProcessField {
  id: string;
  value: string;
}

interface UpdateProcessInfoReq {
  materialId: string;
  processId: string;
  values: UpdateProcessField[];
}

export {UpdateProcessInfoReq, UpdateProcessField};
