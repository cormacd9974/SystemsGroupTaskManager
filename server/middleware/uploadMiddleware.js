import multer from "multer";
import path from "path";

// Configure where uploaded files should be stored and how they should be named
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        // Use a timestamp to generate a unique filename
        const unique = Date.now().toString();
        
        cb(null, unique + path.extname(file.originalname));
    },
});

// Restrict uploads to allowed file types only
const fileFilter = ( req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xlsx|csv|txt/;
    const ext = allowed.test(path.extname(file.originalname).toLocaleLowerCase());
    ext ? cb(null, true) : cb(new Error("File type not supported"));
}

// Export multer upload middleware with size limit
export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024}});