/**
 * Chrome extension named S4L is used to save opened tabs for later surfing
 */
var storedTabUrlsKey = "storetaburls";
var storedTabUrlsAmountKey = "storetaburlsamount";
var setTabsStoredKey = "storetabarestored";
var delimeter = "|";

function getStoredTabUrls(callbackFunction) {
	getData(storedTabUrlsKey, function(data) {
		var tabUrls = [];
		if (data) {
			tabUrls = data.split(delimeter);
		}
		callbackFunction(tabUrls);
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

function setData(key, value) {
	var jsonVar = {};
	jsonVar[key] = value;
	chrome.storage.sync.set(jsonVar, function() {});
}

function setBadgeText(badgeText) {
	chrome.browserAction.setBadgeText ( { text: badgeText + "" } );
}

function resetExtension() {
	//reset cookie values
	setData(storedTabUrlsKey, "");
	setData(storedTabUrlsAmountKey, "");
	setData(setTabsStoredKey, "");
	chrome.browserAction.setIcon({path: "icons/store.png"});
	setBadgeText("");
}

function checkAtStartup() {
	areTabsStored(function(result) {
		if (result) {
			chrome.browserAction.setIcon({path: "icons/restore.png"});
			getData(storedTabUrlsAmountKey, function(amount) {
				setBadgeText(amount);
			});
		} else {
			chrome.browserAction.setIcon({path: "icons/store.png"});
		}
	});
}

//----actual code begins here----
chrome.runtime.onInstalled.addListener(function() {
	checkAtStartup();
});
chrome.runtime.onStartup.addListener(function(){
	checkAtStartup();
});
chrome.browserAction.onClicked.addListener(function(tab) {
	areTabsStored(function(result) {
		if (result) {
			//restore tabs
			getStoredTabUrls(function(tabUrls) {
				for (var i = 0; i < tabUrls.length; i++) {
					//open tabs
					chrome.tabs.create({ url: tabUrls[i] });
				}
				resetExtension();
			});
		} else {
			//store tabs
			chrome.tabs.query(
				{},
				function(array_of_Tabs) {
					var tabUrls = "";
					var tabIds = [array_of_Tabs.length];
					//open a blank tab
					chrome.tabs.create({ url: "http://www.google.com", index: 0, active: true });
					//after the creation
					for (var i = 0; i < array_of_Tabs.length; i++) {
						if (array_of_Tabs[i].url.indexOf("chrome-devtools://") != 0) {
							tabUrls += array_of_Tabs[i].url;
							tabIds[i] = array_of_Tabs[i].id;
							if (i != array_of_Tabs.length - 1) {
								tabUrls += delimeter;
							}
						}
					}
					//close tabs
					chrome.tabs.remove(tabIds, function (){});
					//store tabs
					setData(storedTabUrlsKey, tabUrls);
					//store tabs amount
					setData(storedTabUrlsAmountKey, array_of_Tabs.length);
					//set tabs are stored
					setData(setTabsStoredKey, "true");
					chrome.browserAction.setIcon({path: "icons/restore.png"});
					setBadgeText(array_of_Tabs.length);
				}
			);
			
		}
	});
});
