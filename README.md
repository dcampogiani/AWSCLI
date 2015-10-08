# AWSCLI
[![NPM](https://nodei.co/npm/awsdevicefarmcli.png?compact=true)](https://nodei.co/npm/awsdevicefarmcli/)

Run AWS device farm tests from node scripts

##Download tests

###Usage:
- node **downloadTests.js** *--gitHubAccessToken* yourAccessToken *--repoUser* dcampogiani *--repoName* CalabashPanaro *--output* Tests.zip
- all parameters are optionals, if not presents default values (from config.json) are used
- for more infos please use node downloadTests.js -h


##Schedule run

###Usage:
- node **scheduleRun.js** *--AWSAccessKeyId* yourAWSAccessKeyId *--AWSSecretAccessKey* yourAWSSecretAccessKey *--AWSRegion* yourAWSRegion *--AppApkPath* app.apk *--TestsZipPath* tests.zip
- all parameters are optionals, if not presents default values (from config.json) are used
- for more infos please use node scheduleRun.js -h
