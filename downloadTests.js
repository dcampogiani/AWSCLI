var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
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

var archiveManagement = function(error, data) {
  if (error)
    console.error(error);
  else {
    new Download({
        mode: '755',
        extract: true
      })
      .get(data.meta.location, '.')
      .run(function(err, files) {
        var zip = new EasyZip();
        zip.zipFolder(files[0].path + '/features', function() {
          zip.writeToFile('./' + outputFileName + '.zip', function() {
            console.log("Zip created");
            rimraf(files[0].path, function(err) {
              if (err)
                console.error(err);
            });
          });
        })
      });
  }
};

github.repos.getArchiveLink(archiveOptions, archiveManagement);
