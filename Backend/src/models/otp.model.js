import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const OTPSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["EMAIL_VERIFICATION", "PASSWORD_RESET"],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

OTPSchema.pre("save", async function (next) {
  if (!this.isModified("otp")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
  } catch (error) {
    next(error);
  }
});

OTPSchema.methods.compareOTP = async function (candidateOTP) {
  return await bcrypt.compare(candidateOTP, this.otp);
};

OTPSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.model("OTP", OTPSchema);
