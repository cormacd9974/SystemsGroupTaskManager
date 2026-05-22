import mongoose, {Schema} from "mongoose";

// Schema for storing notifications/notices sent to team members
const noticeSchema = new Schema(
    {
        // Users who should receive the notification
        team: [{type: Schema.Types.ObjectId, ref: "User"}],

        // Notification message text
        text: {type: String},

        // Related task reference
        task: {type: Schema.Types.ObjectId, ref: "Task"},

        // Type of notification: alert or message
        notiType: { type:String, default: "alert", enum: ["alert", "message"] },

        // Users who have already read the notice
        isRead: [{type: Schema.Types.ObjectId, ref: "User"}],
    },
    {timestamps: true}
);

const Notice = mongoose.model("Notice", noticeSchema);
export default Notice;