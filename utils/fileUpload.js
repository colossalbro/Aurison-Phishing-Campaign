import multer from "multer";

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      // Use a callback function to set the filename
      cb(null, file.originalname);
    }
});

export const FileUpload = multer({ 
    dest: "uploads/",
    storage : storage
});
