const proxyServer = "https://alwincorsproxy.herokuapp.com/";

function sendMultipleAxiosRequest(axios,method,api_url,headers,body,requestCount) {
    let axiosRequestArr = [];

    axios.interceptors.request.use(function (config) {
        config.metadata = { startTime: new Date()}
        return config;
    });

    axios.interceptors.response.use(function (response) {
        response.config.metadata.endTime = new Date()
        response.duration = response.config.metadata.endTime - response.config.metadata.startTime
        return response;
    });

    headers["Target-URL"] = api_url;

    let axiosConfig = {
        method: method,
        url: proxyServer,
        headers: headers,
        data: body
    };
   
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
        //This .catch only gets called if the interceptor returns 'return Promise.reject(error)' OR the api catches & returns a 'res.status(errCode)' compared to just return 'error'
        e.config.metadata.endTime = new Date();
        const startTime = e.config.metadata.startTime;
        const endTime = e.config.metadata.endTime;
        e.config.metadata.startTime = startTime.toLocaleTimeString({hour12: false});
        e.config.metadata.endTime = endTime.toLocaleTimeString({hour12: false});
        
        return [e];
    });
}

module.exports = {
    sendMultipleAxiosRequest
}