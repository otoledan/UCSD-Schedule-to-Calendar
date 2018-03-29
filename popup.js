document.addEventListener('DOMContentLoaded', function() {
    var checkPageButton = document.getElementById('makeCalendar');
    checkPageButton.addEventListener('click', function() {
      
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];

            chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"}, function(response) {
                var blob = new Blob([response.calendar], {type: "text/plain"});
                var url = URL.createObjectURL(blob);
                
                if (response.calendar != undefined) {
                    document.getElementById('addToGoogleCalendar').style.display = "flex";
                }

                chrome.downloads.download({
                    url: url,
                    filename: "Classes.ics"
                });
            });
        });   
    }, false);
}, false);

document.addEventListener('DOMContentLoaded', function() {
    var checkPageButton = document.getElementById('addToGoogleCalendar');
    checkPageButton.addEventListener('click', function() {
      
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];

            chrome.tabs.sendMessage(activeTab.id, {"message": "add_google_calendar"}, function(response) {});
        });   
    }, false);
}, false);

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "go_to_webreg"}, function(response) {});
});