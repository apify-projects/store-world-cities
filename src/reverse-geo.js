import { Actor, Dataset } from 'apify';
import { CheerioCrawler, log } from 'crawlee';

import { getGoogleApiUrls } from './browser-token.js'; // eslint-disable-line import/extensions
import { geocodingRequest } from './consts.js'; // eslint-disable-line import/extensions

const reverseGeocoding = async (parentState, input) => {
    const { coords = [] } = parentState;
    const { proxy } = input;
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
        additionalMimeTypes: ['text/javascript'], // 'text/plain' if request is wrong
        async requestHandler(context) {
            const { request: { url, userData }, body } = context;
            log.debug(url);
            const rawData = body.toString().split('( ')[1].replace(')', '');
            const json = JSON.parse(rawData);
            const data = {
                ...userData,
                ...json,
            };
            await Dataset.pushData(data);
        },
    });

    await crawler.run(googleApiCalls);
};

export {
    reverseGeocoding,
};
