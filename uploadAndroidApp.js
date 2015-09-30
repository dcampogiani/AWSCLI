var AWS = require('aws-sdk');
var config = require('./config.json');

var apkPath = process.argv[2];

if (apkPath == undefined) {
  console.log("Usage: node uploadAndroidApp.js path_to_app.apk")
  return;
}

var deviceFarm = new AWS.DeviceFarm();

AWS.config.update({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey
});

var createUploadParams = {
  name: apkPath,
  projectArn: config.projectArn,
  type: 'ANDROID_APP'
}

var createUploadCallback = function(err, data) {
  if (err)
    console.log(err, err.stack);
  else
    console.log(data);
}

var request = deviceFarm.createUpload(createUploadParams, createUploadCallback);
