const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY, // Optional, if you use a service that requires an API key
  formatter: null, // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

const geocodeAddress = async (address) => {
  try {
    const res = await geocoder.geocode(address);
    return res;
  } catch (error) {
    throw new Error('Geocoding failed: ' + error.message);
  }
};

const reverseGeocode = async (lat, lon) => {
  try {
    const res = await geocoder.reverse({ lat, lon });
    return res;
  } catch (error) {
    throw new Error('Reverse geocoding failed: ' + error.message);
  }
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
};