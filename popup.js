// Set the configuration for your app
  // TODO: Replace with your project's config object

  // Get a reference to the storage service, which is used to create references in your storage bucket
var storage = firebase.storage();

var overallURL = undefined;

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
                if (response.calendar == undefined) {
                    document.getElementById("helpMessage").style.display = "block";
                }
                if (response.calendar != undefined) {
                    document.getElementById("helpMessage").style.display = "hide";
                	//creates text blob
                	var blob = new Blob([response.calendar], {type: "text/calendar"});
                	//creates url out of text blob
                	var url = URL.createObjectURL(blob);

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

            chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"}, function(response) {
                //if response is defined, aka the calendar string
                if (response.calendar == undefined) {
                    document.getElementById("helpMessage").style.display = "block";
                } 
                if (response.calendar != undefined) {
                    document.getElementById("helpMessage").style.display = "hide";
                    if (overallURL == undefined)  {
                        //creates text blob
                        var blob = new Blob([response.calendar], {type: "text/calendar"});
                        //creates url out of text blob
                        var url = URL.createObjectURL(blob);

                        // Points to the root reference
                        var ref = firebase.storage().ref();

                        var array = new Uint32Array(4);
                        window.crypto.getRandomValues(array);

                        var str = "";
                        for (var i = 0; i < array.length; i++) {
                            str = str + "" + array[i];
                        }

                        var name = 'Classes'+ str +'.ics'

                        ref = ref.child(name);

                        var file = new File([blob], name, {type: 'text/calendar', lastModified: Date.now()});

                        ref.put(file).then(function(snapshot) {

                            ref.getDownloadURL().then(function(url) {

                                overallURL = url;

                                var downloadURL = url;

                                //var downloadURL = "https://www.google.com/calendar/render?cid=http://" + url.substring(8,url.length);

                                console.log(downloadURL);

                            //sends message to background script to redirect page to import page for google calendar
                            chrome.tabs.sendMessage(activeTab.id, {"message": "add_google_calendar", "url": downloadURL}, function(response) {});

                            })
                        });
                    }

                    else {
                        console.log(overallURL);

                        //var downloadURL = "http://www.google.com/calendar/render?cid=http://" + overallURL.substring(8,overallURL.length);

                        var downloadURL = overallURL;

                        chrome.tabs.sendMessage(activeTab.id, {"message": "add_google_calendar", "url": downloadURL}, function(response) {});
                    }


                }
            });
        });   
    }, false);
}, false);

document.addEventListener('DOMContentLoaded', function() {
    var checkPageButton = document.getElementById('openCalendar');
    checkPageButton.addEventListener('click', function() {
      
        //querys the current tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];

            chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"}, function(response) {
                //if response is defined, aka the calendar string
                if (response.calendar == undefined) {
                    document.getElementById("helpMessage").style.display = "block";
                }
                if (response.calendar != undefined) {
                    if (overallURL == undefined) {
                        document.getElementById("helpMessage").style.display = "hide";
                        //creates text blob
                        var blob = new Blob([response.calendar], {type: "text/calendar"});
                        //creates url out of text blob
                        var url = URL.createObjectURL(blob);

                        // Points to the root reference
                        var ref = firebase.storage().ref();

                        var array = new Uint32Array(4);
                        window.crypto.getRandomValues(array);

                        var str = "";
                        for (var i = 0; i < array.length; i++) {
                            str = str + "" + array[i];
                        }

                        var name = 'Classes' + str + '.ics';

                        ref = ref.child(name);

                        var file = new File([blob], name, {type: 'text/calendar', lastModified: Date.now()});

                        ref.put(file).then(function(snapshot) {

                            ref.getDownloadURL().then(function(url) {

                                overallURL = url;

                                chrome.tabs.sendMessage(activeTab.id, {"message": "openCalendar","url" : url}, function(response) {});

                                var tooltip = document.getElementById("tooltipSpan");

                                tooltip.style.display = "inline";
                            })
                        });
                    }
                    else {
                        chrome.tabs.sendMessage(activeTab.id, {"message": "openCalendar","url" : overallURL}, function(response) {});

                         var tooltip = document.getElementById("tooltipSpan");

                        tooltip.style.display = "inline";
                    }
                }
            });
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