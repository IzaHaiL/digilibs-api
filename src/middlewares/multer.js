const multer = require('multer');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3'); // Tambahkan DeleteObjectCommand
const s3Client = require('./config'); // Adjust the path based on your setup
const { config } = require('dotenv');
const { nanoid } = require('nanoid');
config();

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type, only PDFs are allowed!'), false);
    }
    const maxSize = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSize) {
      return cb(new Error('File size exceeds the limit (2MB)'), false);
    }
    cb(null, true);
  }
});

const uploadFileToSpace = async (fileBuffer, originalName, prefix) => {
  // Generate file name with format berkas-randomid(timestapm)+originalname tanpa spasi
  const randomId = nanoid(10);
  const timestamp = Date.now();
  const sanitizedFileName = `berkas-${randomId}${timestamp}${originalName.replace(/\s+/g, '')}`;

  const params = {
    Bucket: process.env.SPACES_BUCKET,
    Key: 'documents/' + prefix + '/' + sanitizedFileName, // Adjust the folder structure as needed
    Body: fileBuffer,
    ACL: 'public-read', // or 'private' based on your requirements
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    const location = `https://${params.Bucket}.${process.env.SPACES_REGION}.digitaloceanspaces.com/${params.Key}`;
    return location;
  } catch (err) {
    console.error(err);
    console.error(err.stack);
    throw new Error('Failed to upload file to space');
  }
};

const deleteFileFromSpace = async (fileName, prefix) => {
  const params = {
    Bucket: process.env.SPACES_BUCKET,
    Key: "documents/" + prefix + "/" + fileName, // Sesuaikan folder structure
  };

  try {
    const data = await s3Client.send(new DeleteObjectCommand(params));
    return data;
  } catch (err) {
    console.error(err);
    throw new Error("Gagal menghapus file dari space");
  }
};

module.exports = { upload, uploadFileToSpace ,deleteFileFromSpace};
