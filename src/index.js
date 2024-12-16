const http = require('http');

const PORT = 8080;

const requestListener = (req, res) => {
    const userID = req.headers['x-c6o-userid'];
    console.log(`Request from ${req.connection.remoteAddress}, userID=${userID}`);

    const options = {
        hostname: 'service-c',
        port: 8080,
        path: '/',
        method: 'GET',
        headers: {
            'x-c6o-userid': userID
        }
    };

    const proxyReq = http.request(options, (proxyRes) => {
        let body = '';

        proxyRes.on('data', (chunk) => {
            body += chunk;
        });

        proxyRes.on('end', () => {
            if (body.length > 20) {
                body = body.slice(0, 20);
            }
            res.writeHead(proxyRes.statusCode, { 'Content-Type': 'text/plain' });
            res.end(body);
            console.log(`Sent response to ${req.connection.remoteAddress}, userID=${userID}: ${body}`);
        });
    });

    proxyReq.on('error', (err) => {
        res.writeHead(500);
        res.end(err.message);
    });

    proxyReq.end();
};

const server = http.createServer(requestListener);

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Starting service-b on port ${PORT}`);
});