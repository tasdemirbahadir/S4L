/**
 * Chrome extension named S4L is used to save opened tabs for later surfing
 */
 
var storedTabUrlsKey = "storetaburls";
var storedTabUrlsAmountKey = "storetaburlsamount";
var setTabsStoredKey = "storetabarestored";
var delimeter = "[|DEL|]";

function getStoredTabUrls(callbackFunction) {
	getData(storedTabUrlsKey, function(data) {
		var tabUrls = [];
		if (data) {
			tabUrls = data.split(delimeter);
		}
		callbackFunction(tabUrls);
	});
}

function getStoredTabUrlsString(callbackFunction) {
	getData(storedTabUrlsKey, function(data) {
		callbackFunction(data);
	});
}

function areTabsStored(callbackFunction) {
	getData(setTabsStoredKey, function(areTabsStoredString) {
		var result;
		if (areTabsStoredString && areTabsStoredString == "true") {
			result = true;
		} else {
			result = false;
		}
		callbackFunction(result);
	});
}

function getData(key, callbackFunction) {
	chrome.storage.sync.get(key, function(data) {
		callbackFunction(data[key]);
	});
}

function setData(key, value, callbackFunction) {
	var jsonVar = {};
	jsonVar[key] = value;
	chrome.storage.sync.set(jsonVar, function() {
		callbackFunction();
	});
}

function setBadgeText(badgeText) {
	chrome.browserAction.setBadgeText ( { text: badgeText + "" } );
}

function resetExtension(callbackFunction) {
	//reset cookie values
	setData(storedTabUrlsKey, "", function() {
		setData(storedTabUrlsAmountKey, "", function() {
			setData(setTabsStoredKey, "", function() {
				chrome.browserAction.setIcon({path: "icons/store.png"}, function(){
					setBadgeText("");
					callbackFunction();
				});
			});
		});
	});
}

function checkAtStartup() {
	areTabsStored(function(result) {
		if (result) {
			chrome.browserAction.setIcon({path: "icons/restore.png"}, function() {
				getData(storedTabUrlsAmountKey, function(amount) {
					setBadgeText(amount);
				});
			});
		} else {
			chrome.browserAction.setIcon({path: "icons/store.png"});
		}
	});
}

function extractOneTabFromList(urlToBeExtracted) {
	var wholeTabs = "";
	getStoredTabUrls(function(tabUrls){
		if (tabUrls.length > 0) {
			var count = 0;
			var letItBe = false;
			for (var i = 0; i < tabUrls.length; i++) {
				if (urlToBeExtracted.length >= tabUrls[i].length && urlToBeExtracted.substring(0, urlToBeExtracted.length - tabUrls[i].length) == tabUrls[i] || letItBe) {
					wholeTabs += tabUrls[i] + delimeter;
					count++;
				} else {
					//let just one url to be deleted
					letItBe = true;
				}
			}
			if (wholeTabs == "") {
				resetExtension(function(){
					createTabPassive(urlToBeExtracted);
				});
			} else {
				if (wholeTabs.length >= delimeter.length && wholeTabs.substring(wholeTabs.length - delimeter.length) == delimeter) {
					wholeTabs = wholeTabs.substring(0, wholeTabs.length - delimeter.length);
				}
				//store tabs
				setData(storedTabUrlsKey, wholeTabs, function() {
					//store tabs amount
					setData(storedTabUrlsAmountKey, count, function() {
						//set tabs are stored
						setData(setTabsStoredKey, "true", function() {
							chrome.browserAction.setIcon({path: "icons/restore.png"}, function() {
								setBadgeText(count);
								createTabPassive(urlToBeExtracted);
							});
						});
					});
				});
				
			}
		}
	});
}

function createTabPassive(url) {
	var jsonVar = {};
	jsonVar["url"] = url;
	jsonVar["active"] = false;
	chrome.tabs.create(jsonVar);
}

$.fn.rotate = function(degrees, step, current) {
    var self = $(this);
    current = current || 0;
    step = step || 5;
    current += step;
    self.css({
        '-webkit-transform' : 'rotate(' + current + 'deg)',
        '-moz-transform' : 'rotate(' + current + 'deg)',
        '-ms-transform' : 'rotate(' + current + 'deg)',
        'transform' : 'rotate(' + current + 'deg)'
    });
    if (current != degrees) {
        setTimeout(function() {
            self.rotate(degrees, step, current);
        }, 5);
    }
};
 
//----actual code begins here----
if (typeof doNotAddListener === 'undefined') {
    chrome.runtime.onInstalled.addListener(function() {
		checkAtStartup();
	});
	chrome.runtime.onStartup.addListener(function(){
		checkAtStartup();
	});
}