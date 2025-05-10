import mongoose, { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
    },
    image: {
      type: Object,
    },
    address: {
      type: String,
    },
    type: {
      type: String,
      enum: ["jobSeeker", "company"],
      required: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "NotActive"],
      default: "Active",
    },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
    resetCode: {
      type: String,
    },
    resetCodeExpires: {
      type: Date,
    },

    // 🆕 السيرة الذاتية - مسار ملف PDF
    resume: {
      type: String, // مثال: "uploads/resumes/1682432035.pdf"
    },

    // 🆕 نص السيرة الذاتية المستخرج (اختياري)
    resumeText: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// شرط أنه يدخل اسم الشركة
userSchema.pre("save", function (next) {
  if (this.type === "company" && !this.companyName) {
    return next(new Error("Company name is required for company users"));
  }
  next();
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
