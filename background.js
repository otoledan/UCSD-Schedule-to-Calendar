/*
*   gets the dom elements of the schedule and placed them into an array
*/
function getJQuery() {
    arr = [];
    for (var i = 0; i < 40; i++) {
        var x = $("#" + i);
      
        x = x[0];
      
        if (x != undefined) {
            arr[i] = Array.from(x.children);
        }
    }
    return arr;
}

/*
*   creates an array of course objects from the array which are then used to 
*   create the schedule
*/
function getCourses(arr) {
    var subject_course = [];
    var course = {name: "", type: "", days: "", time: "", loc: ""};

    var name;
    var type;
    var days;
    var time;
    var loc;

    //for loop to go through every row in schedule (Lecture, Lab, Discussion, Final)
    for (var i = 0; i < arr.length; i++) {
        //for loop to get needed information to crease course object
        for (var j = 0; j < 10; j++) {
            //sets the name of the class
            if (j == 0 && arr[i][j].outerText.trim() != "") {
                name = arr[i][j].outerText.trim();
            }
            //sets the tyle of the class
            else if (j == 3 && arr[i][j].outerText.trim() != "") {
                type = arr[i][j].outerText.trim();
                
                if (type == "LE")
                    type = "Lecture";
                else if (type == "LA")
                    type = "Lab";
                else if (type == "DI")
                    type = "Discussion";
                else if (type == "FI")
                    type = "Final";
            }
            
            //records the days on which the class occurs
            else if (j == 7 && arr[i][j].outerText.trim() != "") {
                days = arr[i][j].outerText.trim();
            }

            //records the times at which the class occurs
            else if (j == 8 && arr[i][j].outerText.trim() != "") {
                time = arr[i][j].outerText.trim();
                time = time.split("-");
            }

            //recrods the location of the class and if TBA, then location is not saved)
            else if (j == 9 && arr[i][j].outerText.trim() != "") {
                if (arr[i][j].outerText.trim() == "TBA" || arr[i][j+ 1].outerText.trim() == "TBA") {
                    loc = "";
                }
                else {
                    loc = arr[i][j].outerText.trim() + " " + arr[i][j+ 1].outerText.trim();
                }
            }
        }

        course = Object.assign({}, course);
        course.name = name;
        course.type = type;
        course.days = days;
        course.time = time;
        course.loc = loc;

        //adds course object to array
        subject_course.push(course);
    }

    return subject_course;
}

/**
*   Converts days of the week to an array that is readable by an ics file
*/
function convertTime(day) {
    var days = [];
    var len = day.length;
    for (var i = 0; i < len; i++) {
        var x = day.charAt(i);
        if (x == "M")
            days.push("MO");
        else if (x == "W")
            days.push("WE");
        else if (x == "F")
            days.push("FR")
        else if (x == "T") {
            if (day.charAt(i+1) == "u") {
                days.push("TU");
            }
            else if (day.charAt(i+1) == "h") {
                days.push("TH");
            }
        }
        else if (x == "S") {
            if (day.charAt(i+1) == "a") {
                days.push("SA");
            }
            else if (day.charAt(i+1) == "u") {
                days.push("SU");
            }
        }
    }
    return days;
}

/*
*   gets the days of each course
*/
function getDays(subject_course) {
    for (var i = 0; i < subject_course.length; i++) {
        //for all classes except final converts the days to array
        if (subject_course[i].type != "Final") {
            subject_course[i].days = convertTime(subject_course[i].days);
        }
        //for final stores the date of the final
        else {
        subject_course[i].days = subject_course[i].days.split(" ")[1].trim();
        }
    }
}

/*
*   converts start and end times to string that can be read by ics file
*/
function timeToString(subject_course) {
    for (var i = 0; i < subject_course.length; i++) {
        subject_course[i].hourStart = parseInt(subject_course[i].time[0].split(":")[0]);
        subject_course[i].minStart = parseInt(subject_course[i].time[0].split(":")[1]);
    
        if (subject_course[i].time[0].substr(subject_course[i].time[0].length - 1) == "p" && subject_course[i].hourStart != 12) {
            subject_course[i].hourStart = subject_course[i].hourStart + 12;
        }

        subject_course[i].hourEnd = parseInt(subject_course[i].time[1].split(":")[0]);
        subject_course[i].minEnd = parseInt(subject_course[i].time[1].split(":")[1]);
    
        if (subject_course[i].time[1].substr(subject_course[i].time[1].length - 1) == "p" && subject_course[i].hourEnd != 12) {
            subject_course[i].hourEnd = subject_course[i].hourEnd + 12;
        }

    
        subject_course[i].hourStart = ("0" + subject_course[i].hourStart).slice(-2);
        subject_course[i].hourEnd = ("0" + subject_course[i].hourEnd).slice(-2);
        subject_course[i].minStart = ("0" + subject_course[i].minStart).slice(-2);
        subject_course[i].minEnd = ("0" + subject_course[i].minEnd).slice(-2);
    }

    for (var i = 0; i < subject_course.length; i++) {
        subject_course[i].tString = [];
        subject_course[i].tString[0] = "T" + subject_course[i].hourStart + subject_course[i].minStart + "00";
        subject_course[i].tString[1] = "T" + subject_course[i].hourEnd + subject_course[i].minEnd + "00";
    }
}

