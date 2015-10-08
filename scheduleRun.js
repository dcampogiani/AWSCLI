var AWS = require('aws-sdk');
var request = require('request');
var fs = require('fs');
var http = require('http');
var constants = require('./constants');
var utils = require('./utils.js');
var path = require('path');
var config = require('./config.json');

//Globar variables, I'm going to hell
var appArn;
var testArn;
var projectArn;
var devicePoolArn;

var parameters = {};

var intiParameters = function() {
  var options = require('node-getopt').create([
    ['', 'AWSAccessKeyId=ARG', 'AWS AccessKeyId'],
    ['', 'AWSSecretAccessKey=ARG', 'AWS SecretAccessKey'],
    ['', 'AWSRegion=ARG', 'AWS region'],
    ['', 'AppApkPath=ARG', 'App apk path'],
    ['', 'TestsZipPath=ARG', 'Tests zip path'],
    ['h', 'help', 'display this help'],
  ]).bindHelp().parseSystem().options;
  parameters.AWSAccessKeyId = options.AWSAccessKeyId;
  parameters.AWSSecretAccessKey = options.AWSSecretAccessKey;
  parameters.AWSRegion = options.AWSRegion;
  parameters.AppApkPath = options.AppApkPath;
  parameters.TestsZipPath = options.TestsZipPath;
  if (parameters.AWSAccessKeyId == undefined)
    parameters.AWSAccessKeyId = config.aws.accessKeyId;
  if (parameters.AWSSecretAccessKey == undefined)
    parameters.AWSSecretAccessKey = config.aws.secretAccessKey;
  if (parameters.AWSRegion == undefined)
    parameters.AWSRegion = config.aws.region;
  if (parameters.AppApkPath == undefined)
    parameters.AppApkPath = path.normalize('./app.apk');
  if (parameters.AppApkPath.indexOf(".apk") == -1)
    parameters.AppApkPath = parameters.AppApkPath + '.apk';
  parameters.AppApkPath = path.resolve(parameters.AppApkPath);
  if (parameters.TestsZipPath == undefined)
    parameters.TestsZipPath = path.normalize('./tests.zip');
  if (parameters.TestsZipPath.indexOf(".zip") == -1)
    parameters.TestsZipPath = parameters.output + '.zip';
  parameters.TestsZipPath = path.resolve(parameters.TestsZipPath);
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
    if (err) {
      console.error(err);
      process.exit(1);
    }

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


var awsUploadReadysemaphore = function(uploadArn, callback) {

  var uploadResultParams = {
    arn: uploadArn
  };

  var innerFunction = function(params, innerCallback) {
    console.log('Getting upload status from AWS');
    deviceFarm.getUpload(uploadResultParams, function(err, data) {
      if (err)
        callback(err, null);
      else {
        var status = data.upload.status;
        if (status == constants.uploadStatus.succeeded)
          innerCallback(null, data);
        else if (status == constants.uploadStatus.failed)
          innerCallback(null, data);
        else if (status == constants.uploadStatus.initialized || status == constants.uploadStatus.processing) {
          setTimeout(innerFunction, 10000, uploadResultParams, innerCallback);
        }
      }
    });
  }
  innerFunction(uploadResultParams, callback);
};

var scheduleRun = function() {

  var params = {
    appArn: appArn,
    devicePoolArn: devicePoolArn,
    projectArn: projectArn,
    test: {
      type: constants.runTypeCalabash,
      testPackageArn: testArn
    },
    name: utils.getDateTime()
  };

  awsUploadReadysemaphore(appArn, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      process.exit(1);
    } else {
      console.log("App Upload Status: " + data.upload.status);
      if (data.upload.status == constants.uploadStatus.succeeded)
        awsUploadReadysemaphore(testArn, function(err, data) {
          if (err) {
            console.log(err, err.stack);
            process.exit(1);
          } else {
            console.log("Tests Upload Status: " + data.upload.status);
            console.log("Scheduling run");
            deviceFarm.scheduleRun(params, function(err, data) {
              if (err) {
                console.log(err, err.stack);
                process.exit(1);
              } else
                console.log("Run scheduled");
            });
          }
        })
    }
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
    uploadFile(parameters.TestsZipPath, whereToPut, contentType, putTestCallback);
  }
};

var putApkCallback = function(err, httpResponse, body) {
  if (err)
    console.log(err, err.stack);
  else {
    createUpload(projectArn, path.basename(parameters.TestsZipPath), constants.uploadTypeCalabash, 'application/octet-stream', createUploadTestCallback);
  }
};

var createUploadAPKCallback = function(err, data) {
  if (err)
    console.log(err, err.stack);
  else {
    var whereToPut = data.upload.url;
    var contentType = data.upload.contentType;
    appArn = data.upload.arn;
    uploadFile(parameters.AppApkPath, whereToPut, contentType, putApkCallback);
  }
};

var listProjectsCallback = function(err, data) {
  if (err)
    console.log(err, err.stack);
  else {
    projectArn = data.projects[0].arn;
    createUpload(projectArn, path.basename(parameters.AppApkPath), constants.uploadTypeAndroid, 'application/octet-stream', createUploadAPKCallback);
  }
};

intiParameters();
var deviceFarm = new AWS.DeviceFarm({
  accessKeyId: parameters.AWSAccessKeyId,
  secretAccessKey: parameters.AWSSecretAccessKey,
  region: parameters.AWSRegion
});
deviceFarm.listProjects({}, listProjectsCallback);
