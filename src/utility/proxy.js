const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

//QUICK HACK, TO FIX....UNABLE TO VERIFY LEAF SIGNATURE
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

// support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.all('*', function (req, res, next) {
    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));
    

    if (req.method === 'OPTIONS') {
        res.send();
    } else {
        const body = req.body;
        const headers = req.headers;
        const method = req.method;
        const targetURL = req.header('Target-URL');

        if (!targetURL || targetURL == '') {
            res.status(500);
            res.send('Invalid Target-URL specified in Header');
            return;
        } else {
            let axiosConfig = {
                method: method,
                url: targetURL,
                headers: headers,
            }

            //Below is to bypass Cloudflare direct IP Detection or other WFA
            headers.host = '';
            headers.origin = '';
            headers.referer = '';

            if (method.toLowerCase() != 'get') axiosConfig.data = body;

            axios(axiosConfig)
            .then(response => {
                res.status(200);
                res.send(response.data);
            })
            .catch(error => {
                res.send(error);
            });
        }
    }
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
    console.log('CORS Proxy server listening on port ' + app.get('port'));
});