export const mockAdapters = {
  auth: async () => ({ userId: "u-1", roles: ["end_user"], tokenExpiry: "2099-01-01T00:00:00Z" }),
  doctorHandoff: async () => ({ status: "accepted", doctorId: "doc-1" }),
  resultIngestion: async () => ({ resultId: "r-1", abnormalFlags: [] }),
  payment: async () => ({ orderId: "o-1", status: "paid" }),
};
