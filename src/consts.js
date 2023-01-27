const mockGeocodeResponse = `/**/_xdc_._loxntf && _xdc_._loxntf( {
    "plus_code" : {
       "global_code" : "87C8P27Q+MCM"
    },
    "results" : [
       {
          "address_components" : [
             {
                "long_name" : "87C8P27Q+MC",
                "short_name" : "87C8P27Q+MC",
                "types" : [ "plus_code" ]
             }
          ],
          "formatted_address" : "87C8P27Q+MC",
          "geometry" : {
             "bounds" : {
                "northeast" : {
                   "lat" : 38.71425,
                   "lng" : -73.96137499999999
                },
                "southwest" : {
                   "lat" : 38.714125,
                   "lng" : -73.9615
                }
             },
             "location" : {
                "lat" : 38.714224,
                "lng" : -73.96145199999999
             },
             "location_type" : "GEOMETRIC_CENTER",
             "viewport" : {
                "northeast" : {
                   "lat" : 38.7155364802915,
                   "lng" : -73.96008851970849
                },
                "southwest" : {
                   "lat" : 38.71283851970851,
                   "lng" : -73.96278648029151
                }
             }
          },
          "place_id" : "GhIJWAIpsWtbQ0ARHyv4bYh9UsA",
          "plus_code" : {
             "global_code" : "87C8P27Q+MC"
          },
          "types" : [ "plus_code" ]
       }
    ],
    "status" : "OK"
 }
  )`;

const apiHeaders = {
    accept: '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'sec-ch-ua': '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'script',
    'sec-fetch-mode': 'no-cors',
    'sec-fetch-site': 'cross-site',
};

const geocodingRequest = (city) => {
    const { geocodeUrl } = city;
    return {
        url: geocodeUrl,
        userData: city,
        headers: apiHeaders,
    };
};

export {
    mockGeocodeResponse,
    geocodingRequest,
};
