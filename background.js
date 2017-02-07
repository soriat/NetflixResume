var showID;
var netflixUrl = 'https://www.netflix.com';

// Initialize showID for synchronous use.
chrome.storage.sync.get('showID', function (data) {
   showID = data.showID;
});

// Automatically sync showID outside of listeners.
chrome.storage.onChanged.addListener(function(changes, area) {
   showID = changes.showID.newValue;
});

// Redirect home page to the title page of latest show.
chrome.webRequest.onBeforeRequest.addListener(function (details) {
   if (showID) {
      return { redirectUrl: netflixUrl.concat('/title/', showID) };
   }
}, { urls: [netflixUrl.concat('/browse')] }, ['blocking']);

// Redirect /resume to the watch page of latest show.
chrome.webRequest.onBeforeRequest.addListener(function (details) {
   if (showID) {
      return { redirectUrl: netflixUrl.concat('/watch/', showID) };
   };

   // If no showID, redirect to home page since /resume is a dead page.
   return { redirectUrl: netflixUrl };
}, { urls: [netflixUrl.concat('/resume')] }, ['blocking']);

// If url is a netflix watch page, grab the showID and store it.
function storeShowID(url) {
   var matches = url.match(/https?:\/\/www.netflix.com\/watch\/(\d+)/);
   if (matches) {
      chrome.storage.sync.set({showID : matches[1]});
   }
}

// storeShowID on direct navigation
chrome.webRequest.onCompleted.addListener(function (details) {
   storeShowID(details.url);
}, { urls: [netflixUrl.concat('/watch*')] });

// storeShowID on indirect navigation
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
   if (changeInfo.url) {
      storeShowID(changeInfo.url);
   }
});
