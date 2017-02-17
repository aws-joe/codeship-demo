console.log('Loading event');
const url = require('url');
var fs = require('fs');
var request = require('request').defaults({ encoding: null });
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
//Update with s3 bucket name below
var srcBucket = "<<Bucket Name>>";

exports.handler = function(event, context, callback) {
  console.log("Twilio Request: "+JSON.stringify(event));
  if (event) {
    callback(null, "Message Contents with: "+JSON.stringify(event));
    if(event.image) {
        console.log("Processing MMS Message");
        console.log("Image: "+event.image);
        var uri=event.image;
        var urlParts = url.parse(uri, true);
        var urlPartsPath = urlParts.path;
        var pathParts = urlPartsPath.split("/");
        var fileBase = pathParts[pathParts.length-1];
        var imageType = event.mediaType;
        
        if(imageType.toString().trim() === "image/jpeg") {
            var fileName = fileBase+".jpg";
        } else {
            var fileName = fileBase+".png";
        }
        request(uri, function (errorMms, respMms, bodyMms) {
            if (errorMms) {
                console.log(errorMms);
            } else if (respMms.statusCode != 200) {
                console.log(bodyMms);
            } else {
                var s3Params = {
                    Bucket: s3Bucket,
                    Key: fileName,
                    ACL: 'public-read',
                    Body: bodyMms
                };
                
                s3.putObject(s3Params, function(err, putData) {
                    if (err) console.log(err, err.stack);
                    else     console.log(putData);
                });
            }
        });
    } else {
        callback(null, "Text Message Contents with: "+JSON.stringify(event));
    }
    
  } else {
    callback(null, "No Message Contents");
  }
};

