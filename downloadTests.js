var fs = require('fs');
var path = require('path');
var EasyZip = require('easy-zip').EasyZip;
var Download = require('download');
var GitHubApi = require("github");

var config = require('./config.json');

var outputFileName = 'CalabashTests';

var github = new GitHubApi({
  version: "3.0.0",
  host: "api.github.com"
});

github.authenticate({
  type: "oauth",
  token: config.gitHubAccessToken
});

var archiveOptions = {
  user: config.testProjectDetails.username,
  repo: config.testProjectDetails.repo,
  ref: "master",
  archive_format: "zipball"
};

var renameAndZip = function(source, subDir, destination) {
  var tempFile = './temp';
  var tempSubDir = path.normalize(tempFile + '/' + subDir);
  fs.rename(source, tempFile, function(error) {
    var zip = new EasyZip();
    zip.zipFolder(tempSubDir, function() {
      zip.writeToFile(destination + '.zip');
      fs.rmdir(tempFile, function(error) {
        if (error)
          console.error(error);
      });
    });
  });
};

var archiveManagement = function(error, data) {
  if (error)
    console.error(error);
  else {
    new Download({
        extract: true,
      })
      .get(data.meta.location, '.')
      .run(function(err, files) {
        renameAndZip(files[0].path, 'features', outputFileName);
      });
  }
};

github.repos.getArchiveLink(archiveOptions, archiveManagement);
