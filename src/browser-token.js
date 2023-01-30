/* eslint-disable no-undef */
import { Actor } from 'apify';
import { PuppeteerCrawler, log, sleep } from 'crawlee';

import { mockGeocodeResponse } from './consts.js'; // eslint-disable-line import/extensions

const getGoogleApiUrls = async (parentState, input) => {
    const { coords = [] } = parentState;
    const { proxy } = input;

    const proxyConfiguration = await Actor.createProxyConfiguration(proxy);
    const crawler = new PuppeteerCrawler({
        proxyConfiguration,
        requestHandlerTimeoutSecs: (coords.length + 1) * 60,
        async requestHandler(context) {
            const { page } = context;

            const latlngCoords = coords.filter((x) => !x.geocodeUrl).map((coord) => {
                // latlng parsed from web UI from textbox as floats, mimic it
                const lat = parseFloat(coord.lat); // 38.714224
                const lng = parseFloat(coord.lng); // -73.961452
                const loc = { location: { lat, lng } };
                return loc;
            });
            log.info(`Crafting API URLs for ${latlngCoords.length} coordinates`);
            if (!latlngCoords.length) return;
            let cnt = 0;
            await sleep(10 * 1000);
            await page.waitForFunction('google && google.maps && google.maps.Geocoder');
            page.setRequestInterception(true);
            // Expected pattern
            // https://maps.googleapis.com/maps/api/js/GeocodeService.Search?5m2&1d38.714224&2d-73.961452&9sen-US&callback=_xdc_._loxntf&key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&token=117202
            // but instead just
            // await page.route('**/GeocodeService.Search', async (route) => {
            // its better to control all calls to avoid detection
            // right now if reposnse is mocked and points to the same map web app do not make calls for rate limit tracking etc
            // it must be kept this way: from web app point of view its web visitor tried map UI once
            page.on('request', (request) => {
                const url = request.url();
                if (url.includes('GeocodeService.Search')) {
                    log.debug(url);
                    const params = url.split('&');
                    const lat = params.find((x) => x?.startsWith('1d'))?.replace('1d', '');
                    const lng = params.find((x) => x?.startsWith('2d'))?.replace('2d', '');
                    const cityRef = coords.find((x) => x.lat === lat && x.lng === lng);
                    if (!cityRef) {
                        log.warning(`[REF-NOTFOUND]: ${url}`);
                    } else {
                        // keep URL with callback and token
                        cityRef.geocodeUrl = url;
                    }
                    cnt++;
                    if (cnt % 10 === 0 || cnt >= latlngCoords.length) {
                        log.info(`Crafted ${cnt} URLs out of ${latlngCoords.length} in total`);
                    }
                    request.continue({ body: mockGeocodeResponse });
                } else {
                    log.info(url);
                    request.continue();
                }
            });
            await page.evaluate(async (data) => {
                const o = new google.maps.Geocoder();
                for (const item of data) {
                    try {
                        await o.geocode(item);
                    } catch (err) {
                        // just skip it
                    }
                }
            }, latlngCoords);
        },
    });

    await crawler.run(['https://geo-devrel-javascript-samples.web.app/samples/geocoding-reverse/app/dist/']);
};

export {
    getGoogleApiUrls,
};
