import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { sendAxiosRequest, sendMultipleAxiosRequest } from "../utility/axiosAbstract";
import Lottie from "react-lottie";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/app.scoped.css";
import "./css/fonts.css";
import "./css/scrollbar.css";
import * as floatingAstronaut from "./lottie/floatingAstronaut.json";
import * as rocket from "./lottie/rocket.json";
import * as cryingAstronaut from "./lottie/cryingAstronaut.json"; 
import * as happyAstronaut from "./lottie/starAstronaut.json";
import * as waitingBird from "./lottie/waitingBird.json";
import { Buffer } from 'buffer';
import { generateJava, generateJavascript, generatePhp, generatePython } from "../utility/codeGenerator";
import { Modal } from 'react-bootstrap';
// @ts-ignore
window.Buffer = Buffer;

function buildLottieConfig(animationToPlay) {
  return {
    loop: true,
    autoplay: true,
    animationData: animationToPlay,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
}

function App() {
  const [targetUrl, setTargetUrl] = useState("");
  const [apiMethod, setApiMethod] = useState("GET");

  const [displayType, setDisplayType] = useState("auth"); //Options are 'auth','headers','body'
  const [bodyInputType, setBodyInputType] = useState("raw"); //Options are 'raw','form-data', 'x-www...'

  const [authFields, setAuthFields] = useState({});
  const [authDisplayType, setAuthDisplayType] = useState('basic'); //Options are 'basic','token','apikey'
  const [apiRequestCount, setApiRequestCount] = useState(1);
  const authUsernameInputRef = useRef(null);
  const authPasswordInputRef = useRef(null);
  const tokenInputRef = useRef(null);
  const apiKeyInputRef = useRef(null);
  const headerKeyInputRef = useRef(null);

  //I have added some preloaded headers...
  const [headerFields, setHeaderFields] = useState([
    {key: 'Accept', value: '*/*'}
  ]);
  const [rawDataInput, setRawDataInput] = useState("");
  const [formDataFields, setFormDataFields] = useState([]);
  const [xFormEncodedDataFields, setXFormEncodedDataFields] = useState([]);

  const [isResponseLoading,setIsResponseLoading] = useState(false);
  const [apiResponseArray,setApiResponseArray] = useState([]);
  const [currentResponseIndex,setCurrentResponseIndex] = useState(0);
  const [responseViewType,setResponseViewType] = useState('content'); //Options are 'content','headers','raw','html'

  const [codeGenerated,setCodeGenerated] = useState(null);
  const [showCodeModal,setShowCodeModal] = useState(false);

  function displayAuthForm() {
    return (
      <div id="apiFieldsForm">
       <div id="authContainer">
          <div id="authBox">
            <button className="btn btn-sm btn-auth" onClick={() => setAuthDisplayType('basic')}>Basic Auth</button>
            <button className="btn btn-sm btn-auth" onClick={() => setAuthDisplayType('token')}>Token Auth</button>
            <button className="btn btn-sm btn-auth" onClick={() => setAuthDisplayType('apikey')}>API Key</button>
          </div>
          {displayAuthInput()}
          <div className="d-flex flex-column text-center mt-3 w-50 mx-auto">
            <button className="btn btn-sm btn-primary" onClick={() => setAuthorisation()}>Set Authorisation</button>
            {/*<small className="smallText">Click to set the header</small>*/}
          </div>
        </div>
      </div>
    )
  }

  function displayAuthInput() {
    if (authDisplayType === 'basic') {
      return (
        <div className="text-center">
          
          <div className="d-flex justify-content-center align-items-center mt-5">
            <label className="form-label mx-5" for="usernameInput">
              Username
            </label>
            <input
              type="text"
              className="form-input form-control auth-form-input"
              id="usernameInput"
              placeholder="Enter username"
              ref={authUsernameInputRef}
            />
          </div>

          <div className="d-flex justify-content-center align-items-center mt-3">
            <label className="form-label mx-5" for="passwordInput">
              Password
            </label>
            <input
              type="password"
              className="form-input form-control auth-form-input"
              id="passwordInput"
              placeholder="Enter password"
              ref={authPasswordInputRef}
            />
          </div>
        </div>
      )
    } else if (authDisplayType === 'token') {
      return (
        <div className="text-center">
          <div className="d-flex justify-content-center align-items-center mt-5">
            <label className="form-label mx-5" for="tokenInput">
              Token
            </label>
            <input
              type="text"
              className="form-input form-control auth-form-input"
              id="tokenInput"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
              ref={tokenInputRef}
            />
          </div>
        </div>
      )
    } else if (authDisplayType === 'apikey') {
      return (
        <div className="row mt-3">
          <div className="col-6">
            <label className="form-label" for="headerKeyInput">
              Header Key
            </label>
            <input
              type="text"
              className="form-input form-control"
              id="headerKeyInput"
              placeholder="(E.g. Authorization)"
              ref={headerKeyInputRef}
            />
          </div>

          <div className="col-6">
            <label className="form-label" for="apiKeyInput">
              API Key
            </label>
            <input
              type="text"
              className="form-input form-control"
              id="apiKeyInput"
              placeholder="Enter api key"
              ref={apiKeyInputRef}
            />
          </div>
        </div>
      )
    }
  }

  function setAuthorisation() {
    let authKey = 'Authorization';
    let authValue = '';

    if (authDisplayType === 'basic') {
      const username = authUsernameInputRef.current.value;
      const password = authPasswordInputRef.current.value;
      authValue = Buffer.from(username + ':' + password).toString('Base64');
    } else if (authDisplayType === 'token') {
      authValue = 'Bearer ' + tokenInputRef.current.value;
    } else if (authDisplayType === 'apikey') {
      //Authorization: 'Header/Param ' + key
      const apiHeaderKey = headerKeyInputRef.current.value;
      const apiKey = apiKeyInputRef.current.value;
      authKey = apiHeaderKey;
      authValue = apiKey;
    }

    let isAuthExist = false;
    let headerAuthIndex = -1;
    for (var i = 0; i < headerFields.length; i++) {
      isAuthExist = headerFields[i].key == authKey;
      headerAuthIndex = i;
    }

    if (isAuthExist) {
      headerFields[headerAuthIndex].value = authValue;
      setHeaderFields([...headerFields]);
    } else {
      headerFields.push({'key':authKey,'value':authValue});
      setHeaderFields([...headerFields]);
    }
  }

  function displayHeadersForm() {
    return (
      <div id="apiFieldsForm">
        <button
          type="button"
          className="btn w-100 add-input-btn"
          onClick={() => addField("headers")}
        >
          Add Header +
        </button>
        {headerFields.map((field, index) => {
          return (
            <div className="input-group" key={index}>
              <input
                type="text"
                className="form-control form-input"
                placeholder="Key"
                value={field.key}
                onChange={(e) => updateKey("headers", e.target.value, index)}
              />
              <span className="input-group-addon"></span>
              <input
                type="text"
                className="form-control form-input"
                placeholder="Value"
                value={field.value}
                onChange={(e) => updateValue("headers", e.target.value, index)}
              />
              <button
                className="btn btn-lg bg-dark remove-input-btn"
                onClick={() => removeField("headers", index)}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  function displayBodyForm() {
    return (
      <div id="apiFieldsForm">
        <select
          id="bodyTypeInput"
          value={bodyInputType}
          onChange={(e) => setBodyInputType(e.target.value)}
          className="form-select form-select-input"
          style={{ borderRadius: 0 }}
        >
          <option value="raw">raw</option>
          <option value="form-data">form-data</option>
          <option value="x-www-form-urlencoded">x-www-form-urlencoded</option>
        </select>
        {displayBodyInput()}
      </div>
    );
  }

  function displayBodyInput() {
    if (bodyInputType === "raw") {
      //Display text area
      return (
        <textarea
          className="form-control form-textarea"
          id="rawTextArea"
          rows="10"
          placeholder="{ key : value }"
          value={rawDataInput}
          onChange={(e) => setRawDataInput(e.target.value)}
        />
      );
    } else if (bodyInputType === "form-data") {
      //Display fields with file upload ability
      const formFieldItems = formDataFields.map((field, index) => {
        return (
          <div className="input-group" key={index}>
            <input
              type="text"
              className="form-control form-input"
              placeholder="Key"
              value={field.key}
              onChange={(e) => updateKey("form-data", e.target.value, index)}
            />
            <span className="input-group-addon"></span>
            {field.type === "file" ? (
              <input
                type="file"
                className="form-control form-input"
                placeholder={field.value.name}
                onChange={(e) =>
                  updateValue("form-data", e.target.files[0], index, true)
                }
              />
            ) : (
              <input
                type="text"
                className="form-control form-input"
                placeholder="Value"
                value={field.value}
                onChange={(e) =>
                  updateValue("form-data", e.target.value, index)
                }
              />
            )}
            <button
              className="btn btn-lg bg-dark remove-input-btn"
              onClick={() => removeField("form-data", index)}
            >
              ✕
            </button>
          </div>
        );
      });

      return (
        <>
          <button
            className="btn w-50 add-input-btn"
            onClick={() => addField("form-data", "text")}
          >
            Add form TEXT field
          </button>
          <button
            className="btn w-50 add-input-btn"
            onClick={() => addField("form-data", "file")}
          >
            Add form FILE field
          </button>
          {formFieldItems}
        </>
      );
    } else if (bodyInputType === "x-www-form-urlencoded") {
      //Display normal fields no file upload ability
      const xFormFieldItems = xFormEncodedDataFields.map((field, index) => {
        return (
          <div className="input-group" key={index}>
            <input
              type="text"
              className="form-control form-input"
              placeholder="Key"
              value={field.key}
              onChange={(e) =>
                updateKey("x-www-form-urlencoded", e.target.value, index)
              }
            />
            <span className="input-group-addon"></span>
            <input
              type="text"
              className="form-control form-input"
              placeholder="Value"
              value={field.value}
              onChange={(e) =>
                updateValue("x-www-form-urlencoded", e.target.value, index)
              }
            />
            <button
              className="btn btn-lg bg-dark remove-input-btn"
              onClick={() => removeField("x-www-form-urlencoded", index)}
            >
              ✕
            </button>
          </div>
        );
      });

      return (
        <>
          <button
            className="btn w-100 add-input-btn"
            onClick={() => addField("x-www-form-urlencoded")}
          >
            Add Xform field
          </button>
          {xFormFieldItems}
        </>
      );
    }
  }

  function displayResponseView() {
    if (responseViewType === 'content') {
      return (
      <textarea
        className="form-control form-textarea"
        id="rawTextArea"
        rows="20"
        value={apiResponseArray[currentResponseIndex].status != 500 && apiResponseArray[currentResponseIndex].headers['content-type'].includes('application/json') ? 
              JSON.stringify(apiResponseArray[currentResponseIndex].data, undefined, 2)
              : 
              apiResponseArray[currentResponseIndex].data}
        readOnly
      />);
    } else if (responseViewType === 'headers') {
      return (
      <textarea
        className="form-control form-textarea"
        id="rawTextArea"
        rows="20"
        value={JSON.stringify(apiResponseArray[currentResponseIndex].headers,undefined,2)}
        readOnly
      />);
    } else if (responseViewType === 'raw') {
      return (
        <textarea
          className="form-control form-textarea"
          id="rawTextArea"
          rows="20"
          value={JSON.stringify(apiResponseArray[currentResponseIndex],undefined,2)}
          readOnly
        />);
    } else if (responseViewType === 'html') {
      return (
        <div id="browserDiv" className="mt-4">
          <iframe 
          className="responsive-iframe"
          srcdoc={apiResponseArray[currentResponseIndex].data}></iframe>
        </div>
        );
    }
  }

  function updateKey(type, value, index) {
    if (type === "headers" && displayType === "headers") {
      headerFields[index].key = value;
      setHeaderFields([...headerFields]);
    } else if (type === "form-data" && displayType === "body") {
      formDataFields[index].key = value;
      setFormDataFields([...formDataFields]);
    } else if (type === "x-www-form-urlencoded" && displayType === "body") {
      xFormEncodedDataFields[index].key = value;
      setXFormEncodedDataFields([...xFormEncodedDataFields]);
    }
  }

  function updateValue(type, value, index, isFile) {
    if (type === "headers" && displayType === "headers") {
      headerFields[index].value = value;
      setHeaderFields([...headerFields]);
    } else if (type === "form-data" && displayType === "body") {
      formDataFields[index].value = value;
      setFormDataFields([...formDataFields]);
    } else if (type === "x-www-form-urlencoded" && displayType === "body") {
      xFormEncodedDataFields[index].value = value;
      setXFormEncodedDataFields([...xFormEncodedDataFields]);
    }
  }

  function addField(type, subType) {
    if (type === "headers" && displayType === "headers") {
      headerFields.push({ key: "", value: "" });
      setHeaderFields([...headerFields]);
    } else if (type === "form-data" && displayType === "body") {
      formDataFields.push({ key: "", value: "", type: subType });
      setFormDataFields([...formDataFields]);
    } else if (type === "x-www-form-urlencoded" && displayType === "body") {
      xFormEncodedDataFields.push({ key: "", value: "" });
      setXFormEncodedDataFields([...xFormEncodedDataFields]);
    }
  }

  function removeField(type, index) {
    if (type === "headers" && displayType === "headers") {
      headerFields.splice(index, 1);
      setHeaderFields([...headerFields]);
    } else if (type === "form-data" && displayType === "body") {
      formDataFields.splice(index, 1);
      setFormDataFields([...formDataFields]);
    } else if (type === "x-www-form-urlencoded" && displayType === "body") {
      xFormEncodedDataFields.splice(index, 1);
      setXFormEncodedDataFields([...xFormEncodedDataFields]);
    }
  }

  function sendRequest() {
    const httpMethods = ["GET","PUT","POST","DELETE","PATCH","OPTIONS","HEAD"];
    const urlRegexExpr = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
    const urlRegex = new RegExp(urlRegexExpr);
    if (httpMethods.includes(apiMethod)) {
      if (targetUrl.match(urlRegex)) {
        setIsResponseLoading(true);
        const headerFields = compileHeader();
        let bodyData = {};
        if (bodyInputType === 'form-data') {
          bodyData = compileFormData();
        } else if (bodyInputType === 'x-www-form-urlencoded') {
          bodyData = compileXFormUrlEncoded();
        } else if (bodyInputType === 'raw') {
          bodyData = compileRawData();
        }

        //A small little timeout because I want to see the Lotties haha
        setTimeout(async  () => {
          const apiResponse = await sendMultipleAxiosRequest(axios,apiMethod,targetUrl,headerFields,bodyData,apiRequestCount);
          //console.log(apiResponse);

          //Parse the API Responses...
          for (var i = 0; i < apiResponse.length; i++) {
            apiResponse[i] = parseResponse(apiResponse[i]);
          }

          setApiResponseArray(apiResponse);
          setCurrentResponseIndex(0);
          setIsResponseLoading(false);
        }, 500);
      } else {
        console.log("API is invalid!");
      }
    } else {
      console.log("API Method is invalid!");
    }
  }

  function parseResponse(response) {
    //Add missing data fields if any
    if (!response.hasOwnProperty("status")) response.status = 500;
    if (!response.hasOwnProperty("statusText")) response.statusText = "Server Error";
    if (!response.hasOwnProperty("headers")) response.headers = {};
    if (!response.hasOwnProperty("duration")) response.duration = "-";
    if (!response.headers.hasOwnProperty("content-type")) response.headers['content-type'] = "text/plain";
    if (!response.headers.hasOwnProperty("content-length")) response.headers['content-length'] = 0;

    if (response.hasOwnProperty("data")) {
      if (response.data.name) {
        if ((response.data.name).toLowerCase().includes("error")) {
          response.status = 500;
          response.statusText = "Error";
          response.data = response.data.stack;
        }
      }
    }

    return response;
  }

  function changeCurrentApiResponse(selectedIndex) {
    setCurrentResponseIndex(selectedIndex);
  }

  function compileHeader() {
    const convertedHeaderFields = convertToKVPair(headerFields);
    return convertToMasterObj(convertedHeaderFields);
  }

  function compileRawData() {
    //Todo: Parse HTML, etc
    return rawDataInput;
  }

  function compileFormData() {
    let formData = new FormData();
    for (var i = 0; i < formDataFields.length; i++) {
      const key = formDataFields[i].key.replaceAll(/\s/g,'');
      const value = formDataFields[i].value;
      if (key.length > 0) {
        formData.append(key, value);
      }
    }
    return formData;
  }

  function compileXFormUrlEncoded() {
    const convertedXFormFields = convertToKVPair(xFormEncodedDataFields);
    return convertToMasterObj(convertedXFormFields);
  }

  //Translate all array elements into 1 big Obj with K:V pair
  function convertToMasterObj(arr) {
    const masterObj = {};
    for (let i = 0; i < arr.length; i++) {
      Object.keys(arr[i]).forEach(function eachKey(key) {
        masterObj[key] = arr[i][key];
      });
    }
    return masterObj;
  }

  //Converts from "key":"abc","value":"efg" to "abc":"efg"
  //At the same time this removes any empty keys and values before sending to Axios
  function convertToKVPair(jsonArr) {
    let convertedArr = [];
    for (var i = 0; i < jsonArr.length; i++) {
      const key = jsonArr[i].key.replaceAll(/\s/g,'');
      const value = jsonArr[i].value.replaceAll(/\s/g,'');
      if (key.length > 0 && value.length > 0) {
        convertedArr.push({[key]: value});
      }
    }
    return convertedArr;
  }

  async function generateCode(selectedValue) {
    let codeGenerated = "Sorry, failed to generate code";
    let isCodeGenerated = false;

    if (apiResponseArray[currentResponseIndex] != null && apiResponseArray[currentResponseIndex].hasOwnProperty("config")) {
      const requestUrl = apiResponseArray[currentResponseIndex].config.url;
      const requestMethod = apiResponseArray[currentResponseIndex].config.method;
      const requestBody = apiResponseArray[currentResponseIndex].config.data;
      const requestHeaders = apiResponseArray[currentResponseIndex].config.headers;

      switch(selectedValue) {
        case 'js': 
          isCodeGenerated = true;
          codeGenerated = await generateJavascript(requestUrl,requestMethod,requestHeaders,requestBody);
          break;
        case 'php':
          isCodeGenerated = true;
          codeGenerated = await generatePhp(requestUrl,requestMethod,requestHeaders,requestBody);
          break;
        case 'python':
          isCodeGenerated = true;
          codeGenerated = await generatePython(requestUrl,requestMethod,requestHeaders,requestBody);
          break;
        case 'java':
          isCodeGenerated = true;
          codeGenerated = await generateJava(requestUrl,requestMethod,requestHeaders,requestBody);
      }
    } else {
      codeGenerated = "Invalid Client API response, unable to generate code";
    }

    if (isCodeGenerated) {
      setCodeGenerated(codeGenerated);
      setShowCodeModal(true);
    }
  }

  useEffect(() => {
  }, []);

  return (
    <div id="pageContainer">
      <div id="logoContainer">
        <Lottie
          options={buildLottieConfig(floatingAstronaut)}
          height={250}
          width={250}
        />
        <div style={{ display: "block" }}>
          <h1>
            Astro
            <p style={{ display: "inline", color: "#02b9b4" }}>Net</p>
          </h1>
          <small className="smallText">
            A free & easy to use API tool built using React.js & Axios
          </small>
        </div>
      </div>

      <div className="row w-100">
        <div className="col-12 col-md-6">
          <div id="networkRequestContainer">
            <div id="networkRequestForm">
              <div className="form-group">
                <label className="form-label" for="apiUrlInput">
                  Target URL
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="form-input form-control"
                  id="apiUrlInput"
                  aria-describedby="apiUrlHelp"
                  placeholder="https://google.com"
                />
              </div>

              <div className="d-flex">
                <div className="form-group flex-fill p-2">
                  <label className="form-label" for="methodInput">
                    HTTP Method
                  </label>
                  <select
                    id="methodInput"
                    className="form-select form-select-input"
                    value={apiMethod}
                    onChange={(e) => setApiMethod(e.target.value)}
                  >
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                    <option value="POST">POST</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                    <option value="OPTIONS">OPTIONS</option>
                    <option value="HEAD">HEAD</option>
                  </select>
                </div>

                <div className="form-group flex-fill p-2">
                  <label className="form-label" for="apiUrlInput">
                    HTTP No. of Requests
                  </label>
                  <input
                    type="number"
                    value={apiRequestCount}
                    onChange={(e) => setApiRequestCount(e.target.value)}
                    className="form-input form-control"
                    id="requestCountInput"
                    aria-describedby="requestCountHelp"
                    min={1}
                    max={1000}
                  />
                </div>
              </div>

              <div className="navGroup mt-3 p-3">
                <ul className="nav">
                  <li className="nav-item active">
                    <button
                      className="btn nav-link"
                      onClick={() => setDisplayType("auth")}
                    >
                      Authorisation
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className="btn nav-link"
                      onClick={() => setDisplayType("headers")}
                    >
                      Headers
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className="btn nav-link"
                      onClick={() => setDisplayType("body")}
                    >
                      Body
                    </button>
                  </li>
                </ul>
              </div>

              {displayType === "auth" ? displayAuthForm() : null}
              {displayType === "headers" ? displayHeadersForm() : null}
              {displayType === "body" ? displayBodyForm() : null}

              <button className="btn btn-sm btn-primary mt-2 w-100 p-2" onClick={() => sendRequest()}>
                Send request
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          {isResponseLoading ? 
          <Lottie
            options={buildLottieConfig(rocket)}
            height={350}
            width={350}
          />
          :
          typeof apiResponseArray[currentResponseIndex] !== 'undefined' ?
          <div id="responseContainer">
            <div id="responseActionsBox">
              <select 
              id="generateCodeSelect" 
              className="form-select"
              aria-label="Generate code select"
              onChange={(e) => generateCode(e.target.value)}>
                <option value="DEFAULT">Select Generate Code{' </>'}</option>
                <option value="php">PHP</option>
                <option value="js">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>

              {apiResponseArray.length > 1 ?
              <select 
              id="apiResponseSelect" 
              className="form-select"
              aria-label="API response select"
              onChange={(e) => changeCurrentApiResponse(e.target.value)}>
                {apiResponseArray.map(function(responseItem, index){
                  return  <option key={index} value={index}>
                                 {currentResponseIndex == index ? 'Viewing ' : ''}
                                 Response #{index + 1}
                          </option>
                })}
              </select>
              : null}

            </div>
            <div id="responseOverview">
              <div id="responseStatusBox">
                <small>HTTP {apiResponseArray[currentResponseIndex].status}</small>
                <small className="smallText text-center">Status: {apiResponseArray[currentResponseIndex].statusText}</small>
              </div>
              <span className="verticalBreak mx-3"/>
              <div className="d-flex flex-column">
                <small>Time: {apiResponseArray[currentResponseIndex].duration} ms</small>
                {apiResponseArray[currentResponseIndex].duration >= 1000 ?
                <>
                  <small className="smallText text-center">Start: {apiResponseArray[currentResponseIndex].config.metadata.startTime.toString()}</small>
                  <small className="smallText text-center">End: {apiResponseArray[currentResponseIndex].config.metadata.endTime.toString()}</small>
                </>
                : null}
              </div>
              <span className="verticalBreak mx-3"/>
              <small>Size: {apiResponseArray[currentResponseIndex].headers['content-length']} B</small>
              <Lottie
                options={buildLottieConfig(apiResponseArray[currentResponseIndex].status != 500 ? happyAstronaut : cryingAstronaut)}
                height={100}
                width={100}
              />
            </div>
            <hr className="horizontalBreak" />
            <div id="responseTabs">
              <button className="btn response-btn btn-sm btn-primary" 
              onClick={() => setResponseViewType('content')}>Content</button>
              <button className="btn response-btn btn-sm btn-primary"
              onClick={() => setResponseViewType('headers')}>Headers</button>
              <button className="btn response-btn btn-sm btn-primary"
              onClick={() => setResponseViewType('raw')}>Raw</button>
              <button className="btn response-btn btn-sm btn-primary"
              onClick={() => setResponseViewType('html')}
              disabled={!apiResponseArray[currentResponseIndex].headers['content-type'].includes("text/html")}>HTML</button>
            </div>
            {displayResponseView()}

            <Modal show={showCodeModal} onHide={() => setShowCodeModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Generated Code</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {codeGenerated === null ? 'No code generated' : 
                <textarea
                className="w-100"
                value={codeGenerated}
                rows={20}
                disabled
                />
                }
              </Modal.Body>
              <Modal.Footer>
                <button className="btn btn-sm btn-primary" onClick={() => {window.navigator.clipboard.writeText(codeGenerated);window.alert("Copied code")}}>Copy Code</button>
                <button className="btn btn-sm btn-dark" onClick={() => setShowCodeModal(false)}>Close</button>
              </Modal.Footer>
            </Modal>
          </div>
          :
          <div id="responseContainer">
            <div id="waitingContainer">
              <small>Hey buddy! We are waiting for you to send a request</small>
              <p className="smallText">No rush, take your time haha! Click the bird to stop him!</p>
            </div>
            <Lottie
                options={buildLottieConfig(waitingBird)}
                height={400}
                width={400}
              />
          </div>}

        </div>

      </div>
    </div>
  );
}

export default App;
