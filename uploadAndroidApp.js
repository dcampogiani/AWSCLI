var AWS = require('aws-sdk');
var config = require('config.json');

var deviceFarm = new AWS.DeviceFarm();

var createUploadParams = {
  name: 'STRING_VALUE',
  projectArn: config.projectArn,
  type: 'ANDROID_APP'
}

var createUploadCallback = function(err, data) {

}


deviceFarm.createUpload(createUploadParams, createUploadCallback);
