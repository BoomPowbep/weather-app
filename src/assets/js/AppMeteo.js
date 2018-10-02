import Geolocation from './Geolocation.js';
import WeatherData from './WeatherData';

const AppMeteo = {

    position : null,
    currentWeather : null,
    forecastWeather : null,

    getGeoloc() {
        Geolocation.getPosition( this.gotGeolocData.bind(this), this.gotGeolocError.bind(this) );
    },

    gotGeolocData( data ) {
        this.position = { lat : data.coords.latitude, long : data.coords.longitude };
        console.log(this.position);
        WeatherData.getDataFromServer( this.position, this.gotWeatherData.bind(this) );
    },

    gotGeolocError( error ) {
        let errorText = Geolocation.handleError(error);
        console.error(errorText);
    },

    gotWeatherData( data ) {
        console.log(data);
    },

    // gotWeatherError( error ) {
    //
    // },
};

AppMeteo.getGeoloc();
