import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const unique = Date.now().toString();
        cb(null, unique + path.extname(file.originalname));
    },
});
const fileFilter = ( req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xlsx|csv|txt/;
    const ext = allowed.test(path.extname(file.originalname).toLocaleLowerCase());
    ext ? cb(null, true) : cb(new Error("File type not supported"));
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024}});