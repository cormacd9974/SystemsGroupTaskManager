import bcrypt from "bcryptjs";
import mongoose, {Schema} from "mongoose";

// Schema for storing user account information
const userSchema = new Schema(
    {
        // Basic profile fields
        name: {type:String, required: true},
        title: {type:String, required: true},

        // User role; defaults to regular user
        role: {type:String, required: "user"},

        // Unique email used for login
        email: {type:String, required: true, unique: true},

        // Hashed password
        password: {type:String, required: true},

        // Flag for admin access
        isAdmin: {type:Boolean, required: true, default: false},

        // References to tasks assigned to this user
        tasks: [{type: Schema.Types.ObjectId, ref: "Task"}],

        // Whether the account is active
        isActive: {type:Boolean, required: true, default: true},
    },
    {timestamps: true}
);

// Hash the password before saving if it has been modified
userSchema.pre("save", async function () {
    if(!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
});

// Compare entered password with the stored hashed password
userSchema.methods.matchPassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;