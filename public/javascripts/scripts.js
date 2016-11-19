//Loads HTML, CSS, etc. before proceeding with Javascript
$(document).ready(function () {
    // Load initial database data (document: username) & passto chartJS chart
    var getData = function () {$.get("https://lifelogs.herokuapp.com/db/", function(data, textStatus, jqXHR) {
        chart(data);
        chart2(data);
    })};


    var myActivities = ([
          "Exercised", "Watched TV", "Took a Drive", "Worked", "Visited Friends",
          "Swimming", "Basketball", "Video Games", "Studied", "Coded", "Fished / Hunted",
          "Board Games"
    ]).sort();

    /////////////////////////////////////////////////////////////
    //////*Run the calendar widget and get date from user*//////
    var today = new Date();
    //Defaults to today's date by creating date object and assigning to value attribute of #datepicker div
    var selectedDate = ("0" + (today.getMonth() + 1)).slice(-2) + "/" + ("0" + today.getDate()).slice(-2)
                            + "/" + today.getFullYear();

                            console.log(selectedDate);

    /* Allow user to view & modify activities selected on other days */
    function loadDate (selectedDate) {
        // Get all db data, then search for specific selected day.
        $.get("https://lifelogs.herokuapp.com/db/", function(data, textStatus, jqXHR) {
            var unselectedActivities = [];
            var selectedActivities = [];
            var selectedSurvey = [];
            // Search through data to find existing activities for selected date
            for (date in data) {
                //Debug : Make sure I'm pulling the correct info
                console.log(data[date]);
                console.log(data[date].survey);

                // If matching date is found, append to selectedActivities var
                if (data[date].date === selectedDate) {
                    selectedActivities = data[date].activities;
                    selectedSurvey = data[date].survey;
                }
            }

            // Set survey values according to existing survey data for given date
            $('#mental').val(selectedSurvey[0]);
            $("#mental").selectmenu("refresh");
            $('#physical').val(selectedSurvey[1]);
            $("#physical").selectmenu("refresh");
            $('#psychological').val(selectedSurvey[2]);
            $("#psychological").selectmenu("refresh");

            // Clear out visible activities in #selected & #unselected, clean slate!
            $("#unselected").html('');
            $("#selected").html('');

            // populateActivities(activities, "#selected");
            unselectedMinusSelected();

            // Prevents duplicate activities in top & bottom (unselected & selected) rows
            function unselectedMinusSelected (){
                //Cross references un(selected) activities and filters duplicates
                unselectedActivities = myActivities.filter(function (val) {
                    return selectedActivities.indexOf(val) == -1;
                })
                populateActivities(unselectedActivities, "#unselected");
                populateActivities(selectedActivities, "#selected");
            }
        });

    }

    $("#datepicker").attr("value", selectedDate);
    $("#datepicker").click("on", function () {
        $(this).datepicker({
            onSelect: function (date) {
                // $("#showDate").html("Selected Date: " + date);
                //Global variable to store date
                selectedDate = date;
                loadDate(selectedDate);
            },
            selectWeek: true,
            inline: true,
            startDate: '01/01/2000',
            firstDay: 1,
            setDate: new Date()
        }).datepicker("show");

        // alert(selectedDate);
    });

    /////////////////////////////////////////////////////////////
    //////*Make Survey Selections Pretty with selectmenu/////////
    ///// JQUERY UI PLUGIN (Mental, Physical, Psychological*/////
    $( "#physical" ).selectmenu({width:70});
    $( "#mental" ).selectmenu({width:70});
    $( "#psychological" ).selectmenu({width:70});

    //Add activity buttons to #activities from activities array
    function populateActivities (activities, div) {
        var $activityHTML = "";

        //Populates introductory text above #unselected & #selected based on which div is being filled with activities
        if (div === "#unselected") {
            $activityHTML += "<span>Please select at least 5 acitivities that you performed today:</span>"
        } else if (div === "#selected") {
          $activityHTML += "<span>Selected Activities:</span>"
        }

        if ($("#selected").text() == 'Selected Activities') {
            this.append("<span>Selected Activities</span");
        }

        console.log($("#selected").text());

        // Cycle through activity array and display to page as bootstrap buttons
        for (var i = 0; i < activities.length; i++) {
                var randColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
                $activityHTML +=
                ('<button type="button" class="btn btn-warning style=" style="color:black;background-color:' + randColor
                  + '">' + activities[i] + '</button>')
        }

        $(div).append($activityHTML);
    }

    /* Sorting database data by date, and conveying to ChartsJS */

    // Get & Return dates to function chart()
    function getActivities(data) {
        var activities = [];
        var activitiesArray = [];

        for (item in data) {
            activitiesArray.push(data[item]);
        }

        activitiesArray.sort(function(a,b) {
            return new Date(a.date).getTime() - new Date(b.date).getTime()
        });

        for (object in activitiesArray) {
            activities.push(activitiesArray[object].activities)
        }

        return activities;
    }

    // Sort dates in ascending order (oldest --> newest) to be fed into chart
    function getDates(data) {
        var dates = [];
        for (val in data) {
            dates.push(data[val].date);
        }

        // Sort Dates in Ascending Order (Oldest --> Newest). Replaces in place, yay!.
        dates.sort(function(a,b) {
            return new Date(a).getTime() - new Date(b).getTime()
        });

        return dates;
    }

    //Get & Return Survey Data for Chart
    function getSurvey(data, surveyIndex) {
        var survey = [];
        dataArray = [];

        for (item in data) {
            dataArray.push(data[item]);
        }

        dataArray.sort(function (a,b) {
            return new Date(a.date).getTime() - new Date(b.date).getTime()
        });

        for (object in dataArray) {
            survey.push(dataArray[object].survey[surveyIndex]);
        }
        return survey;
    }

    function getHappiness(data,index) {
      var scoreArray = [];
      var counter = 0;
      var score = 0;
        for (items in myActivities) {
            for (date in data) {
                if ((data[date].activities).indexOf(myActivities[items]) != -1) {
                    counter += 1;
                    score += parseInt(data[date].survey[index]);
                    console.log(data[date].survey[index])
                } else {console.log("N/A")}
            }
            console.log(myActivities[items], score, counter, score/counter);
            scoreArray.push(parseInt(score/counter));
            counter = 0;
            score = 0;
        }

        console.log(scoreArray);
        return (scoreArray)
    }


    //Draw Chart with data from myDay object
    function chart (data) {
        //chartJS : httpss://www.chartjs.org/docs/#line-chart
        var activities = getActivities(data);

        var ctx = document.getElementById('myChart').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: getDates(data),
                //Object.keys(myDay)
                datasets: [{
                    label: 'Mental',
                    data: getSurvey(data, 0),
                    // data: getChartData(myDay, 0),
                    backgroundColor: "rgba(51,51,51,0.4)"
                }, {
                    label: 'Physical',
                    data: getSurvey(data, 1),
                    backgroundColor: "rgba(244,235,66,0.4)"
                },
                    {
                    label: 'Psychological',
                    data: getSurvey(data, 2),
                    backgroundColor: "rgba(66,244,69,0.4)"
                  }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Your Daily Life Log'
                },
                tooltips: {
                    callbacks: {
                        // Custom Tooltip Labels with Activities for every particular day added
                        label: function(tooltipItems, labelData) {
                            return labelData.datasets[tooltipItems.datasetIndex].label + '\n' + ': ' + tooltipItems.yLabel + "  (" + activities[tooltipItems.index].join(',\n ') + ")";
                        }
                    }
                }
            }
        });
    }


    function chart2 (data) {
        //chartJS : httpss://www.chartjs.org/docs/#line-chart
        var activities = getActivities(data);

        var ctx = document.getElementById('myChart2').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: myActivities,
                //Object.keys(myDay)
                datasets: [{
                    label: 'Mental',
                    data: getHappiness(data, 0),
                    // data: getChartData(myDay, 0),
                    backgroundColor: "rgba(51,51,51,0.4)"
                }, {
                    label: 'Physical',
                    data: getHappiness(data, 1),
                    backgroundColor: "rgba(244,235,66,0.4)"
                },
                    {
                    label: 'Psychological',
                    data: getHappiness(data, 2),
                    backgroundColor: "rgba(66,244,69,0.4)"
                  }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Average Happiness By Activity'
                },
                tooltips: {

                }
            }
        });
    }


    // Initial GET request for user database & loading of activity buttons
    getData();
    populateActivities(myActivities, "#unselected");


    //Add new day (date, activities, survey) to database
    function addNewDay(date, activities, surveyArray) {
        console.log(activities);
        var sendInfo = {
            "date": date,
            "activities": activities,
            "survey": surveyArray
        };

        console.log( sendInfo.date);
        console.log( sendInfo.activities);
        console.log( sendInfo.survey);

        // Get all existing database records, and search for date match
        $.get("/db/", function(data, textStatus, jqXHR) {
            var isMatch = false;
            data.forEach(function (val) {
                // If new date and existing date match, pass id (idMatch) to function (put)
                if (val.date == sendInfo.date) {
                    isMatch = true;
                    idMatch = (val._id);
                }
            });

            // If Record date of request doesn't match existing date, post to database. Otherwise, use put request to update
            console.log(isMatch);

            if (!isMatch) {post();} else {put(idMatch);}
        });


        //Sends a post request to app.post code in routes/index.js
        function post() {
            var posting = $.ajax({
              url: "https://lifelogs.herokuapp.com/db/",
              // async: false,
              crossOrigin: true,
              type: "POST",
              dataType: 'application/json',
              data: {
                  date: sendInfo.date,
                  activities: JSON.stringify(sendInfo.activities),
                  survey: JSON.stringify(sendInfo.survey)}
            }).always(function (data,textStatus,jqXHR) {
                console.log(data,textStatus,jqXHR);
                console.log("SUCCESSFUL POSTING?");
            });

            getData();
        }

        /* Updates selected existing record, accessed via id (idMatch).
        Weirdly, I don't have same issue as POST request, despite nearly identical code... */
        function put(idMatch) {
                jQuery.ajax({
                    url: "/db/" + idMatch,
                    type: "PUT",
                    data: {
                        date: sendInfo.date,
                        activities: JSON.stringify(sendInfo.activities),
                        survey: JSON.stringify(sendInfo.survey)
                    },
                    success: function (data, textStatus, jqXHR) {
                      console.log(data);
                      getData();
                    }
                });
        }
    }

    /* CLICK EVENTS */
    //Home Page Click Events

    /*On Submit button click, collect selected activities & survey scores, and push
    to addNewDay function, which will perform POST */
    $("#submit").click('on', function (e) {
        var activities = [];
        var surveyArray = [];

        //Prevent default action
        e.preventDefault();

        //Retrieves text in all *selected* activity buttons and assigns to array to be passed to addNewDay function
        $("#selected").children("button").each(function (index, value) {
            activities[index] = $(this).text();
        });

        $("#surveys").children(".ui-selectmenu-button").each(function (index,val) {
            surveyArray.push($(this).children().text());
        });

        //Add user input (Date, Activities, and Surveys to Mongo Document)
        addNewDay(selectedDate, activities, surveyArray);
    });


    //When button in #activity div, move to other subDiv    #unselected <---> #selected
    $(document).on('click', "#activities button", function () {
        $(this).parent().siblings().append(this);
    });


});
