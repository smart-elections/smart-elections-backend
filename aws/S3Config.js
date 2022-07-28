const AWS = require("aws-sdk");

// Enter copied or downloaded access ID and secret key here
const ID = process.env.AWS_ID;
const SECRET = "NpCzmvj+Q/4HxmOCgM/aClcoiZFmmgWE4kHDEbSi";

// Initializing S3 Interface
const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});

module.exports = s3 