var config = require('./config.json');
var token = config.gitHubAccessToken;
var user = config.testProjectDetails.username;
var repo = config.testProjectDetails.repo;
var clone = require('git-clone');

var repoUrl = 'https://' + token + '@github.com/' + user + '/' + repo + '.git';
console.log('Trying to clone ' + repoUrl);


clone('git@github.com:jaz303/tpl-simple-site.git', './test-checkout', {
    checkout: 'a76362b0705d4126fa4462916cabb2506ecfe8e2'
  },
  function(err) {
    console.log("complete!");
    console.log(err);
  });
