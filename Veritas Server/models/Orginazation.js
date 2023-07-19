import mongoose from "mongoose";
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { authRole } from "../utils/authRole.js";

const OrginazationSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    mailingAddress: {
      type: String,
      trim: true,
    },

    physicalAddress: {
      country: String,
      state: String,
      city: String,
    },
    orginazationType: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      trim: true,
      maxLength: [1000, "About field can not be more than 500 chars long"],
    },
    headline: {
      type: String,
      trim: true,
      maxLength: [250, "Headline can not be more than 250 chars"],
    },
    coverPhoto: {
      secureUrl: String,
      photoId: String,
    },
    photo: {
      secureUrl: String,
      photoId: String,
    },
    role: {
      type: String,
      enum: Object.values(authRole),
      default: authRole.ORGINAZATION,
    },
    owner: {
      name: String,
      email: String,
      phoneNumber: String,
      title: String,
    },
    businessInformation: {
      businessId: String,
      businessName: String,
      businessEmail: String,
      businessTitle: String,
      businessPhoneNumber: String,
    },
    author: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

OrginazationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  this.password = await bcryptjs.hash(this.password, 10);
  return next();
});

OrginazationSchema.methods = {
  generateJwtToken: function () {
    const token = jwt.sign({ id: this._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE,
    });
    return token;
  },

  comparePassword: async function (plainPassword) {
    return await bcryptjs.compare(plainPassword, this.password);
  },
};

export default mongoose.model("Orginazation", OrginazationSchema);
