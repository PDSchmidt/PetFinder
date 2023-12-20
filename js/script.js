function initMap() {}
$(document).ready(function () {
    // Some variables to use
    var pupurl = "https://random.dog/woof.json";
    var adviceurl = "https://api.adviceslip.com/advice";
    var dogNames;
    var dogType;
    var index;
    var service;
    var map;
    var infowindow;

    updatePicture();
    initMap();

    // Attach some functionality to the buttons
    // First Tab
    $("#newpupbutton").on("click", function () {
        updatePicture($(this));
    });
    $("#newQuoteButton").on("click", function () {
        updateQuote();
    });
    //Second Tab
    $("#updateRec").on("click", function () {
        getRecomended();
    });
    $('#nextButton').on("click", function () {
        nextRight();
    })
    $('#prevButton').on("click", function () {
        nextLeft();
    })
    //Third Tab
    $('#changeZip').click(function () {
        const input = Number($('#zipInput').val());
        // console.log(input);
        if(!isNaN(input) && input.toString().length == 5) {
            updateMap();
        } else {
            alert("Enter a valid 5-digit US Postal Code");
        }
    });


    // LINES 48-134 POPULATING THE INITIAL STATE OF THE WEBSITE
    $.get(adviceurl)
        .done(function (data) {
            // console.log(data);
            var hope = JSON.parse(data);
            // console.log(hope);
            // console.log(hope.slip.advice);
            var adviceTag = $('#adviceTag');
            adviceTag.html(hope.slip.advice);
            // console.log(adviceTag.html());
        })
        .fail(function (jqXHR) {
            alert("Error: " + jqXHR.status);
        });
    // Populating a list of 50 names pulled from Seattle's pet database for use in the first tab (authors of advice)
    $.ajax({
        url: "https://data.seattle.gov/resource/jguv-t9rb.json?species=Dog",
        type: "GET",
        data: {
            "$limit" : 50,
            "$$app_token" : "kw8G9BT4fEoYta0DMpvazHe2A"
        }
        })
            .done(function(data) {
                // console.log("Retrieved " + data.length + " records from the dataset!");
                // console.log(data);
                dogNames = data;
                const chosenName = dogNames[Math.floor(Math.random() * dogNames.length)].animal_s_name;
                // console.log(chosenName);
                var adviceGiver = $('#adviceGiver');
                adviceGiver.html(chosenName);
            })
            .fail(function (jqXHR) {
                alert("Error: " + jqXHR.status);
            });
    // Populating the first pup report card with information about chihuahuas pulled from api-ninjas dog api
    $.ajax({
        method: 'GET',
        url: 'https://api.api-ninjas.com/v1/dogs?name=chihuahua',
        headers: { 'X-Api-Key': 'TaqpDsFz3yAUnjGForqLsg==tRg4Py3gvU8Y3eiE'},
        contentType: 'application/json',
        success: function(result) {
            // console.log(result);
            dogType = result;
            index = 0;
            updateRecomended();
        },
        error: function ajaxError(jqXHR) {
            console.error('Error: ', jqXHR.responseText);
        }
    });
    // Initializing the first state of the map from google's api, populating with pins of 'pet adoption' search return
    function initMap() {
        infowindow = new google.maps.InfoWindow();
        map = new google.maps.Map(
            document.getElementById('map'),
            {
                center: {lat: 47.1474103, lng: -122.3239889},
                zoom: 10,
                styles: [
                    // Map is very busy with the auto-generated pins, so turned them off
                    {
                      featureType: "poi",
                      stylers: [{ visibility: "off" }],
                    },
                  ]
            });
        var request = {
            location: {lat: 47.1474103, lng: -122.3239889},
            radius: '500',
            query: 'pet adoption'
        };
        service = new google.maps.places.PlacesService(map);
        // Search for poi's with the keywords 'pet adoption'
        service.textSearch(request, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    // console.log(results[i]);
                    service.getDetails({placeId:results[i].place_id},function(PlaceResult, status){
                        createMarker(PlaceResult);
                        // console.log(PlaceResult);
                     });
                }
                map.setCenter(results[0].geometry.location);
            }
        });
    }

    // FUNCTIONS TO USE IN THE FIRST TAB (DOG ADVICE)-----------------------------------------------------------------------  

    // Generates a new picture for the first tab. Continues to consume the api until a link is returned that doesn't contain the
    // 'mp4' extension because they sometimes won't work in the browser.
    function updatePicture() {
        $.get(pupurl)
            .done(function (data) {
                var pupImg = $('#dogphoto');
                const newLink = data.url;
                // console.log(newLink);
                if (!newLink.includes('mp4')) {
                    pupImg.prop('src', newLink);
                } else {
                    updatePicture();
                }
            })
            .fail(function (jqXHR) {
                alert("Error: " + jqXHR.status);
            });
    }
    // Updates the generated Quote on the first tab using the advice api
    function updateQuote() {
        $.get(adviceurl)
            .done(function (data) {
                // console.log(data);
                var hope = JSON.parse(data);
                // console.log(hope);
                // console.log(hope.slip.advice);
                var adviceTag = $('#adviceTag');
                adviceTag.html(hope.slip.advice);
                const chosenName = dogNames[Math.floor(Math.random() * dogNames.length)].animal_s_name;
                console.log(chosenName);
                var adviceGiver = $('#adviceGiver');
                adviceGiver.html(chosenName);
                // console.log(adviceTag.html());
            })
            .fail(function (jqXHR) {
                alert("Error: " + jqXHR.status);
            });
    }

    // FUNCTIONS TO USE IN SECOND TAB (DOG RECOMMENDATIONS)---------------------------------------------------------

    // Updates the recommended dog report card based on the index of the array of recommendations that are populated
    function updateRecomended() {
        $('#dogrecphoto').prop('src', dogType[index].image_link);
        $('#shedding').prop('value', dogType[index].shedding);
        $('#barking').prop('value', dogType[index].barking);
        $('#energy').prop('value', dogType[index].energy);
        $('#protectiveness').prop('value', dogType[index].protectiveness);
        $('#trainability').prop('value', dogType[index].trainability);

        $('#breed').html(dogType[index].name);
        $('#life').html(dogType[index].min_life_expectancy + ' to ' + dogType[index].max_life_expectancy + ' yrs');
        $('#weight').html(dogType[index].min_weight_male + ' to ' + dogType[index].max_weight_male + ' lbs');
        $('#height').html(dogType[index].min_height_male + ' to ' + dogType[index].max_height_male + ' inches');

        $('#coat').html(dogType[index].coat_length);
        $('#shedding2').html(dogType[index].shedding);
        $('#drooling').html(dogType[index].drooling);

        $('#energy2').html(dogType[index].energy);
        $('#barking2').html(dogType[index].barking);
        $('#playfulness').html(dogType[index].playfulness);
        $('#protectiveness2').html(dogType[index].protectiveness);

        $('#children').html(dogType[index].good_with_children);
        $('#otherDogs').html(dogType[index].good_with_other_dogs);
        $('#strangers').html(dogType[index].good_with_strangers);
    }
    // Uses the slider values to make an api request to the api-ninja dogs api to generate a response
    // Then stores the dog breeds that meet that criteria in an array that can be navigated through
    function getRecomended() {
        var paramURL = 'https://api.api-ninjas.com/v1/dogs?';
        paramURL += 
                    'shedding=' + $('#shedding').prop('value')
                    +'&barking=' + $('#barking').prop('value')
                    +'&energy=' + $('#energy').prop('value')
                    +'&protectiveness=' + $('#protectiveness').prop('value')
                    + '&trainability=' + $('#trainability').prop('value');
        $.ajax({
            method: 'GET',
            url: paramURL,
            headers: { 'X-Api-Key': 'TaqpDsFz3yAUnjGForqLsg==tRg4Py3gvU8Y3eiE'},
            contentType: 'application/json',
            success: function(result) {
                // console.log(paramURL);
                // console.log(result);
                if (result.length > 0) {
                    dogType = result;
                    index = 0;
                    updateRecomended();
                    updateNavButtons();
                } else {
                    alert("No dogs matching criteria");
                }
            },
            error: function ajaxError(jqXHR) {
                console.error('Error: ', jqXHR.responseText);
            }
        })
    }
    // Based on the number of candidate dogs returned and the position in the array, dissable or enable the
    // buttons so we don't try to access and index that's out of bounds.
    function updateNavButtons() {
        if(index + 1 >= dogType.length) {
            $('#nextButton').prop('disabled', true);
        } else {
            $('#nextButton').prop('disabled', false);
        }
        if(index == 0) {
            $('#prevButton').prop('disabled', true);
        } else {
            $('#prevButton').prop('disabled', false);
        }
    }
    // Navigate to next dog candidate
    function nextRight() {
        if (index + 1< dogType.length) {
            index++;
            updateRecomended();
            updateNavButtons();
        }
    }
    // Navigate to the previous dog candidate
    function nextLeft() {
        if (index - 1 >= 0) {
            index--;
            updateRecomended();
            updateNavButtons();
        }
    }

    // FUNCTIONS TO USE IN THIRD TAB (MAP)------------------------------------------------------------------------

    // Function to call to update the map using a postal code from the User
    function updateMap() {
        var locReq = 'https://maps.googleapis.com/maps/api/geocode/json?address='
                    + $('#zipInput').val() // Where the Zip is held on the webpage
                    + '&key=AIzaSyBddz5EchHxoPdqlZ_FGKMjjDch7fcOpW4';
        // console.log(locReq);
        var geoData;
        // Have to turn the zip into lattitude/longitude using the geocode api
        $.get(locReq, function(data) {
            // console.log(data);
            geoData = data;
            // console.log("GEODATA: ");
            // console.log(geoData.results[0].geometry.location);
            if (data.results.length == 0) {
                alert("Zero Results Found");
                return;
            }
            var locationlatlong = geoData.results[0].geometry.location;
            var request = {
                location: locationlatlong,
                radius: '500',
                query: 'pet adoption'
            };
            service = new google.maps.places.PlacesService(map);
            // Search for Palces of Interest using the keywords 'pet adoption' centered around the new lat/long
            service.textSearch(request, function(results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                        // console.log(results[i]);
                        service.getDetails({placeId:results[i].place_id},function(PlaceResult, PlacesServiceStatus){
                            createMarker(PlaceResult);
                            // console.log(PlaceResult);
                        });
                    }
                    map.setCenter(results[0].geometry.location);
                }
            });
        })
        
    }
    // Creates markers/pins on the map using the given Google Place object
    function createMarker(place) {
        if (!place.geometry || !place.geometry.location) return;
    
        const marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
        });
        // console.log("Placed " + place.name + " on the map");
    
        google.maps.event.addListener(marker, "click", () => {
        infowindow.setContent(place.name || "");
        infowindow.open(map);
        updateBusinessCard(place);
        });
    }
    // Update the business card information using the Place data associated with the selected pin
    function updateBusinessCard(selected) {
        $('#businessName').html(selected.name);
        $('#businessAddress').html(selected.formatted_address);
        $('#businessPhone').html(selected.formatted_phone_number);
        $('#businessURL').html(selected.website);
    }

});

