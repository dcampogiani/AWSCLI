var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var Download = require('download');
var GitHubApi = require("github");
var archiver = require('archiver');
var config = require('./config.json');

var parameters = {};

var intiParameters = function() {
  var options = require('node-getopt').create([
    ['', 'gitHubAccessToken=ARG', 'GitHub OAuth access token'],
    ['', 'repoUser=ARG', 'Owner of the repository to download'],
    ['', 'repoName=ARG', 'Name of the repository you want to download'],
    ['', 'output=ARG', 'Desired output file name'],
    ['h', 'help', 'display this help'],
  ]).bindHelp().parseSystem().options;
  parameters.gitHubAccessToken = options.gitHubAccessToken;
  parameters.repoUser = options.repoUser;
  parameters.repoName = options.repoName;
  parameters.output = options.output;
  if (parameters.gitHubAccessToken == undefined)
    parameters.gitHubAccessToken = config.gitHubAccessToken;
  if (parameters.repoUser == undefined)
    parameters.repoUser = config.testProjectDetails.username;
  if (parameters.repoName == undefined)
    parameters.repoName = config.testProjectDetails.repo;
  if (parameters.output == undefined)
    parameters.output = 'DonwloadedTests.zip';
  if (parameters.output.indexOf(".zip") == -1)
    parameters.output = parameters.output + '.zip';
};

var printParameters = function() {
  console.log('Using following parameters: ');
  console.log(parameters);
}

var initGitHubAPI = function() {
  var instance = new GitHubApi({
    version: "3.0.0",
    host: "api.github.com"
  });
  instance.authenticate({
    type: "oauth",
    token: parameters.gitHubAccessToken
  });
  return instance;
}

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
        var output = fs.createWriteStream('./' + parameters.output);
        var archive = archiver.create('zip');
        output.on('close', function() {
          rimraf(files[0].path, function(err) {
            if (err)
              console.error(err);
          });
        });
        archive.pipe(output);
        archive.directory(files[0].path + '/features', 'features');
        archive.finalize();
      });
  }
};

intiParameters();
initGitHubAPI().repos.getArchiveLink({
  user: parameters.repoUser,
  repo: parameters.repoName,
  ref: "master",
  archive_format: "zipball"
}, archiveManagement);