/*
*   Adds specified number of days to javascript date object
*/
function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}


/*
*   sets the start and end dates for the course which include until when they should be repeated.
*/
function date(start, end, subject_course) {
    //for loop to go through every course
    for (var i=0; i < subject_course.length; i++) {
        //if the subject_course object is a final
        if (subject_course[i].type == "Final") {
            //extracts the date of the final and sets the start end date
            var date = subject_course[i].days.split("/");
            var date = "" + date[2] + date[0] + date[1] + "";
            subject_course[i].dateStartStr = date;
            subject_course[i].dateEndStr = date;
        }
    
        else {
            //else converts the subject_course object's date to a javascript date object
            //in order to properly assign the correct start date
            var year = start.substring(0,4);
            var month = start.substring(4,6);
            var day = start.substring(6,8);

            var newDate = new Date(year, month, day);
            newDate.setMonth(newDate.getMonth() - 1);

            if (subject_course[i].days[0] == "SU") {
                newDate = addDays(newDate, -1);
            }
            else if (subject_course[i].days[0] == "MO") {
                newDate = addDays(newDate, 0);
            }
            else if (subject_course[i].days[0] == "TU") {
                newDate = addDays(newDate, 1);                
            }
            else if (subject_course[i].days[0] == "WE") {
                newDate = addDays(newDate, 2);
            }
            else if (subject_course[i].days[0] == "TH") {
                newDate = addDays(newDate, 3);
            }
            else if (subject_course[i].days[0] == "FR") {
                newDate = addDays(newDate, 4);
            }
            else if (subject_course[i].days[0] == "SA") {
                newDate = addDays(newDate, 5);
            }

            year = "" + (newDate.getFullYear()) + "";
            month = "" + (newDate.getMonth() + 1) + "";
            day = "" + newDate.getDate() + "";

            month = ("0" + month).slice(-2);
            day = ("0" + day).slice(-2);

            var start1 = year + "" + month + "" + day;

            subject_course[i].dateStartStr = start1;
            subject_course[i].dateEndStr = end;
        }
    }
}

/*
*   creates a .ics event (aka VEvent) string for a course
*/
function createVEvent(course) {
    var s = 
        "BEGIN:VEVENT" + "\n";

    if (course.type == "Final") {
        s = s + "DTSTART;TZID=America/Los_Angeles:" + course.dateEndStr + course.tString[0] + "\n" +
                "DTEND;TZID=America/Los_Angeles:" + course.dateEndStr + course.tString[1] + "\n";
    }

    if (course.type != "Final") {
        s = s + "DTSTART;TZID=America/Los_Angeles:" + course.dateStartStr + course.tString[0] + "\n" +
                "DTEND;TZID=America/Los_Angeles:" + course.dateStartStr + course.tString[1] + "\n";
        s = s + "RRULE:FREQ=WEEKLY;UNTIL=" + course.dateEndStr + "T235959Z" + ";BYDAY=";

        for (var i = 0; i < course.days.length-1; i++) {
            s = s + course.days[i] + ",";
        } 
        s = s + course.days[course.days.length-1] + "\n";
    }

    s = s +
        "DESCRIPTION:" + "\n" +
        "LOCATION:" + course.loc + "\n" +
        "SEQUENCE:0" + "\n" +
        "STATUS:CONFIRMED" + "\n" +
        "SUMMARY:" + course.name +" " + course.type + "\n" +
        "TRANSP:OPAQUE" + "\n" +
        "END:VEVENT" + "\n";

    return s;
}

