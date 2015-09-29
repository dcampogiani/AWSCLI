var config = require('./config.json');
var token = config.gitHubAccessToken;
var user = config.testProjectDetails.username;
var repo = config.testProjectDetails.repo;
var Git = require("nodegit");

var repoUrl = 'https://' + token + '@github.com/' + user + '/' + repo + '.git';
console.log('Trying to clone ' + repoUrl);


Git.Clone(repoUrl, "CalabashTest").then(function(repository) {
  // Work with the repository object here.
});