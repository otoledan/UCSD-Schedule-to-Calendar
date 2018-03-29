/*
*	Event Listerner to caputer a click on make calendar button and trigger a download if on a webreg page
*	File downloaded is Classes.ics
*/
document.addEventListener('DOMContentLoaded', function() {
    var checkPageButton = document.getElementById('makeCalendar');
    checkPageButton.addEventListener('click', function() {
      
      	//querys the active tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];

            //sends message to script running in background which verifies if on the correct webpage
            chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"}, function(response) {
                //if response is defined, aka the calendar string
                if (response.calendar != undefined) {

                	//creates text blob
                	var blob = new Blob([response.calendar], {type: "text/plain"});
                	//creates url out of text blob
                	var url = URL.createObjectURL(blob);
                
                
                	//shows google calendar button
                    document.getElementById('addToGoogleCalendar').style.display = "flex";

                    //downloads calendar file
	                chrome.downloads.download({
	                    url: url,
	                    filename: "Classes.ics"
                	});
            	}
            });
        });   
    }, false);
}, false);

/*
* Listens if add to google calendar button is pressed
*/
document.addEventListener('DOMContentLoaded', function() {
    var checkPageButton = document.getElementById('addToGoogleCalendar');
    checkPageButton.addEventListener('click', function() {
      
      	//querys the current tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];

            //sends message to background script to redirect page to import page for google calendar
            chrome.tabs.sendMessage(activeTab.id, {"message": "add_google_calendar"}, function(response) {});
        });   
    }, false);
}, false);

/*
*	On any page that is not WebReg, redirects webpage to webreg on click of icon
*/
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "go_to_webreg"}, function(response) {});
});