// s3.js
const AWS = require('aws-sdk');
const fs = require('fs');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Create an S3 instance
const s3 = new AWS.S3();

async function uploadFileToS3(file) {
    try
    {
        const fileContent = fs.readFileSync(file.path);
        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${Date.now()}_${file.originalname}`,
          Body: fileContent,
          ContentType: file.mimetype,
          ACL: 'public-read', 
        };
      
        const data = await s3.upload(params).promise();

        return data.Location; 
    }
    catch(e)
    {
        console.log("Error in s3 :",e)
        return '';
    }
}

module.exports = { uploadFileToS3 };
