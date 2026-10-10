import { HTTP_STATUS } from "../constants/httpStatus.js";

export class ApiResponse {
  constructor(statusCode = HTTP_STATUS.OK, message = "success", data = null, meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  static send(res, { statusCode = HTTP_STATUS.OK, message = "success", data = null, meta } = {}) {
    const body = { success: true, message, data };
    if (meta) body.meta = meta;
    return res.status(statusCode).json(body);
  }
}