/*
*   function to return the start and end times of instruction for 
*   every Fall, Winter, Spring, Summer Session 1, and Summer
*   Session 2 quarters based on the quarter that one is looking at
*
*   Dates came from UCSD Academic Calendar
*/
function getStartEnd() {
    var dates = [
        ["WI18", "20180108", "20180316"],
        ["SP18", "20180402", "20180608"],
        ["S118", "20180702", "20180803"],
        ["S218", "20180806", "20180907"],
        ["FA18", "20180927", "20181207"],
        ["WI19", "20190107", "20190315"],
        ["SP19", "20190401", "20190607"],
        ["S119", "20190701", "20190802"],
        ["S219", "20190805", "20190906"],
        ["FA19", "20190926", "20191206"],
        ["WI20", "20200106", "20200313"],
        ["SP20", "20200330", "20200605"],
        ["S120", "20200629", "20200731"],
        ["S220", "20200803", "20200904"],
        ["FA20", "20201001", "20201211"],
        ["WI21", "20210104", "20210312"],
        ["SP21", "20210329", "20210604"],
        ["S121", "20210628", "20210730"],
        ["S221", "20210802", "20210903"],
        ["FA21", "20210923", "20211203"],
        ["WI22", "20220103", "20220311"],
        ["SP22", "20220328", "20220603"],
        ["S122", "20220627", "20220729"],
        ["S222", "20220801", "20220902"],
        ["FA22", "20220922", "20221202"],
        ["WI23", "20230103", "20230317"],
        ["SP23", "20230403", "20230609"],
        ["S123", "20230703", "20230804"],
        ["S223", "20230807", "20230908"] 
    ];

    var url = $(location).attr('href');

    var quarter = url.split("=")[1].split("&")[0];

    for (var i = 0; i < dates.length; i++) {
        if (quarter == dates[i][0]) {
            return dates[i];
        }
    }
    return ["","",""];
}

/*
*   Function which makes a calendar for the correct quarter out of all
*   the subject_course array's objects
*/
function makeCalendar(quarter, subject_course) {
    if (subject_course.length == 0) {
        return undefined;
    }

    var s = 
        "BEGIN:VCALENDAR" + "\n" +
        "PRODID:-//Google Inc//Google Calendar 70.9054//EN" + "\n" +
        "VERSION:2.0" + "\n" +
        "CALSCALE:GREGORIAN" + "\n" +
        "METHOD:PUBLISH" + "\n" +
        "X-WR-CALNAME:Classes " + quarter + "\n" +
        "X-WR-TIMEZONE:America/Los_Angeles" + "\n" +
        "X-WR-CALDESC:" + "\n" +
        "BEGIN:VTIMEZONE" + "\n" +
        "TZID:America/Los_Angeles" + "\n" +
        "X-LIC-LOCATION:America/Los_Angeles" + "\n" +
        "BEGIN:DAYLIGHT" + "\n" +
        "TZOFFSETFROM:-0800" + "\n" +
        "TZOFFSETTO:-0700" + "\n" +
        "TZNAME:PDT" + "\n" +
        "DTSTART:19700308T020000" + "\n" +
        "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU" + "\n" +
        "END:DAYLIGHT" + "\n" +
        "BEGIN:STANDARD" + "\n" +
        "TZOFFSETFROM:-0700" + "\n" +
        "TZOFFSETTO:-0800" + "\n" +
        "TZNAME:PST" + "\n" +
        "DTSTART:19701101T020000" + "\n" +
        "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU" + "\n" +
        "END:STANDARD" + "\n" +
        "END:VTIMEZONE" + "\n";

    for (var i = 0; i < subject_course.length; i++) {
        s = s + createVEvent(subject_course[i]);
    }

    s = s + "END:VCALENDAR\n"

    return s;
}

//undefine variable
var ical;

//if on webreg page and not start page 
if ($(location).attr('href').split("/")[3] == "webreg2" && $(location).attr('href').split("/")[4] != "start") {

    //array to get objects
    var arr = getJQuery();
    //gets the subject_courses from array
    var subject_course = getCourses(arr);
    //assigns the correct days array to subject_course
    getDays(subject_course);
    //converts the times to a .ics readeable string
    timeToString(subject_course);
    //gets the start end times 
    var startEnd = getStartEnd();
    //sets start end dates for course
    date(startEnd[1],startEnd[2], subject_course);
    //returns .ics readeable calendar string
    ical = makeCalendar(startEnd[0], subject_course);
}

/*
*   Background listener for messages send from extension
*/
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        //if make calendar button is clicked sends response
        if(request.message === "clicked_browser_action"){// && ical != undefined) {
            sendResponse({calendar: ical});
        }
        //if add to google calendar button is clicked, redirects page to google calendar import page
        else if(request.message === "add_google_calendar"){
            location.replace("https://calendar.google.com/calendar/r/settings/export");
        }
        //if extension icon is clicked, redirects page to webreg if not already there
        else if(request.message === "go_to_webreg"){
            if ($(location).attr('href').split("/")[2] != "act.ucsd.edu" || $(location).attr('href').split("/")[3] != "webreg2") {
                location.replace("https://act.ucsd.edu/webreg2/start");
            }
        }
    }
);