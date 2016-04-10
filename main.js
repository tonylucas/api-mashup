// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.

function initAutocomplete() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -33.8688,
            lng: 151.2195
        },
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // [START region_getplaces]
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
            makeWeatherRequest(place.name);
            makeYoutubeRequest(place.geometry.location);
        });


        map.fitBounds(bounds);
    });
    // [END region_getplaces]

}

function onLoadCallback() {
    gapi.client.setApiKey("AIzaSyCmkV7mh-Q4f7xOlhJsSDCjqNnDBzhyeis");
    gapi.client.load('youtube', 'v3');
}

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function makeWeatherRequest(city) {
    var url = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=b2f0443c1e0a7024b0b5f08e8535792c";
    httpGetAsync(url, function (res) {
        var json = JSON.parse(res);
        document.querySelector('.name').innerHTML = json.name;
        document.querySelector('.weatherMain').innerHTML = json.weather[0].main;
        document.querySelector('.temp').innerHTML = 'temperature ' + json.main.temp + ' Kelvin';
        document.querySelector('.pressure').innerHTML = 'pressure ' + json.main.pressure + ' hPa';
        document.querySelector('.humidity').innerHTML = 'Humidity ' + json.main.humidity + '%';
    });
}


function makeYoutubeRequest(location) {
    var request = gapi.client.youtube.search.list({
        part: 'snippet',
        q: $('input#pac-input').val(),
        maxResults: 3,
        type: 'video'
    });

    console.log(document.querySelector('.name').innerHTML);

    request.then(function (response) {
        var videos = response.result.items;

        $('.videos').html('');
        $(videos).each(function (index, video) {
            console.log(video);
            $('.videos').append('<iframe width="560" height="315" src="https://www.youtube.com/embed/' + video.id.videoId + '" frameborder="0" allowfullscreen></iframe>');
        });
        $('.youtube span').html($('input#pac-input').val());
        $('.youtube h1').fadeIn();

    }, function (reason) {
        console.log('Error: ' + reason.result.error.message);
    });
}