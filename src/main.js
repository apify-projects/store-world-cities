import { Actor } from 'apify';
import { KeyValueStore, useState, log } from 'crawlee';

import { loadCities } from './download-cities.js'; // eslint-disable-line import/extensions
import { reverseGeocoding } from './reverse-geo.js'; // eslint-disable-line import/extensions

Actor.main(async () => {
    const input = await KeyValueStore.getInput();
    if (!input.proxy) {
        input.proxy = {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
        };
    }

    const {
        geocoding,
        kvStoreName,
        debugLog,
    } = input;

    if (debugLog) {
        log.setLevel(log.LEVELS.DEBUG);
    }

    const state = await useState('crawlee-run-state', { coords: [] });

    if (!state.coords.length) {
        state.coords = await loadCities(input);
    }

    const kvStore = await KeyValueStore.open(kvStoreName);

    if (!geocoding) {
        await kvStore.setValue('cities', state.coords);
        return;
    }

    await reverseGeocoding(state, input);
    await kvStore.setValue('cities', state.coords);
});
