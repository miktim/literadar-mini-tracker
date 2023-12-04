/* 
 * LiteRadar Leaflet tracker, MIT (c) 2019-2022 miktim@mail.ru
 * Geolocation watcher
 * See https://w3c.github.io/geolocation-api/#examples
 */
import {options} from './options.js';
import {map} from './map.js';
import {Source} from './objects.js';
import {update, extend} from './util.js';
import {logger} from './logger.js';
import {exchanger} from './exchanger.js';

export var geolocationWatcher = {
    watchId : null,
    interval : null,
    lastSource : new Source({accuracy: 100000}),
    locations : [],

    start(timeout = options.watch, highAccuracy = true) {
        if (!('geolocation' in navigator)) {
            logger.error({
                type: 'locationerror',
                code: 0,
                message: 'Geolocaton API not supported.'
            });
            return;
        }
        if (this.watchId)
            this.stop();
        this.watchId = navigator.geolocation.watchPosition(
                onLocationFound,
                onLocationError,
                {
                    timeout: timeout * 1000,
                    enableHighAccuracy: highAccuracy,
                    maximumAge: 0
                }
        );
        this.interval = setInterval(function (self) {
            if(self.lastSource.latitude)
                self.lastSource.update();
        }, timeout * 1000, this);

    },

    stop() {
        if (this.watchId) {
            clearInterval(this.interval);
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }
};

var onLocationFound = (function (l) {
    var src = update(new Source(), l.coords);
    src.timestamp = l.timestamp;
    if (this.lastSource.accuracy > src.accuracy)
        this.lastSource = src;
}).bind(geolocationWatcher);

var onLocationError = (function (e) {
    logger.error(extend(e,{type:'locationerror'}));
}).bind(geolocationWatcher);
