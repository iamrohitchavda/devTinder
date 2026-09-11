import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { PASSWORD_MESSAGE, PASSWORD_OPTIONS } from "../constants/auth.js";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    url: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isURL(value, { require_protocol: true })) {
          throw new Error("Project URL must be valid");
        }
      },
    },
  },
  { _id: false },
);

const profilePromptSchema = new mongoose.Schema(
  {
    promptId: {
      type: String,
      required: true,
      enum: ["build", "debug", "learn"],
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address");
        }
      }
    },
    password: {
      type: String,
      required: true,
      select: false,
      validate(value) {
        if (!validator.isStrongPassword(value, PASSWORD_OPTIONS)) {
          throw new Error(PASSWORD_MESSAGE);
        }
      }
    },
    age: {
      type: Number,
      validate(value) {
        if (typeof value !== "number") {
          throw new Error("Age must be a number");
        }
      }
    },
    gender: {
      type: String,
      validate(value) {
        const allowedGenders = ["male", "female", "other"];
        if (value && !allowedGenders.includes(value.toLowerCase())) {
          throw new Error("Gender must be 'male', 'female', or 'other'");
        }
      }
    },
    photoUrl: {
      type: String,
      default:
        "https://images.unsplash.com/vector-1742875355318-00d715aec3e8?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      validate(value) {
        if (value && !validator.isURL(value)) {
          throw new Error("Invalid URL for photo");
        }
      }
    },
    skills: {
      type: [String],
      default: [],
      maxlength: 10,
      validate(value) {
        if (value.length > 10) {
          throw new Error("A maximum of 10 skills are allowed");
        }
      }
    },
    bio: {
      type: String,
      maxlength: 500,
      validate(value) {
        if (value.length > 500) {
          throw new Error("Bio cannot exceed 500 characters");
        }
      }
    },
    githubUrl: {
      type: String,
      default: "",
      trim: true,
      validate(value) {
        if (value && !validator.isURL(value, { require_protocol: true })) {
          throw new Error("Invalid GitHub URL");
        }
      }
    },
    portfolioUrl: {
      type: String,
      default: "",
      trim: true,
      validate(value) {
        if (value && !validator.isURL(value, { require_protocol: true })) {
          throw new Error("Invalid portfolio URL");
        }
      }
    },
    projects: {
      type: [projectSchema],
      default: [],
      validate(value) {
        if (value.length > 3) {
          throw new Error("A maximum of 3 featured projects are allowed");
        }
      }
    },
    collaborationRoles: {
      type: [String],
      enum: ["frontend", "backend", "fullstack", "design", "product", "mentor"],
      default: [],
      maxlength: 3
    },
    availability: {
      type: [String],
      enum: ["hackathon", "open-source", "mentoring", "side-project"],
      default: [],
      maxlength: 4
    },
    profilePrompts: {
      type: [profilePromptSchema],
      default: [],
      validate(value) {
        if (value.length > 3) {
          throw new Error("A maximum of 3 profile prompts are allowed");
        }
        if (new Set(value.map(({ promptId }) => promptId)).size !== value.length) {
          throw new Error("Each profile prompt can only be answered once");
        }
      }
    }
  },
  { timestamps: true }
);

// Password hashes must never be serialized into API responses.
userSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    delete returnedObject.password;
    return returnedObject;
  },
});

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });
  return token;
};

userSchema.methods.comparePassword = async function (passwordByUser) {
  try {
    const user = this;
    return await bcrypt.compare(passwordByUser, user.password);
  } catch (err) {
    throw new Error("Invalid password");
  }
};

const User = mongoose.model("User", userSchema);
export default User;
