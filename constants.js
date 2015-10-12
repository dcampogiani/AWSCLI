function define(name, value) {
  Object.defineProperty(exports, name, {
    value: value,
    enumerable: true
  });
}

var uploadStatus = {
  failed : 'FAILED',
  initialized : 'INITIALIZED',
  processing : 'PROCESSING',
  succeeded : 'SUCCEEDED'
};


define('runTypeCalabash', 'CALABASH');
define('uploadTypeCalabash', 'CALABASH_TEST_PACKAGE');
define('uploadTypeAndroid', 'ANDROID_APP');
define('uploadTypeiOS', 'IOS_APP');
define('uploadStatus', uploadStatus);
