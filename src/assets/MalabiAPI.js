(function (window, document) {

  var MODAL_NAME = "malabiEditorModal";
  var MALABI_EDITOR_IFRAME_NAME = "malabiEditorIFrame";

  var malabiAPI = new MalabiAPI();

  window.waitForSQS = false; // should sqs keep listening.

  window.malabiAPI = malabiAPI;

  var malabiEditorText = {
    "show-result": "preview result",
    "back-to-edit": "back to edit",
    "tooltip-mark-background": "Draw lines to mark areas you want to remove from the image",
    "tooltip-mark-object": "Draw lines to mark areas you want to keep in the image"
  };
  window.malabiEditorText = malabiEditorText;

  var overrideTutorialElement = null;
  var injectStyleToIframe = null;


  function MalabiAPI() {
    this.apiUrl = null;
    this.customerId = null;
    this.userId = null;
    this.sessionToken = null;
    this.sqsRunning = false;
    this.malabiEditorText = malabiEditorText;
    this.iframeElement = null;
    this.isInit = false;
    this.functionArrayToRunAferInit = []; // array of function to run after object is initialized.
    this.settings = {};
    this.editorFrame = {};

    var frameDomain;
    var iFrame;
    var apiUrl = "//api.malabi.co";
    var iFrameSrc = "";
    this.transparent = false;
    this.overrideTutorialElement = overrideTutorialElement;
    this.injectStyleToIframe = injectStyleToIframe; // has to be type style.

    var uclass = {
      exists: function (elem, className) {
        var p = new RegExp('(^| )' + className + '( |$)');
        return (elem.className && elem.className.match(p));
      },
      add: function (elem, className) {
        if (this.exists(elem, className)) {
          return true;
        }
        elem.className += ' ' + className;
      },
      remove: function (elem, className) {
        var c = elem.className;
        var p = new RegExp('(^| )' + className + '( |$)');
        c = c.replace(p, ' ').replace(/  /g, ' ');
        elem.className = c;
      }
    };

    var extractDomain = function (url) {
      var regExp = /\/\/(.[^/]+)/;
      var domain = url.match(regExp);
      if (domain == undefined) {
        var urlString = window.location.href;
        var arr = urlString.split("/");
        domain = arr[0] + "//" + arr[2];
        return domain;
      } else {
        return "http://" + domain[1];//window.location.protocol + "//" + domain[1]; //TODO
      }
    };

    var setAttributeText = function (atr, str) {
      if (document.getElementById(atr)) {
        var buttonShowresult = document.getElementById(atr);
        buttonShowresult.innerText = str;
      }
    };

    var setEditorText = function () {
      var _this = this;
      var listElement = {
        'malabi-btn-show-result': "show-result",
        'malabi-btn-save-image': 'save-image'
      };

      Object.keys(listElement).forEach(function (key) {
        if (_this.malabiEditorText.hasOwnProperty(listElement[key]))
          setAttributeText(key, _this.malabiEditorText[listElement[key]]);
      });
    };


    var startLoader = function () {
      disableButtons();
      if (document.getElementById("malabi-loader")) {
        document.getElementById('malabi-loader').style.visibility = "";
      } else {
        console.error("Error Malabi Init: Loader element not found, looking for #malabi-loader element. Or add your override with your own callbackStartLoader function.");
      }
    };
    var stopLoader = function () {

      if (document.getElementById("malabi-loader")) {
        document.getElementById('malabi-loader').style.visibility = "hidden";
      } else {
        console.error("Error Malabi Init: Loader element not found, looking for #malabi-loader element. Or add your override with your own callbackStopLoader function.");
      }

    };

    var setGoogleAnalytics = function() {
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-75726540-1', 'auto');
      ga('send', 'pageview');
      ga(function(tracker) {
        var clientId = tracker.get('clientId');
        ga('set', 'dimension1', clientId);
      });
    };

    this.init = function (_settings) {

      if (!_settings || !_settings.customerId) {
        console.error("Malabi init() fail - you must supply an object containing the customerId")
      }

      if (this.isInit) {
        return;
      }

      setGoogleAnalytics();

      this.isInit = true;

      this.customerId = _settings.customerId;
      this.settings = _settings;
      this.settings.RETURN_IFRAME = 1;
      this.settings.RETURN_EDITOR = 2;

      if (this.settings.hasOwnProperty('malabiEditorText')) {
        this.malabiEditorText = Object.assign(this.malabiEditorText, this.settings.malabiEditorText);
      }
      if (this.settings.hasOwnProperty('transparent') && this.settings.transparent == true) {
        this.transparent = true;
      }

      addStyleSheets();
      addDiv(this);

      if (_settings.apiUrl) {
        this.apiUrl = _settings.apiUrl;
        console.log("API URL set to: " + this.apiUrl);
      }

    };

    var addStyleSheets = function() {
      addStyleSheet("https://fonts.googleapis.com/icon?family=Material+Icons");
      addStyleSheet("https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/css/materialize.min.css");
      addStyleSheet("https://assets-malabi.s3.amazonaws.com/temp/malabi-editor.css");
    };

    var addStyleSheet = function (url) {

      var styleSheets = document.styleSheets;
      for (var i = 0; i < styleSheets.length; i++) {
        if (styleSheets[i].href == url){
          console.log(url + " already exist");
          return;
        }
      }

      var newStyleSheet = document.createElement("link");
      newStyleSheet.setAttribute("href", url);
      newStyleSheet.setAttribute("rel", "stylesheet");
      document.head.appendChild(newStyleSheet);
    };

    var addDiv = function(_this) {

      if (document.getElementById(MODAL_NAME))
        return;


      var newDiv = document.createElement('div');
      newDiv.id = MODAL_NAME;
      newDiv.setAttribute("class", "modal modal-wider");

      newDiv.setAttribute("style", "margin-bottom: -8px;display: none;");
      document.body.appendChild(newDiv);

      var request = new XMLHttpRequest();
      request.open('GET', "https://assets-malabi.s3.amazonaws.com/temp/modal.html", true);
      request.send(null);

      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          var type = request.getResponseHeader('Content-Type');
          if (type.indexOf("text") !== 1) {
            newDiv.innerHTML = request.responseText.trim();

            if (_this.settings.hasOwnProperty('iFrameSrc') && _this.settings.iFrameSrc.length > 1) {
              iFrameSrc = _this.settings.iFrameSrc;
            } else {
              iFrameSrc = "http://localhost:4201/index.html";//window.location.protocol + d8tv8no6fkiw3.cloudfront.net/version/" + editorVersion + "/index.html"; //TODO
            }

            frameDomain = extractDomain(iFrameSrc);
            iFrame = document.createElement('iFrame');
            _this.iframeElement = iFrame;

            // For development, make API calls to local host - for Malabi internal use only.
            if (window.location.search.indexOf('malabiApi=local') > -1) {
              console.log("apiUrl=localhost8080");
              _this.settings.apiUrl = "http://localhost:8080";
            }

            var element = document.getElementById('malabiFrame');
            if (element == null || typeof(element) == 'undefined') {   // If iFrame doesn't exist, create it.

              // _this.startLoader();
              iFrame.frameBorder = 0;
              iFrame.width = "100%";
              iFrame.height = "100%";
              iFrame.id = "malabiFrame";
              iFrame.setAttribute("src", iFrameSrc);
              iFrame.style = "border:0;";

              document.getElementById(MALABI_EDITOR_IFRAME_NAME).appendChild(iFrame);

            }

            var __this = _this;

            iFrame.addEventListener("load", function () {
              __this.editorFrame = document.getElementById('malabiFrame');
              stopLoader(__this.settings.RETURN_IFRAME);
              enableButtons();
              setEditorText();
              if (__this.settings) {
                __this.editorFrame.contentWindow.postMessage({'initMalabi': JSON.stringify(__this.settings)}, frameDomain);
              }
              if (__this.settings.hasOwnProperty('backgroundColor')) {
                __this.editorFrame.contentWindow.postMessage({'backgroundColor': __this.settings.backgroundColor}, frameDomain);
              }
              if (__this.injectStyleToIframe) {
                __this.iframeElement.contentDocument.head.appendChild(__this.injectStyleToIframe);
              }
              if (__this.overrideTutorialElement) {
                __this.iframeElement.contentDocument.getElementById("show-tutorial-first-time").innerHTML = "";
                __this.iframeElement.contentDocument.getElementById("show-tutorial-first-time").appendChild(__this.overrideTutorialElement);
              }

            });
          }
        }
      }
    };


    var enableButtons = function () {
        var elms = document.querySelectorAll('*[id^="malabi-btn"]');
        if (elms.length > 0) {

          for (var i = 0; i < elms.length; i++) {
            uclass.remove(elms[i], 'disabled');
          }
        }
    };

    var disableButtons = function () {

      var elms = document.querySelectorAll('*[id^="malabi-btn"]');
      if (elms.length > 0) {
        for (i = 0; i < elms.length; i++) {
          uclass.add(elms[i], 'disabled');
        }
      }

    };

    var disableUndo = function () {
      if (document.getElementById("malabi-btn-undo")) {
          var elm = document.getElementById("malabi-btn-undo");
          uclass.add(elm, 'disabled');
      } else {
        console.error("Error Malabi Init: malabi-btn-undo element not found, looking for #malabi-btn-undo element. Or add your override with your own callbackDisableUndo function.");
      }
    };

    this.edit = function (imageId, secret, callbackFunc) {

      addDiv();

      $('#' + MODAL_NAME).openModal();

      ga('send', 'event', 'Site', 'open editor','customerId='+customerId+'imageId='+imageId);

      if (callbackFunc && typeof callbackFunc === "function")
        this.responseOnSave = callbackFunc;
      else
        this.responseOnSave = null;

      this.editorFrame.contentWindow.postMessage({
        'action': 'openEditor',
        'customerId': this.customerId,
        'imageId': imageId,
        'secret': secret
      }, frameDomain);
      return true;
    };

    this.setColor = function (color) {
      this.editorFrame.contentWindow.postMessage('setColor_' + color, frameDomain);
      return 1;
    };

    this.backToEdit = function () {
      var run = {"action": "backToEdit"};
      this.editorFrame.contentWindow.postMessage(run, frameDomain);
      return 1;
    };

    this.showResult = function () {
      var removeShadow = false;
      var applyTransparent = false;
      if (document.getElementById("malabi-show-shadow")) {
        removeShadow = document.getElementById("malabi-show-shadow").checked;
      }
      if (document.getElementById("malabi-show-transparent")) {
        applyTransparent = document.getElementById("malabi-show-transparent").checked;
      }
      var run = {"action": "showResult", removeShadow: removeShadow, applyTransparent: applyTransparent};
      this.editorFrame.contentWindow.postMessage(run, frameDomain);
      return 1;
    };

    this.saveImage = function () {
      var removeShadow = false;
      var applyTransparent = false;
      if (document.getElementById("malabi-show-shadow")) {
        removeShadow = document.getElementById("malabi-show-shadow").checked;
      }
      if (document.getElementById("malabi-show-transparent")) {
        applyTransparent = document.getElementById("malabi-show-transparent").checked;
      }
      var run = {"action": "saveImage", removeShadow: removeShadow, applyTransparent: applyTransparent};
      this.editorFrame.contentWindow.postMessage(run, frameDomain);
      return 1;
    };

    this.zoomIn = function () {
      /** @namespace editorFrame.contentWindow */
      this.editorFrame.contentWindow.postMessage('zoomIn', frameDomain);
      return 1;
    };

    this.zoomOut = function () {
      this.editorFrame.contentWindow.postMessage('zoomOut', frameDomain);
      return 1;
    };

    this.onclickLongZoomIn = function () {
      this.editorFrame.contentWindow.postMessage('onclickLongZoomIn', frameDomain);
      return 1;
    };

    this.onmouseupLongZoomIn = function () {
      this.editorFrame.contentWindow.postMessage('onmouseupLongZoomIn', frameDomain);
      return 1;
    };

    this.onclickLongZoomOut = function () {
      this.editorFrame.contentWindow.postMessage('onclickLongZoomOut', frameDomain);
      return 1;
    };

    this.onmouseupLongZoomOut = function () {
      this.editorFrame.contentWindow.postMessage('onmouseupLongZoomOut', frameDomain);
      return 1;
    };

    this.undo = function () {
      this.editorFrame.contentWindow.postMessage('undo', frameDomain);
      return 1;
    };



    var _this = this;
    // Listen for response messages from the frames.
    window.addEventListener('message', function (e) {
      if (e.origin !== frameDomain)
        return;
      var data = e.data;

      if (e.data == false) {
        console.log("callbackFuncClose");
      }
      if (e.data.hasOwnProperty('url') && data.url.length > 5) {
        enableButtons();
        if (window.malabiAPI.settings.hasOwnProperty('callbackFuncSave')) {
          window.malabiAPI.settings.callbackFuncSave(data.url, _this.responseOnSave);
        } else {
          $('#' + MODAL_NAME).closeModal();
          if (typeof _this.responseOnSave === 'function') {
            _this.responseOnSave(data.url);
          } else {
            console.error("No function to run on save. Implment 'callbackFuncSave', recieves url.");
          }
        }
      }
      if (e.data.hasOwnProperty('loader')) {
        if (data.loader == true) {
          startLoader();
        }
        if (data.loader == false) {
          stopLoader(this.RETURN_EDITOR);
        }
      }
      if (e.data.hasOwnProperty('error')) {
        console.error(data);
        stopLoader();
      }
      if (e.data.hasOwnProperty('returnFromShowResult')) {
        if (window.malabiAPI.settings.hasOwnProperty('returnFromShowResult')) {
          window.malabiAPI.settings.returnFromShowResult();
          return;
        }
        if (document.getElementById("malabi-btn-show-result")) {
          document.getElementById("malabi-btn-show-result").innerText = malabiEditorText['show-result'];
        }
        enableButtons();
      }
      if (e.data.hasOwnProperty('inEditMode')) {
        stopLoader();
        enableButtons();
        if (window.malabiAPI.settings.hasOwnProperty('callbackInEditMode')) {
          window.malabiAPI.settings.callbackInEditMode();
        }
      }
      if (e.data.hasOwnProperty('callbackInShowResult')) {
        console.log("callbackInShowResult");
        if (window.malabiAPI.settings.hasOwnProperty('callbackInShowResult')) {
          window.malabiAPI.settings.callbackInShowResult();
        }
        stopLoader();
        enableButtons();
        disableUndo();
        if (document.getElementById("malabi-btn-show-result")) {
          document.getElementById("malabi-btn-show-result").innerText = malabiEditorText['back-to-edit'];
        }
      }
    });
  }
})(this, document);

