const s3Controller = require("./S3Controller");
const db = require('../database');


const uploadFile = (path, req, sql, callback) => {
    var jsonresponse = {};
    s3Controller.uploadFile(path, req.file, function (s3Uploaded) {
        if (s3Uploaded.Location)
            db.query(
                sql,
                [s3Uploaded.Location, req.params.id],
                (err, rows, fields) => {
                    if (err) {
                        console.log(err)
                        callback({
                            queryError: err
                        });
                    } else {
                        jsonresponse.file = [];
                        jsonresponse.file.push({ message: "File uploaded", URL: s3Uploaded.Location });
                        return callback(jsonresponse);
                    }
                }
            );
        else
            return callback({
                queryError: {
                    msg: 'Upload failed'
                }
            });
    });
};

module.exports = uploadFile