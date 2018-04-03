// Set the configuration for your app
  // TODO: Replace with your project's config object

  // Get a reference to the storage service, which is used to create references in your storage bucket
var storage = firebase.storage();

var overallURL = undefined;
var calendar = undefined;

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

                    calendar = response.calendar;
                    
                    chrome.storage.sync.set({"calendar": response.calendar}, function() {});
                        var blob = new Blob([calendar], {type: "text/plain"});
                        //creates url out of text blob
                        var url = URL.createObjectURL(blob);

                        //downloads calendar file
                        if (tabs[0].incognito == false) {
                            chrome.downloads.download({
                                url: url,
                                filename: "Classes.ics"
                            });
                        }
                        else {
                            var ref = firebase.storage().ref();

                            console.log(ref);

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
                                    chrome.storage.sync.set({"overallURL": url}, function() {});

                                    var downloadURL = url;

                                    chrome.downloads.download({
                                        url: downloadURL,
                                        filename: "Classes.ics"
                                    });

                                })
                            });
                        }
                    }
            });
        });   
    }, false);
}, false);

document.addEventListener('DOMContentLoaded', function() {
    var checkPageButton = document.getElementById('currentQuarterButton');
    checkPageButton.addEventListener('click', function() {
        console.log("active")
        var isOn = $("#currentQuarterButton")[0].checked;

        chrome.storage.sync.set({"switchOn": isOn}, function() {});

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
                else { 

                chrome.storage.sync.get(['overallURL', 'calendar'], function(result) {   
                    if (result.overallURL !== undefined && result.calendar !== undefined) {
                        if (result.calendar === response.calendar) {
                            console.log("called")
                            overallURL = result.overallURL;
                        }
                    }

                    if (response.calendar !== undefined) {
                        document.getElementById("helpMessage").style.display = "hide";
                        if (overallURL == undefined) {
                            //creates text blob
                            var blob = new Blob([response.calendar], {type: "text/calendar"});
                            //creates url out of text blob
                            var url = URL.createObjectURL(blob);

                            calendar = response.calendar;

                            chrome.storage.sync.set({"calendar": response.calendar}, function() {});

                            // Points to the root reference
                            var ref = firebase.storage().ref();

                            console.log(ref);

                            // Create a reference to the file to delete
                            if (result.overallURL !== undefined) {
                                var delteRef = ref.child(result.overallURL.split("/")[7].split("?")[0]);

                                // Delete the file
                                delteRef.delete().then(function() {
                                  // File deleted successfully
                                }).catch(function(error) {
                                  // Uh-oh, an error occurred!
                                });
                            }

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
                                    chrome.storage.sync.set({"overallURL": url}, function() {});

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
                else { 

                chrome.storage.sync.get(['overallURL', 'calendar'], function(result) {   
                    if (result.overallURL !== undefined && result.calendar !== undefined) {
                        if (result.calendar === response.calendar) {
                            console.log("called")
                            overallURL = result.overallURL;
                        }
                    }

                    if (response.calendar !== undefined) {
                        document.getElementById("helpMessage").style.display = "hide";
                        if (overallURL == undefined) {
                            //creates text blob
                            var blob = new Blob([response.calendar], {type: "text/calendar"});
                            //creates url out of text blob
                            var url = URL.createObjectURL(blob);

                            calendar = response.calendar;

                            chrome.storage.sync.set({"calendar": response.calendar}, function() {});

                            // Points to the root reference
                            var ref = firebase.storage().ref();

                            console.log(ref);

                            // Create a reference to the file to delete
                            if (result.overallURL !== undefined) {
                                var delteRef = ref.child(result.overallURL.split("/")[7].split("?")[0]);

                                // Delete the file
                                delteRef.delete().then(function() {
                                  // File deleted successfully
                                }).catch(function(error) {
                                  // Uh-oh, an error occurred!
                                });
                            }

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
                                    chrome.storage.sync.set({"overallURL": url}, function() {});

                                    var downloadURL = url;

                                    //var downloadURL = "https://www.google.com/calendar/render?cid=http://" + url.substring(8,url.length);

                                    console.log(downloadURL);

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
                }
                });
           });   
    }, false);
}, false);


var dates = [
        ["WI18", "20180108", "20180316", "20180324"],
        ["SP18", "20180402", "20180608", "20180615"],
        ["S118", "20180702", "20180803", "20180804"],
        ["S218", "20180806", "20180907", "20180908"],
        ["FA18", "20180927", "20181207", "20181215"],
        ["WI19", "20190107", "20190315", "20190323"],
        ["SP19", "20190401", "20190607", "20190614"],
        ["S119", "20190701", "20190802", "20190803"],
        ["S219", "20190805", "20190906", "20190907"],
        ["FA19", "20190926", "20191206", "20191214"],
        ["WI20", "20200106", "20200313", "20200321"],
        ["SP20", "20200330", "20200605", "20200612"],
        ["S120", "20200629", "20200731", "20200801"],
        ["S220", "20200803", "20200904", "20200905"],
        ["FA20", "20201001", "20201211", "20201219"],
        ["WI21", "20210104", "20210312", "20210320"],
        ["SP21", "20210329", "20210604", "20210611"],
        ["S121", "20210628", "20210730", "20210731"],
        ["S221", "20210802", "20210903", "20210904"],
        ["FA21", "20210923", "20211203", "20211211"],
        ["WI22", "20220103", "20220311", "20220319"],
        ["SP22", "20220328", "20220603", "20220610"],
        ["S122", "20220627", "20220729", "20220730"],
        ["S222", "20220801", "20220902", "20220903"],
        ["FA22", "20220922", "20221202", "20221210"],
        ["WI23", "20230103", "20230317", "20230325"],
        ["SP23", "20230403", "20230609", "20230616"],
        ["S123", "20230703", "20230804", "20230805"],
        ["S223", "20230807", "20230908", "20230909"] 
    ];

// yyyymmdd format
function datesInBetween(dateFrom, dateTo) {
    var d1 = [dateFrom.substring(0,4), dateFrom.substring(4,6), dateFrom.substring(6, 8)];
    var d2 = [dateTo.substring(0,4), dateTo.substring(4,6), dateTo.substring(6, 8)];

    var from = new Date(d1[0], parseInt(d1[1])-1, d1[2]);  // -1 because months are from 0 to 11
    var to   = new Date(d2[0], parseInt(d2[2])-1, d2[2]);
    var check = new Date(); 
    console.log(check > from && check <= to);

    return (check > from && check <= to);
}

//	On any page that is not WebReg, redirects webpage to webreg on click of icon

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var url = tabs[0].url;

    chrome.storage.sync.get(['switchOn'], function(result) {
        if (result.switchOn === undefined) {
            chrome.storage.sync.set({"switchOn": true}, function() {
                $("#currentQuarterButton")[0].checked = true;
            });
        }
        if (result.switchOn !== undefined) {
            if ($("#currentQuarterButton")[0].checked != result.switchOn) {
                $("#currentQuarterButton")[0].checked = result.switchOn;
            }
        }

        if (url.split("/")[3] != "webreg2") {
            var newURL = "https://act.ucsd.edu/webreg2/start";
            chrome.tabs.update(tabs.id, {url: newURL});
        }
    });
});