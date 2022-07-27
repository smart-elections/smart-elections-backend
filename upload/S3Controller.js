const S3 = require("../aws/S3Config");

// Enter the name of the bucket that you have created here
const BUCKET_NAME = "election-candidate-images";

const uploadFile = (path, file, callback) => {
    if (file) {
        let params = {
            Bucket: BUCKET_NAME,
            Key: `${path}${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read",
        };

        S3.upload(params, function (err, data) {
            if (err) {
                console.log(err);
                return callback({
                    Location: null,
                });
            } else {
                return callback({
                    Location: data.Location,
                });
            }
        });
    } else {
        return callback({
            Location: null,
        });
    }
};

module.exports = { uploadFile }
