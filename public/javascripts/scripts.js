/**
 * Created by thesc on 9/29/2016.
 */

//mongoose = require('mongoose');

//IMPORTANT NOTES FOR LATER
/* Date : {selectedDate} Global Variable */

//GraphJS / FusionCharts

$(document).ready(function () {
    // var app = angular.module("myApp", []);

    // Load initial database data (document: username) & passto chartJS chart
    var getData = function () {$.get("http://localhost:3000/db/", function(data, textStatus, jqXHR) {
        chart(data);
    })};


    var myActivities = ([
          "Exercised", "Watched TV", "Took a Drive", "Worked", "Visited Friends",
          "Swimming", "Basketball", "Video Games"
    ]).sort();

    /////////////////////////////////////////////////////////////
    //////*Run the calendar widget and get date from user*//////
    var today = new Date();
    //Defaults to today's date by creating date object and assigning to value attribute of #datepicker div
    var selectedDate = ("0" + today.getMonth()).slice(-2) + "/" + ("0" + today.getDate()).slice(-2)
                            + "/" + today.getFullYear();

    /* Allow user to view & modify activities selected on other days */
    function loadDate (selectedDate) {

        // Get all db data, then search for specific selected day.
        $.get("http://localhost:3000/db/", function(data, textStatus, jqXHR) {
            var unselectedActivities = [];
            var selectedActivities = [];
            // Search through data to find existing activities for selected date
            for (date in data) {
                console.log(data[date]);
                if (data[date].date === selectedDate) {
                    selectedActivities = data[date].activities;
                }
            }


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

    $("#datepicker").attr("value", new Date());
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

    //Draw Chart with data from myDay object
    function chart (data) {
        //chartJS : http://www.chartjs.org/docs/#line-chart
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



    getData();
    populateActivities(myActivities, "#unselected");


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
              url: "http://localhost:3000/db/",
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

//Retrieve Survey Scores. Any way to refactory, instead of running this for all 3 values?
//        $("#physical-button > span.ui-selectmenu-text").text();

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
