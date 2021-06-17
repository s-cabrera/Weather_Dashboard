/*
          <li class="nav-item">
            <a href="#" class="nav-link text-white" aria-current="page">
                <i class="fas fa-home bi me-2" width="16" height="16"></i>
                Home
            </a>
          </li>
*/

/*------  Variables  -------- */
var sideBarEl = $('#sidebar');
var myAlert = $('.alert');
var dailyEl = $('#daily');
var forecastEl = $('#five-days');
var date = moment().format("dddd, MMMM Do YYYY");
var dateUnix = moment().unix();

var sidebarArray = Array(0);

function renderSidebarItem(city, icon){
    var listItem = $('<li>');
    var a = $('<a class="nav-link text-white">');
    var image = $(`<image width="50px" height="50px" src="http://openweathermap.org/img/wn/${icon}@2x.png"/>`);
    var span = $('<span>');
    span.text(city);

    sideBarEl.append(listItem);
    sideBarEl.append(a);
    a.append(image);
    a.append(span);
}

function uviColor(uvi){
    if(uvi >= 8){return "red";}
    else if(uvi >= 6){return "orange";}
    else if(uvi >= 3){return "yellow";}
    else{return "green";}
}

function renderDailyForecast(city, temp, wind, humidity, uvi){
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
    windEl.text(`Wind: ${wind} MPH`);
    humidityEl.text(`Humidity: ${humidity} %`);
    uviEl.text(`UV Index: `);
    uviSpanEl.text(uvi);
    uviSpanEl.css({'text-shadow': '2px 2px black',
    'padding':'4px','margin-left':'5px','color':'white', 'background': uviColor(uvi)})

    //Append them
    dailyEl.append(cityEl);
    dailyEl.append(tempEl);
    dailyEl.append(windEl);
    dailyEl.append(humidityEl);
    dailyEl.append(uviEl);
    uviEl.append(uviSpanEl);

    //Put info into object
    var dailyObj = {
        city: city,
        temp: temp,
        wind: wind,
        humidity: humidity,
        uvi: uvi   
    };


    //Push object into array
    sidebarArray.push(dailyObj);
}

function renderFiveDayForecast(day, temp, wind, humidity, icon){
    
    //Create elements
    var singleForecastEl = $('<div>');
    var dayEl = $('<h4>');
    var iconEl = $(`<image width="50px" height="50px" 
    src="http://openweathermap.org/img/wn/${icon}@2x.png"/>`);
    var tempEl = $('<p>');
    var windEl = $('<p>');
    var humidityEl = $('<p>');

    //Style them
    singleForecastEl.addClass('single_forecast');
    dayEl.text(day);
    tempEl.text(`Temp: ${temp} °F`);
    windEl.text(`Wind: ${wind} MPH`);
    humidityEl.text(`Humidity: ${humidity} %`);

    //Append them
    forecastEl.append(singleForecastEl);
    singleForecastEl.append(dayEl);
    singleForecastEl.append(iconEl);
    singleForecastEl.append(tempEl);
    singleForecastEl.append(windEl);
    singleForecastEl.append(humidityEl);
    
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
        console.log(`${city} (${date})`);
        console.log(`Temp: ${data.current.temp} °F`);
        console.log(`Wind: ${data.current.wind_speed} MPH`);
        console.log(`Humidity: ${data.current.humidity} %`);
        console.log(`UV Index: ${data.current.uvi}`);
        console.log(`Current weather icon code: ${data.current.weather[0].icon}`);
        

        renderSidebarItem(city, data.current.weather[0].icon);

        renderDailyForecast(city, data.current.temp, data.current.wind_speed, 
        data.current.humidity, data.current.uvi);
    
        for(let i = 0; i < 5; i++){
            console.log(`Day: ${moment.unix(data.daily[i].dt).format("dddd")}`);
            renderFiveDayForecast(moment.unix(data.daily[i].dt).format("dddd"), data.daily[i].temp.max, data.daily[i].wind_speed, 
                data.daily[i].humidity, data.daily[i].weather[0].icon);
        }
    });
}

function callLongLatAPI(city){
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
    forecastEl.empty();
    dailyEl.empty();
    callLongLatAPI($("input[aria-label='city']").val());
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