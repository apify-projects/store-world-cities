import { Actor, Dataset, KeyValueStore } from 'apify';
import { CheerioCrawler, log } from 'crawlee';

import { getGoogleApiUrls } from './browser-token.js'; // eslint-disable-line import/extensions
import { geocodingRequest } from './consts.js'; // eslint-disable-line import/extensions

const reverseGeocoding = async (parentState, input) => {
    const { coords = [] } = parentState;
    const { proxy, maxRequestRetries = 5 } = input;
    if (!coords.length) {
        log.warning(`No cities to geocode`);
        return;
    }

    const proxyConfiguration = await Actor.createProxyConfiguration(proxy);

    await getGoogleApiUrls(parentState, input);

    const googleApiCalls = coords.filter((x) => x.geocodeUrl).map(geocodingRequest);
    const amountCheckup = coords.length - googleApiCalls.length;
    if (amountCheckup !== 0) {
        log.warning(`[NOT-AVAILABLE]: reverse geocoding is not available for ${amountCheckup} coordinates`);
    } else {
        log.info(`[GOOGLE-API]: Reverse geocoding by crawling ${googleApiCalls.length} coordinates`);
    }

    const crawler = new CheerioCrawler({
        useSessionPool: false,
        persistCookiesPerSession: false,
        // need to avoid any sessions because public Google Maps API key is used
        proxyConfiguration,
        maxRequestRetries,
        additionalMimeTypes: ['text/javascript'], // 'text/plain' if request is wrong
        async requestHandler(context) {
            const { request: { url, userData }, body } = context;
            log.debug(url);
            const respText = body.toString();
            try {
                // eslint-disable-next-line prefer-template
                const rawData = '{' + respText.split('( {')[1].split('"status" :')[0] + '"status": "parsed"}';
                const json = JSON.parse(rawData);
                const geoDataWithBounds = json?.results?.find((x) => x?.geometry?.bounds && x?.geometry?.location_type === 'GEOMETRIC_CENTER');
                if (geoDataWithBounds) {
                    geoDataWithBounds.viewport = undefined;
                }
                const geoData = geoDataWithBounds || json?.results?.find((x) => x?.geometry?.location_type === 'GEOMETRIC_CENTER');
                if (!geoData) {
                    log.error(`[NOT-GEOMETRIC-CENTER]: ${url}`);
                }
                const data = {
                    ...userData,
                    ...geoData?.geometry,
                    ...geoData?.plus_code,
                    placeId: geoData?.place_id || undefined,
                    location_type: undefined,
                    location: undefined,
                };
                await Dataset.pushData(data);
            } catch (err) {
                log.error(err.message);
                await KeyValueStore.setValue(`not-parsed${new Date().getTime()}`, respText, { contentType: 'text/plain' });
            }
        },
    });

    await crawler.run(googleApiCalls);
};

export {
    reverseGeocoding,
};
