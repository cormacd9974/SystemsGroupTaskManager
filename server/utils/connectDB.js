import mongoose from "mongoose";

// Connect the application to MongoDB
export const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database Connected");
    } catch(error) {
            console.log("DB Error:" + error);
        }
};