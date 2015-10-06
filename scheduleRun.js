var AWS = require('aws-sdk');
var request = require('request');
var fs = require('fs');
var http = require('http');
var config = require('./config.json');

//Globar variables, I'm going to hell
var appArn;
var testArn;
var projectArn;
var devicePoolArn;

var runTypeCalabash = 'CALABASH';
var runName = getDateTime();
var uploadTypeCalabash = 'CALABASH_TEST_PACKAGE';
var uploadTypeAndroid = 'ANDROID_APP';

var parameters = {};

function getDateTime() {
  var date = new Date();
  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;
  var min = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;
  var sec = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;
  var day = date.getDate();
  day = (day < 10 ? "0" : "") + day;
  return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

var intiParameters = function() {
  var options = require('node-getopt').create([
    ['', 'AWSAccessKeyId=ARG', 'AWS AccessKeyId'],
    ['', 'AWSSecretAccessKey=ARG', 'AWS SecretAccessKey'],
    ['', 'AWSRegion=ARG', 'AWS region'],
    ['', 'AppApk=ARG', 'App apk'],
    ['', 'TestsZip=ARG', 'Tests zip'],
    ['h', 'help', 'display this help'],
  ]).bindHelp().parseSystem().options;
  parameters.AWSAccessKeyId = options.AWSAccessKeyId;
  parameters.AWSSecretAccessKey = options.AWSSecretAccessKey;
  parameters.AWSRegion = options.AWSRegion;
  parameters.AppApk = options.AppApk;
  parameters.TestsZip = options.TestsZip;
  if (parameters.AWSAccessKeyId == undefined)
    parameters.AWSAccessKeyId = config.aws.accessKeyId;
  if (parameters.AWSSecretAccessKey == undefined)
    parameters.AWSSecretAccessKey = config.aws.secretAccessKey;
  if (parameters.AWSRegion == undefined)
    parameters.AWSRegion = config.aws.region;
  if (parameters.AppApk == undefined)
    parameters.AppApk = 'app.apk';
  if (parameters.AppApk.indexOf(".apk") == -1)
    parameters.AppApk = parameters.AppApk + '.apk';
  if (parameters.TestsZip == undefined)
    parameters.TestsZip = 'tests.zip';
  if (parameters.TestsZip.indexOf(".zip") == -1)
    parameters.TestsZip = parameters.output + '.zip';
};

var createUpload = function(projectArn, name, type, contentType, callback) {
  deviceFarm.createUpload({
    name: name,
    projectArn: projectArn,
    type: type,
    contentType: contentType
  }, callback);
};

var uploadFile = function(file, url, contentType, callback) {

  fs.readFile(file, function(err, data) {
    if (err)
      throw err;

    request.put({
      uri: url,
      method: "PUT",
      headers: {
        'Content-Type': contentType
      },
      body: data
    }, callback);
  });
};

var scheduleRun = function() {

  var params = {
    appArn: appArn,
    devicePoolArn: devicePoolArn,
    projectArn: projectArn,
    test: {
      type: runTypeCalabash,
      testPackageArn: testArn
    },
    name: runName
  };

  deviceFarm.scheduleRun(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else console.log(data);
  });
};


var putTestCallback = function(err, httpResponse, body) {
  if (err)
    console.log(err, err.stack);
  else {
    deviceFarm.listDevicePools({
      arn: projectArn
    }, function(err, data) {
      if (err)
        console.log(err, err.stack);
      else {
        devicePoolArn = data.devicePools[0].arn;
        scheduleRun();
      }
    });
  }
};

var createUploadTestCallback = function(err, data) {
  if (err)
    console.log(err, err.stack);
  else {
    var whereToPut = data.upload.url;
    var contentType = data.upload.contentType;
    testArn = data.upload.arn;
    uploadFile('./' + parameters.TestsZip, whereToPut, contentType, putTestCallback);
  }
};

var putApkCallback = function(err, httpResponse, body) {
  if (err)
    console.log(err, err.stack);
  else {
    createUpload(projectArn, parameters.TestsZip, uploadTypeCalabash, 'application/octet-stream', createUploadTestCallback);
  }
};

var createUploadAPKCallback = function(err, data) {
  if (err)
    console.log(err, err.stack);
  else {
    var whereToPut = data.upload.url;
    var contentType = data.upload.contentType;
    appArn = data.upload.arn;
    uploadFile('./' + parameters.AppApk, whereToPut, contentType, putApkCallback);
  }
};

var listProjectsCallback = function(err, data) {
  if (err)
    console.log(err, err.stack);
  else {
    projectArn = data.projects[0].arn;
    createUpload(projectArn, parameters.AppApk, uploadTypeAndroid, 'application/octet-stream', createUploadAPKCallback);
  }
};

intiParameters();
var deviceFarm = new AWS.DeviceFarm({
  accessKeyId: parameters.AWSAccessKeyId,
  secretAccessKey: parameters.AWSSecretAccessKey,
  region: parameters.AWSRegion
});
deviceFarm.listProjects({}, listProjectsCallback);
