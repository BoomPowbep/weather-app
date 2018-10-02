
const WeatherData = {

    getDataFromServer(position, callback) {

        let xhttp = new XMLHttpRequest();
        document.addEventListener('readystatechange', callback(xhttp));
        let requestAddr = 'https://api.apixu.com/v1/current.json?key=1dc9461bdc1d4464ae2121718180210&lang=fr&q=' + position.lat + ',' + position.long;
        // console.log(requestAddr);
        xhttp.open('GET', requestAddr, true);
        xhttp.send();
    },

    // getCurrentWeather( position ) {
    //
    // },
    //
    // getForecastWeather( position ) {
    //
    // }
};

export default WeatherData;
