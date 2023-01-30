## World cities

Initial cities list (199.000+ cities in the world) loaded from `./generated-data/cities500.json` (file parsed from https://download.geonames.org/export/dump/cities500.zip) and only 35Kbytes in size, so file can be used separately and filtered by any of the following:
```
{
	"country": "LA",
	"name": "Savannakhet",
	"lat": "16.5703",
	"lng": "104.7622",
	"state": "20",
	"pop": 125760
}
```
Smaller sizes available online (cities5000.zip and cities15000.zip) for, respectively, cities with population from 5.000 and 15.000 peoples but not in use at the moment (file size is already small enough).

However original data contains only center corrdinates (lat-lng), i.e. https://www.google.com/maps/place/17.41027,104.83068/?hl=en (Thakhek, Laos)

Actor capable to get bouding box per each city. As the matter of fact for any coordinates actor getting https://developers.google.com/maps/documentation/javascript/geocoding#ReverseGeocoding data WITHOUT API key and output added "as is" to the city object.

Short data (without reverse geocoding) saved to KV store as `cities.json` and with `input.geocoding: true` additional full results saved to dataset.

## Input Example
```
{
    "countryCode": "la",
    "populationFrom": 50000,
    "geocoding": true
}
```

## Geocoding
Google Maps API data available for free with public API key, i.e. https://maps.googleapis.com/maps/api/js/GeocodeService.Search?5m2&1d43.03339&2d-80.88302&9sen-US&callback=_xdc_._5phunz&key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&token=69028
Its protected by hashed pair of values: `callback` and `token` and unique per coordinates, so actor getting `geocodeUrl` from google maps client loaded into browser and then doing second run of scraping following geocode URLs.
Google map client trying to protect api data from extraction by following its internal query limit. First limit can be easily reproduced from web UI https://geo-devrel-javascript-samples.web.app/samples/geocoding-reverse/app/dist/ by approx dozen of clicks on "Reverse Geocoding" button, it will lead to error alert `Geocoder failed due to: MapsRequestError: GEOCODER_GEOCODE: OVER_QUERY_LIMIT: The webpage has gone over the requests limit in too short a period  of time.` Actor handles this limit by waiting for `tokenDelaySecs` when necessary. Second linit is when total amount of calls to `google.maps.Geocoder().geocode()` go over 100-150 and needs long time of waiiting, so actor just re-throw exception on this limit to reload page (atm looks like its best approach in terms of performance). Actor blocking actual calls to Google API from web page so mentioned limits are client side and never trackable to Google.

## Output example
```
{
	"country": "LA",
	"name": "Thakhèk",
	"lat": "17.41027",
	"lng": "104.83068",
	"state": "15",
	"pop": 85000,
	"geocodeUrl": "https://maps.googleapis.com/maps/api/js/GeocodeService.Search?5m2&1d17.41027&2d104.83068&9sen-US&callback=_xdc_._ndg4q8&key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&token=11008",
	"plus_code": {
		"compound_code": "CR6J+473 Thakhek, Laos",
		"global_code": "7P96CR6J+473"
	},
	"results": [
		{
			"address_components": [
				{
					"long_name": "Laos",
					"short_name": "LA",
					"types": [
						"country",
						"political"
					]
				},
				{
					"long_name": "Thakhek",
					"short_name": "Thakhek",
					"types": [
						"locality",
						"political"
					]
				},
				{
					"long_name": "Khammouane Province",
					"short_name": "Khammouane Province",
					"types": [
						"administrative_area_level_1",
						"political"
					]
				}
			],
			"formatted_address": "13Thakhek Thakhek, Laos",
			"geometry": {
				"location": {
					"lat": 17.4103088,
					"lng": 104.8300839
				},
				"location_type": "GEOMETRIC_CENTER",
				"viewport": {
					"northeast": {
						"lat": 17.4116577802915,
						"lng": 104.8314328802915
					},
					"southwest": {
						"lat": 17.4089598197085,
						"lng": 104.8287349197085
					}
				}
			},
			"place_id": "ChIJqUqC9UYJPDERjuvDex2F2yw",
			"plus_code": {
				"compound_code": "CR6J+42 Thakhek, Laos",
				"global_code": "7P96CR6J+42"
			},
			"types": [
				"car_repair",
				"establishment",
				"point_of_interest"
			]
		},
		{
			"address_components": [
				{
					"long_name": "CR6H+6WX",
					"short_name": "CR6H+6WX",
					"types": [
						"plus_code"
					]
				},
				{
					"long_name": "Main Road",
					"short_name": "Main Rd",
					"types": [
						"route"
					]
				},
				{
					"long_name": "Thakhek",
					"short_name": "Thakhek",
					"types": [
						"locality",
						"political"
					]
				},
				{
					"long_name": "Khammouane Province",
					"short_name": "Khammouane Province",
					"types": [
						"administrative_area_level_1",
						"political"
					]
				},
				{
					"long_name": "Laos",
					"short_name": "LA",
					"types": [
						"country",
						"political"
					]
				}
			],
			"formatted_address": "CR6H+6WX, Main Rd, Thakhek, Laos",
			"geometry": {
				"bounds": {
					"northeast": {
						"lat": 17.410668,
						"lng": 104.8298563
					},
					"southwest": {
						"lat": 17.4105475,
						"lng": 104.8297303
					}
				},
				"location": {
					"lat": 17.4106075,
					"lng": 104.8297865
				},
				"location_type": "ROOFTOP",
				"viewport": {
					"northeast": {
						"lat": 17.4119567302915,
						"lng": 104.8311422802915
					},
					"southwest": {
						"lat": 17.40925876970849,
						"lng": 104.8284443197085
					}
				}
			},
			"place_id": "ChIJ3yAfQrwIPDERpEIrfVWcGz0",
			"types": [
				"premise"
			]
		},
		{
			"address_components": [
				{
					"long_name": "CR6J+47",
					"short_name": "CR6J+47",
					"types": [
						"plus_code"
					]
				},
				{
					"long_name": "Thakhek",
					"short_name": "Thakhek",
					"types": [
						"locality",
						"political"
					]
				},
				{
					"long_name": "Khammouane Province",
					"short_name": "Khammouane Province",
					"types": [
						"administrative_area_level_1",
						"political"
					]
				},
				{
					"long_name": "Laos",
					"short_name": "LA",
					"types": [
						"country",
						"political"
					]
				}
			],
			"formatted_address": "CR6J+47 Thakhek, Laos",
			"geometry": {
				"bounds": {
					"northeast": {
						"lat": 17.410375,
						"lng": 104.83075
					},
					"southwest": {
						"lat": 17.41025,
						"lng": 104.830625
					}
				},
				"location": {
					"lat": 17.41027,
					"lng": 104.83068
				},
				"location_type": "GEOMETRIC_CENTER",
				"viewport": {
					"northeast": {
						"lat": 17.4116614802915,
						"lng": 104.8320364802915
					},
					"southwest": {
						"lat": 17.4089635197085,
						"lng": 104.8293385197085
					}
				}
			},
			"place_id": "GhIJqYdodAdpMUARPlxy3Ck1WkA",
			"plus_code": {
				"compound_code": "CR6J+47 Thakhek, Laos",
				"global_code": "7P96CR6J+47"
			},
			"types": [
				"plus_code"
			]
		},
		{
			"address_components": [
				{
					"long_name": "Main Road",
					"short_name": "13",
					"types": [
						"route"
					]
				},
				{
					"long_name": "Thakhek",
					"short_name": "Thakhek",
					"types": [
						"locality",
						"political"
					]
				},
				{
					"long_name": "Khammouane Province",
					"short_name": "Khammouane Province",
					"types": [
						"administrative_area_level_1",
						"political"
					]
				},
				{
					"long_name": "Laos",
					"short_name": "LA",
					"types": [
						"country",
						"political"
					]
				}
			],
			"formatted_address": "Main Rd, Thakhek, Laos",
			"geometry": {
				"bounds": {
					"northeast": {
						"lat": 17.4111731,
						"lng": 104.8309062
					},
					"southwest": {
						"lat": 17.4106125,
						"lng": 104.8301745
					}
				},
				"location": {
					"lat": 17.4108928,
					"lng": 104.8305403
				},
				"location_type": "GEOMETRIC_CENTER",
				"viewport": {
					"northeast": {
						"lat": 17.4122417802915,
						"lng": 104.8318893302915
					},
					"southwest": {
						"lat": 17.4095438197085,
						"lng": 104.8291913697085
					}
				}
			},
			"place_id": "ChIJqxUfWbwIPDERPkG8DWAO88g",
			"types": [
				"route"
			]
		},
		{
			"address_components": [
				{
					"long_name": "Thakhek",
					"short_name": "Thakhek",
					"types": [
						"locality",
						"political"
					]
				},
				{
					"long_name": "Khammouane Province",
					"short_name": "Khammouane Province",
					"types": [
						"administrative_area_level_1",
						"political"
					]
				},
				{
					"long_name": "Laos",
					"short_name": "LA",
					"types": [
						"country",
						"political"
					]
				}
			],
			"formatted_address": "Thakhek, Laos",
			"geometry": {
				"bounds": {
					"northeast": {
						"lat": 17.449086,
						"lng": 104.8554897
					},
					"southwest": {
						"lat": 17.3598138,
						"lng": 104.7804737
					}
				},
				"location": {
					"lat": 17.4030206,
					"lng": 104.8337879
				},
				"location_type": "APPROXIMATE",
				"viewport": {
					"northeast": {
						"lat": 17.449086,
						"lng": 104.8554897
					},
					"southwest": {
						"lat": 17.3598138,
						"lng": 104.7804737
					}
				}
			},
			"place_id": "ChIJnQkI67wIPDERwnvMyRigMKY",
			"types": [
				"locality",
				"political"
			]
		},
		{
			"address_components": [
				{
					"long_name": "Khammouane Province",
					"short_name": "Khammouane Province",
					"types": [
						"administrative_area_level_1",
						"political"
					]
				},
				{
					"long_name": "Laos",
					"short_name": "LA",
					"types": [
						"country",
						"political"
					]
				}
			],
			"formatted_address": "Khammouane Province, Laos",
			"geometry": {
				"bounds": {
					"northeast": {
						"lat": 18.266659,
						"lng": 106.4258432
					},
					"southwest": {
						"lat": 16.9009419,
						"lng": 104.2711711
					}
				},
				"location": {
					"lat": 17.6384066,
					"lng": 105.2194808
				},
				"location_type": "APPROXIMATE",
				"viewport": {
					"northeast": {
						"lat": 18.266659,
						"lng": 106.4258432
					},
					"southwest": {
						"lat": 16.9009419,
						"lng": 104.2711711
					}
				}
			},
			"place_id": "ChIJMxUEK5FOOTER4dG2ZFKkw_Q",
			"types": [
				"administrative_area_level_1",
				"political"
			]
		},
		{
			"address_components": [
				{
					"long_name": "Laos",
					"short_name": "LA",
					"types": [
						"country",
						"political"
					]
				}
			],
			"formatted_address": "Laos",
			"geometry": {
				"bounds": {
					"northeast": {
						"lat": 22.5090449,
						"lng": 107.635094
					},
					"southwest": {
						"lat": 13.9097198,
						"lng": 100.0832139
					}
				},
				"location": {
					"lat": 19.85627,
					"lng": 102.495496
				},
				"location_type": "APPROXIMATE",
				"viewport": {
					"northeast": {
						"lat": 22.5090449,
						"lng": 107.635094
					},
					"southwest": {
						"lat": 13.9097198,
						"lng": 100.0832139
					}
				}
			},
			"place_id": "ChIJiUWCsFeQFDERgc2ZH0iSxQ4",
			"types": [
				"country",
				"political"
			]
		}
	],
	"status": "OK"
}
```