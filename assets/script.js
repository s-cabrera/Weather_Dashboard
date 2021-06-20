/*------  Variables  -------- */
var sideBarEl = $('#sidebar');
var myAlert = $('.alert');
var dailyEl = $('#daily');
var fiveDaysContainerEl =$('#five-days-container');
var fiveDaysEl = $('#five-days');
var fiveDaysHeaderEl = $('#five-days-header');
var date = moment().format("dddd, MMMM Do YYYY");
var dateUnix = moment().unix();

var sidebarArray;

//localStorage.clear();
onload();

function renderSidebarItem(city, icon){
    var listItem = $('<li>');
    var a = $('<a class="nav-link text-white" style="cursor:pointer;">');
    var image = $(`<image width="50px" height="50px" src="http://openweathermap.org/img/wn/${icon}@2x.png"/>`);
    var span = $('<span>');
    span.text(city);
    listItem.attr('city', city);
    image.attr('city', city);
    a.attr('city', city);
    span.attr('city', city);

    a.append(image);
    a.append(span);
    listItem.append(a);
    sideBarEl.append(listItem);
}

function onload(){
    console.log(localStorage);
    var input = JSON.parse(localStorage.getItem('sidebar'));
    if(input == null){
        sidebarArray = Array(0);
        console.log("Nothing in local storage");
    }
    else{
        sidebarArray = input;
        for(let i = 0; i < sidebarArray.length; i++){
            renderSidebarItem(sidebarArray[i].city, sidebarArray[i].icon);
        }
    }
    
}

function uviColor(uvi){
    if(uvi >= 8){return "red";}
    else if(uvi >= 6){return "orange";}
    else if(uvi >= 3){return "yellow";}
    else{return "green";}
}

function renderCurrentForecast(city, temp, wind, humidity, uvi){
    //Add border to the div
    dailyEl.addClass('daily');
    
    //Create elements
    var cityEl = $('<h2>');
    var tempEl = $('<p>');
    var windEl = $('<p>');
    var humidityEl = $('<p>');
    var uviEl = $('<p>');
    var uviSpanEl = $('<span>');

    //Style them
    cityEl.text(`${city} (${date})`);
    tempEl.text(`Temp: ${temp} °F`);
    windEl.text(`Wind: ${Math.floor(wind)} MPH`);
    humidityEl.text(`Humidity: ${humidity} %`);
    uviEl.text(`UV Index: `);
    uviSpanEl.text(uvi);
    uviSpanEl.css({'padding':'4px','margin-left':'5px','color':'black', 'background': uviColor(uvi)})

    //Append them
    dailyEl.append(cityEl);
    dailyEl.append(tempEl);
    dailyEl.append(windEl);
    dailyEl.append(humidityEl);
    dailyEl.append(uviEl);
    uviEl.append(uviSpanEl);


}

function renderFiveDayForecast(day, temp, wind, humidity, icon){
    
    //Create elements
    var singleDayEl = $('<div>');
    var dayEl = $('<h5>');
    var iconEl = $(`<image width="50px" height="50px" 
    src="http://openweathermap.org/img/wn/${icon}@2x.png"/>`);
    var tempEl = $('<p>');
    var windEl = $('<p>');
    var humidityEl = $('<p>');

    //Style them
    singleDayEl.addClass('single_forecast');
    dayEl.text(day);
    tempEl.text(`Temp: ${temp} °F`);
    windEl.text(`Wind: ${Math.floor(wind)} MPH`);
    humidityEl.text(`Humidity: ${humidity} %`);

    //Append them
    fiveDaysEl.append(singleDayEl);
    singleDayEl.append(dayEl);
    singleDayEl.append(iconEl);
    singleDayEl.append(tempEl);
    singleDayEl.append(windEl);
    singleDayEl.append(humidityEl);
}

function callWeatherAPI(lat, lon, city){
    var requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=cad244ae874e38b72816daf9b6f1a70f` 
    fetch(requestUrl)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log('Fetch Response \n-------------');
        console.log(data);
        // console.log(`${city} (${date})`);
        // console.log(`Temp: ${data.current.temp} °F`);
        // console.log(`Wind: ${data.current.wind_speed} MPH`);
        // console.log(`Humidity: ${data.current.humidity} %`);
        // console.log(`UV Index: ${data.current.uvi}`);
        // console.log(`Current weather icon code: ${data.current.weather[0].icon}`);
        
        console.log(sidebarArray);
        //console.log(`Is it the list? : ${sidebarArray.includes(city)}`);
        var sidebarFlag = false;
        for(let i = 0; i < sidebarArray.length; i++){
            if(sidebarArray[i].city === city){
                sidebarFlag = true;
            }
        }

        if(!sidebarFlag){
            renderSidebarItem(city, data.current.weather[0].icon);
            var sidebarObj = {
                city: city,
                icon: data.current.weather[0].icon                
            } 
            sidebarArray.push(sidebarObj);
            localStorage.clear();
            localStorage.setItem('sidebar', JSON.stringify(sidebarArray));
            console.log(sidebarArray);
        }
        //Render the current forecast
        renderCurrentForecast(city, data.current.temp, data.current.wind_speed, 
        data.current.humidity, data.current.uvi);
        
        //Add text to 5-Day Forecast header
        fiveDaysHeaderEl.text("5 Day Forecast");

        //Loop to generate the 5 day forecast
        for(let i = 1; i < 6; i++){
            console.log(`Day: ${moment.unix(data.daily[i].dt).format("dddd")}`);
            renderFiveDayForecast(moment.unix(data.daily[i].dt).format("dddd"), data.daily[i].temp.max, data.daily[i].wind_speed, 
                data.daily[i].humidity, data.daily[i].weather[0].icon);
        }
        

    });
}

function callLongLatAPI(city){
    if(city.length == 0){return;}
    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=cad244ae874e38b72816daf9b6f1a70f`;
    fetch(requestUrl)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
    console.log('Fetch Response \n-------------');
    console.log(`callWeatherAPI(${data.coord.lon}, ${data.coord.lat})`)
    if(data != null){
        callWeatherAPI(data.coord.lat, data.coord.lon, data.name);
    }
    });
}

var searchBtnEventHandler = function(event){
    console.log($("input[aria-label='city']").val());
    if($("input[aria-label='city']").val().length === 0){
        console.log("Display alert");

        myAlert.css("display","block");
        return;
    }
    dailyEl.removeClass('daily');
    fiveDaysHeaderEl.text("");
    fiveDaysEl.empty();
    dailyEl.empty();
    callLongLatAPI($("input[aria-label='city']").val());
}

var sidebarBtnHandler = function(event){
    console.log(`Cliked ${$(event.target).attr('city')} link!!!`);
    dailyEl.removeClass('daily');
    fiveDaysHeaderEl.text("");
    fiveDaysEl.empty();
    dailyEl.empty();
    callLongLatAPI($(event.target).attr('city'));
}

var closeAlertHandler = function(){
    console.log("Close alert");
    myAlert.close();
}

var displayNone = function(){
    myAlert.css("display","none");
}



$('#button-addon2').on('click', searchBtnEventHandler);
myAlert.on('closed.bs.alert', displayNone);
sideBarEl.on('click', $("[city]"), sidebarBtnHandler)