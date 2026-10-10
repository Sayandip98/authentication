import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const formatSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  authProvider: user.authProvider,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "All fields are required");
  }

  if (password.length < 6) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Password must be at least 6 characters");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "User already exists");
  }

  let avatar = "";
  let avatarPublicId = "";

  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.buffer, "auth/avatars");
    avatar = uploadResult.secure_url;
    avatarPublicId = uploadResult.public_id;
  }

  const user = new User({
    name: name.trim(),
    email: normalizedEmail,
    password,
    avatar,
    avatarPublicId,
    authProvider: "local",
  });

  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  const accessToken = generateAccessToken(user._id);

  return res
    .status(HTTP_STATUS.CREATED)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        HTTP_STATUS.CREATED,
        "User registered successfully",
        { user: formatSafeUser(user) }
      )
    );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "All fields are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  if (user.authProvider === "google" && !user.password) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "This account is linked with Google. Please use Google Sign In");
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid password");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  return res
    .status(HTTP_STATUS.OK)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        "User logged in successfully",
        { user: formatSafeUser(user) }
      )
    );
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: "" } });

  return res
    .status(HTTP_STATUS.OK)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(HTTP_STATUS.OK, "User logged out successfully", null));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized - No refresh token provided");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid or expired refresh token");
  }

  const user = await User.findById(decodedToken.id).select("+refreshToken");

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token");
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);
  user.refreshToken = newRefreshToken;
  await user.save();

  return res
    .status(HTTP_STATUS.OK)
    .cookie("accessToken", newAccessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        "Token refreshed successfully",
        { accessToken: newAccessToken }
      )
    );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, "User fetched successfully", {
      user: formatSafeUser(req.user),
    })
  );
});

export const googleAuthCallback = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Google authentication failed");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions);

  return res.redirect(process.env.CORS_ORIGIN || "http://localhost:5173");
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Current and new password are required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "New password must be at least 6 characters");
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user.password) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "This account does not have a local password set. Use Google Sign In.");
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Current password does not match");
  }

  user.password = newPassword;
  await user.save();

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, "Password changed successfully", null)
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;

  if (!name?.trim() && !avatar?.trim()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Please provide at least one field to update");
  }

  const updates = {};
  if (name?.trim()) updates.name = name.trim();
  if (avatar?.trim()) updates.avatar = avatar.trim();

  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, "Profile updated successfully", {
      user: formatSafeUser(user),
    })
  );
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Email is required");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

  if (!user) {
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, "If that email exists, a password reset link has been sent.", null)
    );
  }

  if (user.authProvider === "google" && !user.password) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "This account is registered via Google Sign In and has no password.");
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CORS_ORIGIN || "http://localhost:5173"}/reset-password/${resetToken}`;
  const message = `You requested a password reset. Please click the link below to set a new password:\n\n${resetUrl}\n\nThis link is valid for 15 minutes. If you did not request this, please ignore this email.`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: message,
    });

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, "Password reset link sent to your email", null)
    );
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Email could not be sent. Please try again later.");
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Password must be at least 6 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Reset token is invalid or has expired");
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  if (user.authProvider === "google") {
    user.authProvider = "both";
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  return res
    .status(HTTP_STATUS.OK)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        "Password has been reset successfully",
        { user: formatSafeUser(user) }
      )
    );
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Please upload an avatar image file");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  // Delete previous Cloudinary image if it exists
  if (user.avatarPublicId) {
    await deleteFromCloudinary(user.avatarPublicId);
  }

  // Upload memory buffer to Cloudinary
  const uploadResult = await uploadOnCloudinary(req.file.buffer, "auth/avatars");

  user.avatar = uploadResult.secure_url;
  user.avatarPublicId = uploadResult.public_id;
  await user.save();

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, "Avatar updated successfully", {
      user: formatSafeUser(user),
    })
  );
});

export const removeAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  if (user.avatarPublicId) {
    await deleteFromCloudinary(user.avatarPublicId);
  }

  user.avatar = "";
  user.avatarPublicId = "";
  await user.save();

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, "Avatar removed successfully", {
      user: formatSafeUser(user),
    })
  );
});

