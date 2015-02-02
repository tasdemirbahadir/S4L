/**
 * Chrome extension named S4L is used to save opened tabs for later surfing
 */
var txtAlertNoData = "There is not any web page to restore!";
function reset() {
	$("#alertText").html("");
}
$( document ).ready(function(){
	$("#btStore").rotate(360);
	$("#btRestore").rotate(360);
	$("#btStore").on("click", function(e){
		e.preventDefault();
		reset();
		//store tabs
		chrome.tabs.query(
			{},
			function(array_of_Tabs) {
				getStoredTabUrlsString(function(tabUrlsString) {
					areTabsStored(function(result) {
						var tabUrls;
						var currentUrlsAmount;
						if (result) {
							currentUrlsAmount = tabUrlsString.split(delimeter).length;
							if (tabUrlsString.length >= delimeter.length && tabUrlsString.substring(array_of_Tabs.length - delimeter.length) != delimeter) {
								tabUrlsString += delimeter;
							}
							tabUrls = tabUrlsString;
						} else {
							tabUrls = "";
							currentUrlsAmount = 0;
						}
						var tabIds = [array_of_Tabs.length];
						//after the creation
						for (var i = 0; i < array_of_Tabs.length; i++) {
							tabUrls += array_of_Tabs[i].url + delimeter;
							tabIds[i] = array_of_Tabs[i].id;
						}
						if (tabUrls.length >= delimeter.length) {
							tabUrls = tabUrls.substring(0, tabUrls.length - delimeter.length);
						}
						//store tabs
						setData(storedTabUrlsKey, tabUrls, function() {
							//store tabs amount
							setData(storedTabUrlsAmountKey, array_of_Tabs.length + currentUrlsAmount, function() {
								//set tabs are stored
								setData(setTabsStoredKey, "true", function() {
									chrome.browserAction.setIcon({path: "icons/restore.png"}, function(){
										setBadgeText(array_of_Tabs.length + currentUrlsAmount);
										//open a blank tab
										var jsonVar = {};
										jsonVar["url"] = "http://www.google.com";
										jsonVar["index"] = 0;
										jsonVar["active"] = true;
										chrome.tabs.create(jsonVar);
										//close tabs
										chrome.tabs.remove(tabIds);
									});
								});
							});
						});
					});
				});
			}
		);
	});
	$("#btRestore").on("click", function(e){
		e.preventDefault();
		reset();
		//restore tabs
		areTabsStored(function(result) {
			if (result) {
				getStoredTabUrls(function(tabUrls) {
					chrome.tabs.getCurrent(function(currentTab) {
						resetExtension(function() {
							$("#storedWebPages").empty();
							$("#storedWebPages").html("<tbody></tbody>");
							var jsonVar = {};
							for (var i = 0; i < tabUrls.length; i++) {
								//open tabs
								if (tabUrls[i] != "") {
									jsonVar["url"] = tabUrls[i];
									jsonVar["active"] = false;
									if (currentTab != null) {
										jsonVar["openerTabId"] = currentTab.id;
									}
									chrome.tabs.create(jsonVar);
								}
							}
						});
					});
				});
			} else {
				$("#alertText").html(txtAlertNoData);
			}
		});
	});
	areTabsStored(function(result) {
		if (result) {
			getStoredTabUrls(function(tabUrls) {
				for (var i = 0; i < tabUrls.length; i++) {
					if (tabUrls[i] != "") {
						$("#storedWebPages").append("<tr id='datarow" + i + "'><td align='center'><a target='_blank' href='" + tabUrls[i] +"'><p class='truncate'>" + tabUrls[i] + "</p></a></td><td align='center'><img id='" + i + "' data='" + tabUrls[i] + "' title='extract this tab' class='extracttab' src='images/extract.png'/></td></tr>");
					}
				}
				$(".extracttab").on("click", function(e){
					e.preventDefault();
					extractOneTabFromList($(this).attr("data"));
					$("#datarow" + $(this).attr("id")).children('td, th')
						.animate({ padding: 0 })
						.wrapInner('<div />')
						.children()
						.slideUp(function() { $(this).closest('tr').remove(); });
				});
			});
		} else {
			//do nothing
		}
	});
});