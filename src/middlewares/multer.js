const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: multerStorage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ["pdf"];
    const ext = file.originalname.split(".").pop().toLowerCase();

    if (allowedTypes.includes(ext)) {
      const maxSize = 10 * 1024 * 1024; // Set the size limit to 10MB for PDFs
      if (file.size > maxSize) {
        const error = new Error("PDF file size exceeds the limit (10MB)");
        error.code = "LIMIT_FILE_SIZE";
        return cb(error, false);
      }
      cb(null, true);
    } else {
      const error = new Error("Invalid file type. Only PDF files are allowed");
      error.code = "LIMIT_FILE_TYPES";
      return cb(error, false);
    }
  },
}).array('berkas_finalprojects', 10); // Adjust the field name and max count as needed

module.exports = { upload };
