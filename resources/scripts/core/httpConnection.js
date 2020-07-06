const https = require('https');

class HTTPConnection {

    static makeGETRequest(endpoint) {
        return new Promise(function (resolve, reject) {
            https.get(endpoint, (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    resolve(data);
                });
            }).on("error", (err) => {
                reject(err);
            });
        });
    }

}
module.exports = HTTPConnection;