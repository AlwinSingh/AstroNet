function sendAxiosRequest(axios,method,api_url,headers,body) {
    console.log("API Method: " + method);
    console.log("API URL: " + api_url);

    console.log("Headers:")
    console.log(headers);

    console.log("Body:")
    console.log(body);

    let axiosConfig = {
        method: method,
        url: api_url,
        headers: headers,
        data: body
    }

    const startTime = Date.now();
    return axios(axiosConfig)
    .then(response => {
        const endTime = Date.now();
        const timeElapsed = (endTime - startTime); //in milliseconds
        response.headers.duration = timeElapsed;
        return response;
    })
    .catch(e => {
        console.log('Error: ', e);
        const endTime = Date.now();
        const timeElapsed = (endTime - startTime); //in milliseconds

        if (!e.hasOwnProperty("headers")) {
            e.headers = {};
        }
        
        e.headers.duration = timeElapsed;
        return e;
    });
}

function sendMultipleAxiosRequest(axios,method,api_url,headers,body,requestCount) {
    let axiosRequestArr = [];

    axios.interceptors.request.use(function (config) {
        config.metadata = { startTime: new Date()}
        return config;
    }, function (error) {
        return Promise.reject(error);
    });

    axios.interceptors.response.use(function (response) {
        response.config.metadata.endTime = new Date()
        response.duration = response.config.metadata.endTime - response.config.metadata.startTime
        return response;
    }, function (error) {
        error.config.metadata.endTime = new Date();
        error.duration = error.config.metadata.endTime - error.config.metadata.startTime;
        return Promise.reject(error);
    });

    let axiosConfig = {
        method: method,
        url: api_url,
        headers: headers,
        data: body
    }
   
    if (isNaN(requestCount)) {
        requestCount = 1;
    }

    for (var i = 0; i < requestCount; i++) {
        axiosRequestArr.push(axios(axiosConfig));
    }

    return axios.all(axiosRequestArr)
    .then(axios.spread(function (...res) {
        for (var i =0; i < res.length; i++) {
            const startTime = res[i].config.metadata.startTime;
            const endTime = res[i].config.metadata.endTime;
            res[i].config.metadata.startTime = startTime.toLocaleTimeString({hour12: false});
            res[i].config.metadata.endTime = endTime.toLocaleTimeString({hour12: false});
        }
        return res;
    }))
    .catch(e => {
        const startTime = e.config.metadata.startTime;
        const endTime = e.config.metadata.endTime;
        e.config.metadata.startTime = startTime.toLocaleTimeString({hour12: false});
        e.config.metadata.endTime = endTime.toLocaleTimeString({hour12: false});
        
        return [e];
    });
}

module.exports = {
    sendAxiosRequest,
    sendMultipleAxiosRequest
}