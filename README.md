# AWSCLI
[![NPM](https://nodei.co/npm/awsdevicefarmcli.png?compact=true)](https://nodei.co/npm/awsdevicefarmcli/)

Run AWS device farm tests from node scripts

## Download tests
- node **downloadTests.js** *--gitHubAccessToken* yourAccessToken *--repoUser* dcampogiani *--repoName* CalabashPanaroAndroid *--output* Tests.zip
- all parameters are optionals, if not presents default values (from config.json) are used
- for more infos please use node downloadTests.js -h


### Schedule run:
- node **scheduleRun.js** *--AWSAccessKeyId* yourAWSAccessKeyId *--AWSSecretAccessKey* yourAWSSecretAccessKey *--AWSRegion* yourAWSRegion *--AppApkPath* app.apk *--TestsZipPath* tests.zip
- all parameters are optionals, if not presents default values (from config.json) are used
- for more infos please use node scheduleRun.js -h
