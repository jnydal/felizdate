var CordovaAPI = {};
CordovaAPI.ready = false;
CordovaAPI.initFB = function() {
	var fbRoot = new Element("div");
	fbRoot.set("id", "fb-root");
	$(document.body).adopt(fbRoot);
    FB.init({
        appId: '461684797192269',
        nativeInterface: CDV.FB,
        useCachedDialogs: false
    });
};

// bind back button
document.addEventListener("backbutton", function() {

}, false);

// bind menu button
document.addEventListener("menubutton", function() {

}, false);

// bind ready event
document.addEventListener("deviceready", function() {
	CordovaAPI.ready = true;
	CordovaAPI.initFB();
});
