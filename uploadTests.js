var AWS = require('aws-sdk');
var config = require('config.json');

var testsPath = process.argv[2];

if (testsPath == undefined) {
  console.log("Usage: node uploadTests.js path_to_tests.zip")
  return;
}

var deviceFarm = new AWS.DeviceFarm();

AWS.config.update({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey
});

var createUploadParams = {
  name: testsPath,
  projectArn: config.projectArn,
  type: 'CALABASH_TEST_PACKAGE'
}

var createUploadCallback = function(err, data) {
  if (err)
    console.log(err, err.stack);
  else
    console.log(data);
}


deviceFarm.createUpload(createUploadParams, createUploadCallback);
