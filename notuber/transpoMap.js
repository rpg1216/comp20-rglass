var myLat = 0;
var myLng = 0;
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
    zoom: 15,
    center: me,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};
var map;
var infoWindow;
var myUsername = "sIFQBKwb2S";
var myMarker;
var vehicleIcon = "vehicleIcon.png";
var passengerIcon = "passengerIcon.png";
var meIcon = "meIcon.png";
var request;
var url = "https://jordan-marsh.herokuapp.com/rides";

var minDist = 1200;
var meDriver; //used as bool

function initMap() {
    map = new google.maps.Map(document.getElementById("myMap"), myOptions);
    infoWindow = new google.maps.InfoWindow();
    getMyLocation();
}

function getMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            myLat = position.coords.latitude;
            myLng = position.coords.longitude;
            renderMap();
        });
    }
    else {
        alert("Geolocation not supported by web browser!!");
    }
}

function renderMap() {
    me = new google.maps.LatLng(myLat, myLng);
    map.panTo(me);
    myMarker = new google.maps.Marker({
        position: me,
        icon: meIcon,
        map: map,
        title: myUsername
    });
    myMarker.setMap(map);
    makeRequest(myMarker);
}

function makeRequest(me)
{
    request = new XMLHttpRequest;
    request.open("POST", url, true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            data = JSON.parse(request.responseText);
            passengers = data["passengers"];
            showPassengers(passengers);
            vehicles = data["vehicles"];
            showVehicles(vehicles);
            aroundMe = aroundMe(minDist, meDriver);
            setInfoWindow(myMarker, aroundMe);
        }
    }
    request.send("username=" + myUsername + "&lat=" + myLat + "&lng=" + myLng);
}

//means you are a vehicle
function showPassengers(passengers)
{
    if(passengers != null) {
        for (count = 0; count < passengers.length; count++) {
            passenger = passengers[count];
            username = passenger["username"];
            thisLat = passenger["lat"];
            thisLng = passenger["lng"];
            thisPos = {lat: thisLat, lng: thisLng};
            marker = getMarker(thisPos, passengerIcon, username);
            marker.setMap(map); 

            surroundings = getSurroundings(thisPos, username, false);
            setInfoWindow(marker, surroundings);
            thisDist = computeDist(thisPos);
            if(thisDist < minDist) {
                minDist = thisDist;
                minIndex = count;
            }
        }
        meDriver = true;
    }
}

//means you are a passenger
function showVehicles(vehicles)
{
    if(vehicles != null) {
        for (count = 0; count < vehicles.length; count++) {
            vehicle = vehicles[count];
            username = vehicle["username"];
            thisLat = vehicle["lat"];
            thisLng = vehicle["lng"];
            thisPos = {lat: thisLat, lng: thisLng};
            marker = getMarker(thisPos, vehicleIcon, username);
            marker.setMap(map); 

            surroundings = getSurroundings(thisPos, username, true);
            setInfoWindow(marker, surroundings);
            thisDist = computeDist(thisPos);
            if(thisDist < minDist) {
                minDist = thisDist;
                minIndex = count;
            }
        }
        meDriver = false;
    }
}

function setInfoWindow(marker, content)
{
    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(content);
        infoWindow.open(map, this);
    });
}

function computeDist(pos) {
    return google.maps.geometry.spherical.computeDistanceBetween(me,  
                new google.maps.LatLng(pos["lat"], pos["lng"])) * 0.000621371;
}

function getSurroundings(position, username, vehicle)
{
    dist = computeDist(position);
    if(vehicle)
        return "<p>Driver: " + username + "</p><p>Distance from me: " + dist + " miles</p>";
    else
        return "<p>Passenger: " + username + "</p><p>Distance from me: " + dist + " miles</p>";
}

function aroundMe(dist, vehicle)
{
    if(dist == 1200 && vehicle != true)
        return "<p>There are no available drivers at the moment.</p>";
    if(dist == 1200 && vehicle == true)
        return "<p>There are no available passengers at the moment.</p>";
    if(vehicle) 
        return "<p>My Username: " + myUsername + 
        "</p><p>Closest passenger is " + dist + " miles away.</p>";
    if(!vehicle)
        return "<p>My Username: " + myUsername + 
        "</p><p>Closest driver is " + dist + " miles away.</p>";
}

function getMarker(pos, Icon, title)
{
    return new google.maps.Marker({position: pos, icon: Icon, 
                                                    map: map, title: title});
}