// Version 2.0
/*
 *  Copyright 2016 Camera51, www.camera51.com
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
(function(window, document) {

  var camera51; // Object for Interacting with the editor.
  var camera51UserFunctions = new Camera51UserFunctions(); // Object, functions for registering analytics events.
  var camera51WithQueue = new Camera51WithQueue();
  var editorVersion = "v3";

  window.waitForSQS = false; // should sqs keep listening.

  window.camera51 = camera51;
  window.camera51UserFunctions = camera51UserFunctions;
  window.camera51WithQueue = camera51WithQueue;
  //sdsd
  var camera51Text = {
    "show-result"     : "preview result",
    "back-to-edit"    : "back to edit",
    "click-to-fix"    : "Click to edit",
    "tooltip-mark-background" : "Draw lines to mark areas you want to remove from the image",
    "tooltip-mark-object" : "Draw lines to mark areas you want to keep in the image",

    "error-header-default": "Press here for manual background removal",
    "error-header-image-failure": "Image error",
    "error-text-7" : "<b>GRAPHIC BANNER</b>",
    "error-text-6" : "<b>GRAPHIC BANNER</b>",
    "error-text-100" : "<b>GRAPHIC BANNER</b>",
    "error-text-5" : "<b>CLEAR BACKGROUND</b>",
    "error-text-2" : "<b>LOW CONTRAST</b>",
    "error-text-4" : "<b>CLUTTERED IMAGE</b>",
    "error-text-103" : "Image <b>too small</b> to be processed<br><font size='2'>(image size should be at least 70x70px)</font>",
    "error-text-101" : "Image cannot be processed",
    "error-text-default" : "Background was not automatically removed, you may remove it manually"
  };
  window.camera51Text = camera51Text;
  function Camera51UserFunctions(){};

// Function to send event on an Image. By sending the trackId as an identifier.
  Camera51UserFunctions.prototype.sendEventTrackId = function(trackId, customerId,message) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", window.location.protocol +"//api.malabi.co/Camera51Server/imageUsed?");
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("customerId="+customerId+"&trackId="+encodeURIComponent(trackId)+"&message="+message);
  };

// Function to send event on an Image. By sending the sessionId as an identifier.
  Camera51UserFunctions.prototype.sendEventSessionId = function(sessionId, customerId,message) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", window.location.protocol +"//api.malabi.co/Camera51Server/imageUsed?");
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("customerId="+customerId+"&sessionId="+sessionId+"&message="+message);
  };


  this.initCamera51 = function(obj) {
    window.camera51 = new camera51obj(obj);
  };

  var overrideTutorialElement = null;
  var injectStyleToIframe = null;

  function Camera51WithQueue(){
    var searchFor = "sessionId";
    var searchArray = [];
    var arrayElements = [];
    var sqsUrl = "";
    this.apiUrl = null;
    this.customerId = null;
    this.userId = null;
    this.sessionToken = null;
    this.sqsRunning = false;
    this.requestStopSQSrequests = false;
    this.camera51Text = camera51Text;
    this.iframeElement = null;
    this.queueStringIdentifier = "camera51.sqsUrl";
    this.callbackAsyncRequestError = noop;
    this.callbackAsyncRequest = noop;
    this.callbackNewSQSRequestError = noop; // error during request sqs
    this.isInit = false; // if Camera51WithQueue as init run.
    this.functionArrayToRunAferInit = []; // array of function to run after object is initialized.

    this.init = function(obj){

      this.customerId = obj.customerId;
      this.userId = obj.userId;
      this.sessionToken = obj.sessionToken;
      this.camera51Text = obj.camera51Text;
      overrideTutorialElement = (obj.overrideTutorialElement) ? obj.overrideTutorialElement : null;
      injectStyleToIframe = (obj.injectStyleToIframe) ? obj.injectStyleToIframe : null;


      var apiUrl = null;
      if (obj.hasOwnProperty('apiUrl') && obj.apiUrl.length > 1) {
        apiUrl = obj.apiUrl;
      } else {
        apiUrl = "//api.malabi.co";
      }
      this.apiUrl = apiUrl;
      this.setSQSurl(true);
      this.isInitialized();
    };

    /*
     Run after object has been initialized.
     */
    this.isInitialized = function () {
      this.isInit = true;

      this.functionArrayToRunAferInit.forEach(function (ele) {
        var fn = this.camera51WithQueue[ele];
        if(typeof fn === 'function') {
          try {
            this.camera51WithQueue[ele]();
          } catch (e){
            console.log(e);
          }

        }
      })
    };

    this.loaded = function () {


    };

    this.openEditorWithTrackId = function (obj, onSaveWithResult , responseElement ) {
      window.camera51.openEditorWithTrackId(obj, onSaveWithResult, responseElement);
    };

    this.addSearchArray = function(ele, str){
      searchArray.push(str);
      arrayElements.push(ele);

      //Camera51SQSFunctionality.checkUpdatesSQS();
    };

    this.getSearchArray = function(){
      return searchArray;
    };

    this.startSQS = function(){
      if(this.sqsRunning == false){
        this.checkUpdatesSQS();
      }
    };

    this.checkUpdatesSQS = function(){
      console.log("checkUpdatesSQS", this.sqsUrl);
      if(this.sqsUrl == undefined && this.functionArrayToRunAferInit.indexOf('checkUpdatesSQS') < 0){
        this.functionArrayToRunAferInit.push("checkUpdatesSQS");
        console.log("functionArrayToRunAferInit");
        return;

      }

      var callbackURL = this.sqsUrl+"?Action=ReceiveMessage&VisibilityTimeout=10";
      var _this = this;

      if(arrayElements.length == 0 && waitForSQS == false){
        this.sqsRunning = false;
        return;
      }
      this.sqsRunning = true;

      var xhr = new XMLHttpRequest();
      //  xhr.timeout = 90000;
      xhr.open('GET', callbackURL);
      xhr.onreadystatechange = function(){

      };
      xhr.onload = function() {

        if (xhr.status === 0) {
          if (xhr.statusText === 'abort') {

            // Has been aborted
          } else {
            // Offline mode
          }

        }
        if(this.readyState ===4) {
          if (this.status == 200) {
            var xmlDoc = xhr.responseXML;
            var x = xmlDoc.getElementsByTagName("ReceiveMessageResponse")[0];

            x = x.getElementsByTagName("ReceiveMessageResult")[0];
            var res = _this.readMessages(x,searchFor );
            if(res != null){
              // console.log(res);
              _this.showResponse(res);
            }
            _this.checkUpdatesSQS();
          } else {
            console.log("Error", xmlhttp.statusText);
            _this.checkUpdatesSQS();
          }
        }
      };
      xhr.onerror = function () {

      };
      xhr.send();
    };

    this.showResponse = function(response_element){
      var img = null;
      var trackId = null;
      var processingResultCode = null;
      var res = JSON.parse(response_element.messageBody);
      var elem = response_element.arrayElement;
      if( typeof res.resultImageURL === 'string'){
        var str = res.resultImageURL;
        //str = str.replace("s3.amazonaws.com/cam51-img-proc", "d2f1mfcynop4j.cloudfront.net");
        img = str;
      }
      if( typeof res.ProcessingResult === 'number'){
        processingResultCode = res.ProcessingResult;
      }
      if( typeof res.trackId === 'string'){
        trackId = res.trackId;
      }
      var imga = new Image();
      var _this = this;
      imga.onload = function () {
        _this.showImageCallback(elem, img , processingResultCode, trackId);
      };
      if(processingResultCode == 0){
        imga.src = img;
      } else {
        this.showImageCallback(elem, img , processingResultCode, trackId);
      }


    };

    // Can be overridden. using camera51.showImageCallbackOverride
    this.showImageCallback = function(elem, imgUrl , processingResultCode, trackId){
      if ( typeof this.showImageCallbackOverride === 'function' ) {
        this.showImageCallbackOverride(elem, imgUrl , processingResultCode, trackId);

      } else {
        var elementHeight = elem.clientHeight;
        var maxImage = elementHeight;// - 45;
        var wrapper = document.createElement('div');
        if (processingResultCode == 0) {
          var img = document.createElement('img');
          img.src = imgUrl;
          img.onmousedown = function(event){
            if(event.preventDefault){
              event.preventDefault();
            } else {
              event.returnValue = false;
            }

          };
          img.className = "img-result-preview";
          img.style.maxWidth = "180px";
          img.style.maxHeight = maxImage+"px";
          // img.onclick =  function () {
          //   camera51OpenEditor(trackId,elem.id);
          // };
          wrapper.setAttribute("onclick","camera51OpenEditor('" + trackId + "','"+ elem.id+ "');");

          wrapper.style.cursor = "pointer";
          elem.innerHTML = "";
          wrapper.appendChild(img);
          wrapper.style.height = "inherit";
          wrapper.style.width = "inherit";
          elem.appendChild(wrapper);
        }
        if (processingResultCode > 0) {
          elem.innerHTML = "";
          var errorWrapper = document.createElement('div');

          var header = document.createElement('div');

          if(processingResultCode > 99){
            header.innerHTML = camera51Text['error-header-image-failure'];
            header.className = "error-header-image-failure";
            errorWrapper.className = "camera51-error-wrapper-failure";
          } else {
            errorWrapper.className = "camera51-error-wrapper";
            var errorText = document.createElement('div');
            var str = "error-text-"+ processingResultCode;
            header.innerHTML = camera51Text[str];
            header.className = "error-header-default";
            // wrapper.onclick =  function () {
            //   camera51OpenEditor(trackId,elem.id);
            // };
            wrapper.setAttribute("onclick","camera51OpenEditor('" + trackId + "','"+ elem.id+ "');");

            wrapper.style.cursor = "pointer";
            wrapper.style.height = "inherit";
            wrapper.style.width = "inherit";
          }

          errorWrapper.appendChild(header);
          var errorTextWrapper = document.createElement('div');

          var errorText = document.createElement('div');
          if(processingResultCode > 100){
            var str = "error-text-"+ processingResultCode;
            errorText.innerHTML = camera51Text[str];
            errorText.className = "camera51-error-text-failure";
          } else {
            errorText.className = "camera51-error-text";
            errorText.innerHTML = camera51Text["click-to-fix"];
          }


          errorTextWrapper.className = "camera51-error-text-wrapper";
          errorTextWrapper.appendChild(errorText);
          errorWrapper.appendChild(errorTextWrapper);
          wrapper.appendChild(errorWrapper);
          elem.appendChild(wrapper);
        }

        if (processingResultCode <= 100) {
          var btnWrapper = document.createElement('div');
          btnWrapper.style.position = "relative";
          btnWrapper.style.left = 0;
          btnWrapper.style.right = 0;
          btnWrapper.style.bottom = "-20px";

          var btn = document.createElement('a');
          btn.innerHTML = "TOUCH UP";
          // btn.onclick =  function () {
          //   camera51OpenEditor(trackId,elem.id);
          // };
          btn.setAttribute("onclick","camera51OpenEditor('" + trackId + "','"+ elem.id+ "');");

          btn.className = "btn btn-touchup";

          btnWrapper.appendChild(btn);
          elem.appendChild(btnWrapper);

          //elem.style.cursor = "pointer";
        }
      }
    };

    this.readMessages = function(messages, searchKey){

      var message = null;
      var messageBody = null;
      var lengthMessages = messages.getElementsByTagName("Message").length;
      for(i=0; i < lengthMessages; i++){
        message = messages.getElementsByTagName("Message")[i];
        messageBody = message.getElementsByTagName("Body")[0].textContent;
        var obj = null;
        try{
          var obj = JSON.parse(messageBody);
        }catch(e){
          console.log(e); //error in the above string(in this case,yes)!
          continue;
        }
        if(obj.hasOwnProperty("messageType") && obj.messageType == "creditUpdate"){

          window.angularComponentApp.component.callCreditUpdate(obj.user);
          this.deleteMessage(message);
          return;
        }
        var searchValue;
        for(searchValue in searchArray){
          if(obj[searchKey] == searchArray[searchValue]){
            searchArray.splice(searchValue, 1);
            var arrayElement = arrayElements[searchValue]
            arrayElements.splice(searchValue, 1);

            this.deleteMessage(message);
            return {'messageBody': messageBody, 'arrayElement': arrayElement};
          }
        }
      }
      return null;
    };

    this.parseResponse = function(messageBody){

    };

    this.deleteMessage = function(message){
      var receiptHandle = message.getElementsByTagName("ReceiptHandle")[0].textContent;
      //console.log(encodeURIComponent(receiptHandle));
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
        }
      };
      xhttp.open("GET", this.sqsUrl+"?Action=DeleteMessage&ReceiptHandle="+encodeURIComponent(receiptHandle));
      xhttp.send();
    };

    this.getCookie=  function (cname)
    {
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length,c.length);
        }
      }
      return null;
    };

    this.getSQSurl = function(){
      if(this.sqsUrl == null){
        return this.setSQSurl(false);
      }
      return this.sqsUrl;
    };

    this.validateSQS = function (url) {
      var _this = this;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

        }
        if (xhttp.readyState == 4 && xhttp.status == 400) {
          _this.requestNewSQSURL();
        }

      };
      var a = url+"?Action=ReceiveMessage&WaitTimeSeconds=0&VisibilityTimeout=0";
      xhttp.open("GET", a);
      xhttp.send();
    };


    this.setSQSurl = function(sync){

      if(this.sessionToken == null || this.customerId == null){
        console.log("can not retrieve sqs url, sessionToken: " +this.sessionToken + " customerId " + this.customerId);
        return;
      }

      var sqsUrl = null;
      if(this.getCookie(this.queueStringIdentifier)){
        sqsUrl = this.getCookie(this.queueStringIdentifier);
        this.sqsUrl = sqsUrl;
        this.validateSQS(sqsUrl);
        return sqsUrl;
      }
      this.requestNewSQSURL(sync);

    };

    this.requestNewSQSURL = function(sync){
      var _this = this;
      var sqsUrl;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          var res = JSON.parse(xhttp.responseText);
          sqsUrl = res.response["queueURL"];
          if(sqsUrl == undefined || sqsUrl.length < 10){
            try {
              var errorM = res.response.errors;
              console.error("Error", errorM[0]);
              //_this.callbackNewSQSRequestError(errorM[0]); not needed anymore for customers.
            } catch (er){
              console.error(er);
            }
            return;
          }
          var date = new Date();
          var days = 1000 * 60 * 60 * 24 * 10;
          date.setTime(date.getTime() + days);
          document.cookie =
            _this.queueStringIdentifier +'=' + sqsUrl +
            '; expires=' + date.toUTCString() +
            '; path=/';

          _this.sqsUrl = sqsUrl;
          return sqsUrl;
        }
      };


      xhttp.open("POST", this.apiUrl  + "/Camera51Server/createQueue", (sync==null)? true: sync);
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhttp.send("token="+this.sessionToken+"&customerId="+this.customerId);

    };


    this.requestAsync = function(origImgUrl, element, uniqueTrackId, forceResultImage, transparent,shadow, userId, userToken){
      var _this = this;
      if(uniqueTrackId == null || uniqueTrackId == ""){
        uniqueTrackId = this.sessionToken+"-"+Date.now()+"-"+Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
      }
      if(forceResultImage == null || forceResultImage == ""){
        forceResultImage=false;
      }
      if(userToken == null || userToken == ""){
        token = this.sessionToken;
      } else {
        token = userToken;
      }
      if(transparent == null || transparent == ""){
        transparent=false;
      }
      if(shadow == null || shadow == ""){
        shadow=true;
      }
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

          var res = JSON.parse(xhttp.responseText);
          _this.callbackAsyncRequest(res);
          if(res.hasOwnProperty("response") && res.response.hasOwnProperty("sessionId")){
            _this.addSearchArray(element, res.response.sessionId);
            _this.startSQS();
          } else {
            //_this.callbackAsyncRequestError(JSON.stringify(res.response));
            console.error(res.response);
          }
        }
      };
      xhttp.open("POST", this.apiUrl + "/Camera51Server/processImageAsync");
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      var requestBodyObject = { "token" : token ,
        "customerId":this.customerId,
        "trackId":uniqueTrackId,
        "originalImageURL":origImgUrl,
        "callbackURL":this.sqsUrl,
        "forceResultImage":forceResultImage,
        "transparent":transparent,
        "shadow":shadow,
        "userId":userId
      };
      var requestBodyObject = mergeObject(requestBodyObject).join("&");

      xhttp.send(requestBodyObject);
      return uniqueTrackId;
    };

    this.parseStringToSessionId = function(str){
      return url.substring(url.lastIndexOf("SID"), url.lastIndexOf("/"));
    };

    this.loaded();
  }

  function noop(){
    //do nothing
  }

  function mergeObject(obj){
    var arr = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(key + '=' + obj[key]);
      }
    };
    return arr;
  }

})(this, document);

if (typeof Object.assign != 'function') {
  Object.assign = function(target) {
    'use strict';
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}
