import fs from 'fs';
import yauzl from 'yauzl';
import HttpsProxyAgent from 'https-proxy-agent';
import axios from 'axios';
import { Actor } from 'apify';
import { KeyValueStore, BasicCrawler, log, sleep } from 'crawlee';
import readline from 'readline';

Actor.main(async () => {
    // SAMPLE FILE
    const dataFile = await import('./cities-sample.json', { assert: { type: 'json' } });
    // ^ ES6 import solution: https://github.com/eslint/eslint/discussions/15305
    log.info(`Data sample: ${dataFile?.default?.length} cities`);

    const input = await KeyValueStore.getInput();

    const {
        startUrls = ['https://download.geonames.org/export/dump/cities500.zip'],
        proxy = {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
        },
        kvStoreName,
    } = input;

    const kvStore = await KeyValueStore.open(kvStoreName);

    let fileName = '';

    const proxyConfiguration = await Actor.createProxyConfiguration(proxy);
    const timeoutSecs = 7 * 60;
    const crawler = new BasicCrawler({
        // proxyConfiguration,
        // additionalMimeTypes: ['application/zip'],
        // navigationTimeoutSecs: timeoutSecs,
        requestHandlerTimeoutSecs: timeoutSecs,
        async requestHandler(context) {
            const { request: { url }, sendRequest, session } = context;
            const proxyUrl = await proxyConfiguration.newUrl(session?.id);
            axios.defaults.proxy = false;
            axios.defaults.httpsAgent = new HttpsProxyAgent(proxyUrl);
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            /*
            const downloadTimeout = timeoutSecs * 1000;
            const response = await sendRequest({ url, proxyUrl, timeout: { request: downloadTimeout, response: downloadTimeout } });
            const buffer = response.rawBody;
            */
            await yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
                if (err) throw err;
                zipfile.readEntry();
                zipfile.on('entry', (entry) => {
                    if (!entry.fileName.startsWith('readme')) {
                        fileName = entry.fileName;
                    }
                    const txtFile = fs.createWriteStream(entry.fileName);
                    zipfile.openReadStream(entry, (err2, readStream) => {
                        if (err2) {
                            throw err2;
                        }
                        readStream.on('end', () => {
                            zipfile.readEntry();
                        });
                        readStream.pipe(txtFile);
                    });
                });
            });
        },
    });

    await crawler.run(startUrls);

    if (!fileName) return;

    const cities = []; // dataFile.default;

    const rl = readline
        .createInterface({
            input: fs.createReadStream(`./${fileName}`),
            output: process.stdout,
            terminal: false,
        });

    for await (const line of rl) {
        const city = line.split('\t');
        if (city.length) {
            // geonameid         : integer id of record in geonames database
            // name              : name of geographical point (utf8) varchar(200)
            // asciiname         : name of geographical point in plain ascii characters, varchar(200)
            // eslint-disable-next-line max-len
            // alternatenames    : alternatenames, comma separated, ascii names automatically transliterated, convenience attribute from alternatename table, varchar(10000)
            // latitude          : latitude in decimal degrees (wgs84)
            // longitude         : longitude in decimal degrees (wgs84)
            // feature class     : see http://www.geonames.org/export/codes.html, char(1)
            // feature code      : see http://www.geonames.org/export/codes.html, varchar(10)
            // country code      : ISO-3166 2-letter country code, 2 characters
            // cc2               : alternate country codes, comma separated, ISO-3166 2-letter country code, 200 characters
            // eslint-disable-next-line max-len
            // admin1 code       : fipscode (subject to change to iso code), see exceptions below, see file admin1Codes.txt for display names of this code; varchar(20)
            // admin2 code       : code for the second administrative division, a county in the US, see file admin2Codes.txt; varchar(80)
            // admin3 code       : code for third level administrative division, varchar(20)
            // admin4 code       : code for fourth level administrative division, varchar(20)
            // population        : bigint (8 byte int)
            // elevation         : in meters, integer
            // eslint-disable-next-line max-len
            // dem               : digital elevation model, srtm3 or gtopo30, average elevation of 3''x3'' (ca 90mx90m) or 30''x30'' (ca 900mx900m) area in meters, integer. srtm processed by cgiar/ciat.
            // timezone          : the iana timezone id (see file timeZone.txt) varchar(40)
            // modification date : date of last modification in yyyy-MM-dd format
            cities.push({
                country: city[8],
                name: city[1].replace('"', '').replace('"', ''),
                lat: city[4],
                lng: city[5],
                state: city[10],
                pop: parseInt(city[14], 10),
            });
        }
    }

    await sleep(5000);

    await kvStore.setValue('cities', cities);
    log.info(`${cities.length} cities parsed`, cities.slice(0, 1));
});
