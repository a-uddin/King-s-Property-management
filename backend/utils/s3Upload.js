const {
    S3Client,
    PutObjectCommand,
  } = require("@aws-sdk/client-s3");
  const { v4: uuidv4 } = require("uuid");
  const path = require("path");
  require("dotenv").config();
  
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  
  const uploadToS3 = async (fileBuffer, originalName, mimetype) => {
    const extension = path.extname(originalName);
    const fileName = `invoices/${uuidv4()}${extension}`;
  
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimetype,
      
    });
  
    await s3.send(command);
  
    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    return { url, fileName };
  };
  
  module.exports = uploadToS3;
  