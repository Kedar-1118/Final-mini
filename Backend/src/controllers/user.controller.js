import { AsyncHandler } from "../utils/wrapAsync.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
import { sendVerificationEmail } from "../utils/sendMail.js";
import mongoose from "mongoose";

const generateTokens = async (userID) => {
  try {
    const user = await User.findById(userID);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

export const registerUser = AsyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if ([email, password, name].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.is_email_verified === true) {
      throw new ApiError(409, "Email is already registered");
    } else {
      await User.deleteOne({ email });
    }
  }

  const newUser = new User({ email, password, name });

  const registeredUser = await newUser.save();

  if (!registeredUser) {
    throw new ApiError(500, "Error registering user");
  }

  console.log("Registered User:", registeredUser);
  //   console.log("Registered User:", registeredUser);

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  const otpRecord = new OTP({
    user_id: registeredUser._id,
    otp: otpCode,
    expires_at: otpExpiry,
    type: "EMAIL_VERIFICATION",
  });
  await otpRecord.save();

  await sendVerificationEmail(
    registeredUser.email,
    registeredUser.name,
    otpCode
  );

  res.status(201).json(
    new ApiResponse(
      201,
      {
        userId: registeredUser._id,
        email: registeredUser.email,
      },
      "User registered successfully"
    )
  );
});

export const verifyEmail = AsyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  if ([userId, otp].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "User ID and OTP are required");
  }
  const otpRecord = await OTP.findOne({
    user_id: new mongoose.Types.ObjectId(userId),
    type: "EMAIL_VERIFICATION",
  });
  console.log("OTP Record:", otpRecord);
  console.log("Provided OTP:", otp);
  if (!otpRecord) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // Check if OTP has expired
  if (new Date() > otpRecord.expires_at) {
    await OTP.deleteMany({
      user_id: new mongoose.Types.ObjectId(userId),
      type: "EMAIL_VERIFICATION",
    });
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  const isOTPValid = await otpRecord.compareOTP(otp);
  console.log("Plain text OTP matches:", otpRecord.otpnum === otp);
  console.log("Bcrypt OTP validation result:", isOTPValid);
  if (!isOTPValid) {
    throw new ApiError(400, "Invalid OTP");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  user.is_email_verified = true;
  await user.save();
  await OTP.deleteMany({
    user_id: new mongoose.Types.ObjectId(userId),
    type: "EMAIL_VERIFICATION",
  });

  // Generate tokens and log the user in
  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken -__v -createdAt -updatedAt -is_email_verified"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedUser, accessToken },
        "Email verified successfully"
      )
    );
});

export const resendVerificationOTP = AsyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.is_email_verified) {
    throw new ApiError(400, "Email already verified");
  }

  await OTP.deleteMany({
    user_id: new mongoose.Types.ObjectId(user._id),
    type: "EMAIL_VERIFICATION",
  });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const otpRecord = new OTP({
    user_id: user._id,
    otp: otpCode,
    expires_at: otpExpiry,
    type: "EMAIL_VERIFICATION",
    otpnum: `${otpCode}`,
  });
  await otpRecord.save();

  await sendVerificationEmail(user.email, user.name, otpCode);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { email: user.email },
        "Verification OTP resent successfully"
      )
    );
});

export const loginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.is_email_verified === false) {
    throw new ApiError(403, "Email is not verified");
  }

  const isPasswordValid = await user.verifyPassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken -__v -createdAt -updatedAt -is_email_verified"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedUser, accessToken },
        "User logged in successfully"
      )
    );
});

export const logoutUser = AsyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const getCurrentUser = AsyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

export const updateAccountDetails = AsyncHandler(async (req, res) => {
  const { name, email, instaUsername } = req.body;

  if (!name && !email && !instaUsername) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const user = await User.findById(req.user?._id);

  if (name) user.name = name;
  if (email) user.email = email;
  if (instaUsername) user.instaUsername = instaUsername;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

export const forgotPassword = AsyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  // Clean up existing OTPs of this type
  await OTP.deleteMany({
    user_id: user._id,
    type: "PASSWORD_RESET",
  });

  const otpRecord = new OTP({
    user_id: user._id,
    otp: otpCode,
    expires_at: otpExpiry,
    type: "PASSWORD_RESET",
    otpnum: `${otpCode}`,
  });
  await otpRecord.save();

  await sendVerificationEmail(user.email, user.name, otpCode);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset OTP sent to email"));
});

export const resetPassword = AsyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if ([email, otp, newPassword].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otpRecord = await OTP.findOne({
    user_id: user._id,
    type: "PASSWORD_RESET",
  });

  if (!otpRecord) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // Check if OTP has expired
  if (new Date() > otpRecord.expires_at) {
    await OTP.deleteMany({
      user_id: user._id,
      type: "PASSWORD_RESET",
    });
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  const isOTPValid = await otpRecord.compareOTP(otp);
  if (!isOTPValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  await OTP.deleteMany({
    user_id: user._id,
    type: "PASSWORD_RESET",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset successfully"));
});
