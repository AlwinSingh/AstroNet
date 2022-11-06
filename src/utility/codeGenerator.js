function generateJavascript(requestUrl,requestMethod,requestHeaders,requestBody) {
    let jsHeaders = [];

    for (var key in requestHeaders) {
      jsHeaders.push(`xhr.setRequestHeader(${key}, ${requestHeaders[key]});`);
    }

    const xhrMethod = requestMethod.toLowerCase() === 'get' ? `xhr.open("GET", ${requestUrl})` : `xhr.open("${requestMethod}",${requestUrl},true)`;
    const xhrBody = requestMethod.toLowerCase() === 'get' ? '' : `xhr.send(${requestBody})`

    const codeGenerated = `
    var url = ${requestUrl};
    var xhr = new XMLHttpRequest();
    
    //Sets the http method
    ${xhrMethod}

    ${xhrBody != '' ? `//Sets the body if any (Not applicable for 'GET' method)` : ''}
    ${xhrBody}

    //Sets the headers
    ${jsHeaders.join('\n')}

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
          console.log(xhr.status);
          console.log(xhr.responseText);
      }};

    xhr.send();`

    return codeGenerated;
}

function generatePhp(requestUrl,requestMethod,requestHeaders,requestBody) {
      let phpHeaders = [];

      for (var key in requestHeaders) {
        phpHeaders.push(`"${key}:${requestHeaders[key]}"`)
      }
      const phpMethod = `curl_setopt($ch, CURLOPT_${requestMethod.toUpperCase()}, 1);`
      const phpBody = requestMethod.toLowerCase() === 'get' ? '' : `curl_setopt($ch, CURLOPT_POSTFIELDS, ${requestBody});`;

      const codeGenerated = 
      `<?php
      $url = ${requestUrl};
      
      $curl = curl_init($url);
      curl_setopt($curl, CURLOPT_URL, $url);
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

      //Sets the PHP Method
      ${phpMethod}

      ${phpBody != '' ? `//Sets the body if any (Not applicable for 'GET' Method)` : ''}
      ${phpBody}

      $headers = array(${phpHeaders});

      curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
      //for debug only!
      curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
      curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
      
      $resp = curl_exec($curl);
      curl_close($curl);
      var_dump($resp);
      ?>`;

      return codeGenerated;
}

function generatePython(requestUrl,requestMethod,requestHeaders,requestBody) {
    let pythonHeaders = [];

    for (var key in requestHeaders) {
      pythonHeaders.push(`headers["${key}"] = "${requestHeaders[key]}"`);
    }

    const codeGenerated = 
    `import requests
    from requests.structures import CaseInsensitiveDict
    
    url = ${requestUrl}
    
    headers = CaseInsensitiveDict()
    ${pythonHeaders.join("\n")}
    
    
    resp = requests.get(${requestMethod}, url=${requestUrl},
                        data=${JSON.stringify(requestBody)})
    
    print(resp.status_code)`;

    return codeGenerated;
}

function generateJava(requestUrl,requestMethod,requestHeaders,requestBody) {
  let javaHeaders = [];

  for (var key in requestHeaders) {
    javaHeaders.push(`http.setRequestProperty("${key}",${requestHeaders[key]})`);
  }

  const javaBody = requestMethod.toLowerCase() === 'get' ? '' 
                  : 
                  `OutputStream os = httpCon.getOutputStream();
                  OutputStreamWriter osw = new OutputStreamWriter(os, "UTF-8");    
                  osw.write(${JSON.stringify(requestBody)});
                  osw.flush();
                  osw.close();
                  os.close();  //don't forget to close the OutputStream
                  httpCon.connect();`

  const codeGenerated = `
  URL url = new URL("${requestUrl}");
  HttpURLConnection http = (HttpURLConnection)url.openConnection();

  http.setRequestMethod("${requestMethod}");
  ${javaHeaders.join("\n")}

  ${javaBody != '' ? `//Sets the body if any (Not applicable for 'GET' Method)` : ''}
  ${javaBody}
  
  System.out.println(http.getResponseCode() + " " + http.getResponseMessage());
  http.disconnect();`;
  
  return codeGenerated;
}

module.exports = {
    generateJavascript,
    generatePhp,
    generatePython,
    generateJava
}