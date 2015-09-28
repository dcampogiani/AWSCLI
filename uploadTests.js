var AWS = require('aws-sdk');
var wget = require('wget');
var config = require('config.json');

var deviceFarm = new AWS.DeviceFarm();

var createUploadParams = {
  name: 'STRING_VALUE',
  projectArn: config.projectArn,
  type: 'CALABASH_TEST_PACKAGE'
}

var createUploadCallback = function(err, data) {

}


deviceFarm.createUpload(createUploadParams, createUploadCallback);
