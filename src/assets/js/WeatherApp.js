/****************************
 *
 * 'p_' prefix means private
 *
 ****************************/

import Chart from 'chart.js';
import Utils from './Utils';

class WeatherApp {

    /**
     * Constructor
     * Initiates the app
     */
    constructor() {
        /**
         * Possible values (after first call) :
         * - position
         * - favorited
         * - unfavorited
         *
         * @type {string}
         */
        this.p_adjacentIconStatus = '';

        /**
         * Contains data about the selected city
         * @type {{name: string, lat: string, long: string}}
         */
        this.p_currentCity = {
            name: '',
            lat: '',
            long: ''
        };

        this.p_getFavorites();

        Utils.registerAll(document.querySelectorAll('.addToFavorites'), 'mousedown', this.p_addToFavorites.bind(this));
        Utils.registerAll(document.querySelectorAll('.favorited'), 'mousedown', this.p_removeFromFavorites.bind(this));

        /********************/
        // Load a saved city data
        let savedCities = document.querySelectorAll('.savedCity');
        let iterator = null;
        for(iterator of savedCities) {
            console.log(iterator);
            let data = iterator.querySelector('input');
            iterator.addEventListener('mousedown', () => { this.p_loadSavedCity(data.value) });
        }
        /********************/

        document.querySelector('#editCity').addEventListener('mousedown', this.p_editCity.bind(this));
        document.querySelector('#backToWeather').addEventListener('mousedown', this.p_backToWeather.bind(this));
        document.querySelector('#searchInput').addEventListener('keyup', this.p_handleAutoCompletion.bind(this));
    }

    /**
     * Starts the app
     * Gets position
     */
    startApp() {
        if (navigator.geolocation) {
            console.log("trying to get position");
            navigator.geolocation.getCurrentPosition(this.p_successPosition.bind(this), this.p_errorPosition.bind(this));
        }
    }

    /**
     * 'get position' success callback
     * @param position
     */
    p_successPosition(position) {
        console.log("got position");
        console.log(position);
        this.p_adjacentIconStatus = 'position';
        document.querySelector('#appLoading').style.display = 'none';
        document.querySelector('#appWeather').style.display = 'flex';
        // Utils.fadeOut(document.querySelector('#appLoading'));
        // Utils.fadeIn(document.querySelector('#appWeather'), 'flex');
        this.p_getWeatherData(position.coords.latitude, position.coords.longitude);
    }

