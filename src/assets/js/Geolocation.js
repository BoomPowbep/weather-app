
const Geolocation = {

    getPosition( successCallback, errorCallback ) {

        // const getPositionPromise = new Promise((resolve, reject) => {
        //
        //     if (navigator.geolocation) {
        //         navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        //     } else {
        //         const error = 'Geolocation not supported';
        //     }
        // });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        } else {
            const error = 'Geolocation not supported';
        }
    },

    handleError( error ) {

        switch(error.code) {
            case error.PERMISSION_DENIED:
                return "User denied the request for Geolocation.";
            case error.POSITION_UNAVAILABLE:
                return "Location information is unavailable.";
            case error.TIMEOUT:
                return "The request to get user location timed out.";
            case error.UNKNOWN_ERROR:
                return"An unknown error occurred.";
            default:
                return "Wrong argument.";
        }
    }
};

export default Geolocation;
