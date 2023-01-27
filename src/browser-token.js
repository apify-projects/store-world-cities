/* eslint-disable no-undef */
import { Actor } from 'apify';
import { PlaywrightCrawler, log, sleep } from 'crawlee';

import { mockGeocodeResponse } from './consts.js'; // eslint-disable-line import/extensions

const getGoogleApiUrls = async (parentState, input) => {
    const { coords = [] } = parentState;
    const { proxy, evaluateHandle } = input;

    const processCoords = coords.filter((x) => !x.geocodeUrl);
    if (!processCoords.length) {
        return;
    }

    const proxyConfiguration = await Actor.createProxyConfiguration(proxy);
    const crawler = new PlaywrightCrawler({
        proxyConfiguration,
        requestHandlerTimeoutSecs: 7 * 60,
        async requestHandler(context) {
            const { page } = context;
            log.info(`Crafting API URLs for ${processCoords.length} coordinates`);
            await sleep(10 * 1000);
            await page.waitForFunction('google && google.maps && google.maps.Geocoder');
            // Expected pattern
            // https://maps.googleapis.com/maps/api/js/GeocodeService.Search?5m2&1d38.714224&2d-73.961452&9sen-US&callback=_xdc_._loxntf&key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&token=117202
            // but instead just
            // await page.route('**/GeocodeService.Search', async (route) => {
            // its better to control all calls to avoid detection
            // right now if reposnse is mocked and points to the same map web app do not make calls for rate limit tracking etc
            // it must be kept this way: from web app point of view its web visitor tried map UI once
            await page.route('**/*', async (route) => {
                const url = route.request().url();
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
                    route.fulfill({ body: mockGeocodeResponse });
                } else {
                    log.info(url);
                    route.continue();
                }
            });
            const gHandle = evaluateHandle ? await page.evaluateHandle(() => new google.maps.Geocoder()) : null;
            for (const coord of processCoords) {
                // latlng parsed from web UI from textbox as floats, mimic it
                const lat = parseFloat(coord.lat); // 38.714224
                const lng = parseFloat(coord.lng); // -73.961452
                const loc = { location: { lat, lng } };
                try {
                    // Performance AB test
                    if (!evaluateHandle) {
                        // eslint-disable-next-line no-loop-func
                        await page.evaluate((data) => {
                            const o = new google.maps.Geocoder();
                            o.geocode(data);
                        }, loc);
                        // await pageHandle.dispose();
                    } else {
                        // expected internal callback _.he error since geocode called outside of wrapper
                        await page.evaluateHandle(([o, arg]) => o.geocode(arg), [gHandle, loc]);
                    }
                } catch (err) {
                    if (!err.message?.includes('_.he')) {
                        log.error(err.nessage, err);
                    }
                }
            }
        },
    });

    await crawler.run(['https://geo-devrel-javascript-samples.web.app/samples/geocoding-reverse/app/dist/']);
};

export {
    getGoogleApiUrls,
};