    /**
     * 'get position' error callback
     * @param error
     */
    p_errorPosition(error) {

        console.log("error position");

        let errorDOM = document.querySelector('#appLoading h1');
        let errorText = '';

        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorText = "User denied the request for Geolocation.";
                console.log(errorText);
                errorDOM.innerHTML = errorText;
                break;
            case error.POSITION_UNAVAILABLE:
                errorText = "Location information is unavailable.";
                console.log(errorText);
                errorDOM.innerHTML = errorText;
                break;
            case error.TIMEOUT:
                errorText = "The request to get user location timed out.";
                console.log(errorText);
                errorDOM.innerHTML = errorText;
                break;
            case error.UNKNOWN_ERROR:
                errorText = "An unknown error occurred.";
                console.log(errorText);
                errorDOM.innerHTML = errorText;
                break;
        }
    }

    /**
     * Gets the weather from the api
     * @param latitude
     * @param longitude
     */
    p_getWeatherData(latitude, longitude) {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                console.log(xhttp);
                this.p_successWeather(JSON.parse(xhttp.responseText), latitude, longitude);
            }
        };
        let requestAddr = 'https://api.apixu.com/v1/forecast.json?key=1dc9461bdc1d4464ae2121718180210&q=' + latitude + ',' + longitude + "&days=8&lang=en";
        console.log(requestAddr);
        xhttp.open('GET', requestAddr, true);
        xhttp.send();
    }

    /**
     * 'get weather' success callback
     * @param weatherData
     * @param latitude
     * @param longitude
     */
    p_successWeather(weatherData, latitude, longitude) {

        this.p_currentCity = {
            name: weatherData.location.name,
            lat: latitude,
            long: longitude
        };

        console.log(this.p_currentCity);

        this.p_fillDOM(weatherData);
    }

    /**
     * Fills the weather data into the DOM elements
     * @param weatherData
     */
    p_fillDOM(weatherData) {
        let city = weatherData.location.name;
        let curTemp = weatherData.current.temp_c;
        let conditionCode = weatherData.current.condition.code;

        console.log(city, curTemp, conditionCode);

        this.p_fillImageAndBackground(conditionCode);

        let forecast = [];

        for (let day of weatherData.forecast.forecastday) {
            // console.log(day.date, day.day.avgtemp_c);
            forecast.push({
                day: day.date.substring(5).replace('-', '/'), // MM/DD
                temp: day.day.avgtemp_c
            });
        }

        forecast.shift(); // Removes the first element of the array, which is the current day

        console.log(forecast);

        this.p_displayAdjacentIcon();
        document.querySelector('#cityName').innerHTML = city;
        document.querySelector('#myLocationSelector h5').innerHTML = city;
        document.querySelector('#currentTemperature').innerHTML = curTemp + '°';
        this.p_buildChart(forecast);
        this.p_backToWeather(); // If the user selected the city from the search bar, back to the weather view
    }

    /**
     * Displays an image and sets a color for the background depending on the weather condition
     * @param conditionCode
     */
    p_fillImageAndBackground(conditionCode) {

        let image = '';
        let cssGradient = '';

        let sunnyHighColor = '#FEC390';
        let sunnyLowColor = '#FDB28F';

        let rainyHighColor = '#7FADC1';
        let rainyLowColor = '#7695AF';

        let stormyHightColor = '#937F9F';
        let stormyLowColor = '#7470A2';

        if (conditionCode === 1000) {
            console.log('sunny');
            image = 'sunny.svg';
            cssGradient = 'linear-gradient(' + sunnyHighColor + ', ' + sunnyLowColor + ')';
        }
        else if (conditionCode === 1003) {
            console.log('partly cloudy');
            image = 'partly-cloudy.svg';
            cssGradient = 'linear-gradient(' + sunnyHighColor + ', ' + rainyLowColor + ')';
        }
        else if (conditionCode === 1006 || conditionCode === 1009 || conditionCode === 1030) {
            console.log('lots of clouds');
            image = 'overcast.svg';
            cssGradient = 'linear-gradient(' + rainyHighColor + ', ' + rainyLowColor + ')';
        }
        else if (conditionCode === 1063 || conditionCode === 1180 || conditionCode === 1183 || conditionCode === 1186 || conditionCode === 1189 || conditionCode === 1192 || conditionCode === 1198 || conditionCode === 1201) {
            console.log('rain');
            image = 'rain.svg';
            cssGradient = 'linear-gradient(' + rainyHighColor + ', ' + rainyLowColor + ')';
        }
        else if (conditionCode === 1195 || conditionCode === 1240 || conditionCode === 1243 || conditionCode === 1246 || conditionCode === 1249 || conditionCode === 1252) {
            console.log('heavy rain');
            image = 'shower.svg';
            cssGradient = 'linear-gradient(' + rainyHighColor + ', ' + rainyLowColor + ')';
        }
        else if (conditionCode === 1066 || conditionCode === 1069 || conditionCode === 1114 || conditionCode === 1117 || conditionCode === 1204 || conditionCode === 1207 || conditionCode === 1210 || conditionCode === 1213 || conditionCode === 1216 || conditionCode === 1219 || conditionCode === 1222 || conditionCode === 1225 || conditionCode === 1237 || conditionCode === 1255 || conditionCode === 1258 || conditionCode === 1261 || conditionCode === 1264) {
            console.log('snow');
            image = 'snow.svg';
            cssGradient = 'linear-gradient(' + stormyHightColor + ', ' + stormyLowColor + ')';
        }
        else if (conditionCode === 1072 || conditionCode === 1135 || conditionCode === 1147 || conditionCode === 1150 || conditionCode === 1153 || conditionCode === 1168 || conditionCode === 1171) {
            console.log('danger');
            image = 'warning.svg';
            cssGradient = 'linear-gradient(' + stormyHightColor + ', ' + stormyLowColor + ')';
        }
        else if (conditionCode === 1087 || conditionCode === 1273 || conditionCode === 1276 || conditionCode === 1282) {
            console.log('storm');
            image = 'storm.svg';
            cssGradient = 'linear-gradient(' + stormyHightColor + ', ' + stormyLowColor + ')';
        }

        document.querySelector('body').style.backgroundImage = cssGradient;
        document.querySelector('#weatherIcon').innerHTML = '<img src="img/weather-icons-svg/' + image + '">';
    }

    /**
     * Displays the right icon next to the city name
     */
    p_displayAdjacentIcon() {

        console.log(this.p_adjacentIconStatus);

        // Hide everything before
        let addFav = document.querySelectorAll('.addToFavorites');
        let removeFav = document.querySelectorAll('.favorited');
        let locIcon = document.querySelectorAll('.localisationIcon');

        Utils.hideAll(addFav);
        Utils.hideAll(removeFav);
        Utils.hideAll(locIcon);

        switch (this.p_adjacentIconStatus) {
            case 'position':
                Utils.showAll(locIcon);
                break;
            case 'favorited':
                Utils.showAll(removeFav);
                break;
            case 'unfavorited':
                Utils.showAll(addFav);
                break;
        }
    }

    /**
     * Builds the forecast line chart
     * @param forecast
     */
    p_buildChart(forecast) {
        // let el = document.querySelector('#bottomSection');
        let ctx = document.querySelector("#forecastChart");
        // ctx.width = el.width;
        // ctx.height = el.height;

        let days = [];
        let temps = [];
        for (let temp of forecast) {
            days.push(temp.day);
            temps.push(temp.temp);
        }

        let data = {
            labels: days,
            datasets: [{
                data: temps,
                borderWidth: 1,
                fill: false,
                borderColor: "#FFFFFF"
            }]
        };

        let options = {
            scales: {
                xAxes: [{
                    display: true,
                    position: 'bottom',
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    display: false,
                    gridLines: {
                        display: false
                    }
                }]
            },
            legend: {
                display: false
            },
            layout: {
                padding: {
                    left: 30,
                    right: 30,
                    top: 30,
                    bottom: 0
                }
            }
        };

        // Define a plugin to provide data labels
        Chart.plugins.register({
            afterDatasetsDraw: function (chart) {
                let ctx = chart.ctx;
                chart.data.datasets.forEach(function (dataset, i) {
                    let meta = chart.getDatasetMeta(i);
                    if (!meta.hidden) {
                        meta.data.forEach(function (element, index) {
                            // Draw the text in black, with the specified font
                            ctx.fillStyle = '#FFFFFF';
                            let fontSize = 17;
                            let fontStyle = 'normal';
                            let fontFamily = 'Quicksand';
                            ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
                            // Just naively convert to string for now
                            let dataString = dataset.data[index].toString() + '°';
                            // Make sure alignment settings are correct
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            let padding = 7;
                            let position = element.tooltipPosition();
                            ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
                        });
                    }
                });
            }
        });

        new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        });
    }

    /**
     * Click on the pen in the weather section
     */
    p_editCity() {
        document.querySelector('#appWeather').style.display = 'none';
        document.querySelector('#searchCity').style.display = 'flex';
    }

    /**
     * Click on the 'x' in the search section
     */
    p_backToWeather() {
        document.querySelector('#appWeather').style.display = 'flex';
        document.querySelector('#searchCity').style.display = 'none';
        document.querySelector('#searchInput').value = '';
        Utils.removeAllChildren('#searchResults');
    }

    /**
     * Auto completion worker
     */
    p_handleAutoCompletion() {

        let searchValue = document.querySelector('#searchInput').value;
        if (searchValue !== '') {
            let xhttp = new XMLHttpRequest();
            xhttp.addEventListener('readystatechange', () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    // console.log(xhttp);

                    Utils.removeAllChildren('#searchResults');

                    let parent = document.querySelector('#searchResults');

                    for (let result of JSON.parse(xhttp.responseText)) {
                        // console.log(result);
                        let suggestion = document.createElement('div');
                        suggestion.classList.add('searchResult');
                        suggestion.innerHTML = result.name;
                        parent.appendChild(suggestion);

                        let hiddenInfo = document.createElement('input');
                        hiddenInfo.classList.add('resultData');
                        hiddenInfo.type = 'hidden';
                        hiddenInfo.value = JSON.stringify(result);
                        suggestion.appendChild(hiddenInfo);
                    }

                    let results = document.querySelectorAll('.searchResult');
                    // console.log(this);
                    for (let i = 0; i < results.length; i += 1) {
                        results[i].addEventListener('mousedown', this.p_selectResult.bind(this, results[i].querySelector('.resultData').value));
                    }
                }
            });
            let requestAddr = 'http://api.apixu.com/v1/search.json?key=1dc9461bdc1d4464ae2121718180210&q=' + searchValue;
            // console.log(requestAddr);
            xhttp.open('GET', requestAddr, true);
            xhttp.send();
        }
        else {
            Utils.removeAllChildren('#searchResults');
        }
    }

    /**
     * Click on a search result
     * @param el
     */
    p_selectResult(el) {
        console.log(el);
        el = JSON.parse(el);
        this.p_adjacentIconStatus = 'unfavorited';
        this.p_getWeatherData(el.lat, el.lon);
    }

    /**
     * Loads a selected saved city data
     * @param data
     */
    p_loadSavedCity(data) {
        console.log(data);
        this.p_adjacentIconStatus = 'favorited';
        data = JSON.parse(data);
        this.p_getWeatherData(data.lat, data.long);
    }

    /**
     * Save the new values to the browser storage
     */
    p_saveToStorage() {

        let storage = localStorage.getItem('saved_cities');

        if (!storage) { // Create new localstorage item
            let dataString = '{"cities":[' + JSON.stringify(this.p_currentCity) + ']}';
            console.log(dataString);
            let dataJSON = JSON.parse(dataString);
            console.log(dataJSON);
            localStorage.setItem('saved_cities', dataString); // Save
        }
        else { // Add the current city to the json object
            let dataJSON = JSON.parse(storage);
            dataJSON.cities.push(this.p_currentCity);
            let dataString = JSON.stringify(dataJSON);
            console.log(dataJSON, dataString);
            localStorage.setItem('saved_cities', dataString); // Save
        }
    }

    /**
     * Gets favorites from the browser storage
     */
    p_getFavorites() {

        let storage = localStorage.getItem('saved_cities');

        if (storage) {

            let dataJSON = JSON.parse(storage);
            let iterator = null;

            // Add favorites to the DOM
            for (iterator of dataJSON.cities) {

                this.p_buildFavorite(iterator);
            }
        }
    }

    /**
     * Adds the current city to the favorites list
     */
    p_addToFavorites() {
        this.p_saveToStorage();

        this.p_buildFavorite(this.p_currentCity); // Adds to the DOM

        this.p_adjacentIconStatus = 'favorited';
        this.p_displayAdjacentIcon();
    }

    /**
     * Adds a favorite to the DOM
     * @param iterator
     */
    p_buildFavorite(iterator) {

        /**
         * <div class="savedCity" id="Lyon">
         <h5>Lyon</h5>
         </div>
         */

        let curElement = document.createElement('div');
        curElement.classList.add('savedCity');
        curElement.id = iterator.name;

        let title = document.createElement("h5");
        let titleText = document.createTextNode(iterator.name);
        title.appendChild(titleText);
        curElement.appendChild(title);

        let data = document.createElement('input');
        data.type = 'hidden';
        data.value = JSON.stringify(iterator);
        curElement.appendChild(data);

        document.querySelector('#savedCities').appendChild(curElement);
    }

    /**
     * Removes the current city from the favorites list
     */
    p_removeFromFavorites() {

        let storage = localStorage.getItem('saved_cities');
        let iterator = null;
        let counter = 0;

        if (storage) {
            let dataJSON = JSON.parse(storage);
            console.log(dataJSON);
            for (iterator of dataJSON.cities) {

                if (iterator.name === this.p_currentCity.name) {

                    delete dataJSON.cities[counter]; // delete element from storage
                    dataJSON.cities.splice(counter); // remove empty location

                    localStorage.setItem('saved_cities', JSON.stringify(dataJSON));

                    this.p_removeFavoriteDOM(this.p_currentCity.name);
                    this.p_adjacentIconStatus = 'unfavorited';
                    this.p_displayAdjacentIcon();
                }
                counter++;
            }
        }
    }

    /**
     * Removes a favorite from the DOM
     * @param name
     */
    p_removeFavoriteDOM(name) {

        document.querySelector('#savedCities').removeChild(document.querySelector('#' + name));
    }
}

export default WeatherApp;
