import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { User } from "../models/user.model.js";

export const protect = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.get("Authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized - No token provided");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken.id);

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "User not found or token invalid");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message =
      error.name === "TokenExpiredError"
        ? "Access token has expired"
        : "Invalid access token";

    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }
});
