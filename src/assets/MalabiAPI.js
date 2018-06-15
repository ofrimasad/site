(function (window, document) {

  var editorVersion = "v3";
  var malabiAPI = new MalabiAPI();

  window.waitForSQS = false; // should sqs keep listening.

  window.malabiAPI = malabiAPI;

  var camera51Text = {
    "show-result": "preview result",
    "back-to-edit": "back to edit",
    "tooltip-mark-background": "Draw lines to mark areas you want to remove from the image",
    "tooltip-mark-object": "Draw lines to mark areas you want to keep in the image",
  };
  window.camera51Text = camera51Text;

  var overrideTutorialElement = null;
  var injectStyleToIframe = null;


  function MalabiAPI() {
    this.apiUrl = null;
    this.customerId = null;
    this.userId = null;
    this.sessionToken = null;
    this.sqsRunning = false;
    this.camera51Text = camera51Text;
    this.iframeElement = null;
    this.isInit = false; // if Camera51WithQueue as init run.
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

    var camera51HelperExtractDomain = function (url) {
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
        'camera51-btn-show-result': "show-result",
        'camera51-btn-save-image': 'save-image'
      };

      Object.keys(listElement).forEach(function (key) {
        if (_this.camera51Text.hasOwnProperty(listElement[key]))
          setAttributeText(key, _this.camera51Text[listElement[key]]);
      });
    };


    var startLoader = function () {
      disableButtons();
      if (document.getElementById("camera51-loader")) {
        document.getElementById('camera51-loader').style.visibility = "";
        // document.getElementById('camera51highlevelloader').style.display= "block";
      } else {
        console.error("Error Camera51 Init: Loader element not found, looking for #camera51-loader element. Or add your override with your own callbackStartLoader function.");
      }
    };
    var stopLoader = function () {

      if (document.getElementById("camera51-loader")) {
        document.getElementById('camera51-loader').style.visibility = "hidden";
        //   document.getElementById('camera51highlevelloader').style.display= "none";
      } else {
        console.error("Error Camera51 Init: Loader element not found, looking for #camera51-loader element. Or add your override with your own callbackStopLoader function.");
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

    this.init = function (customerId, _settings) {

      if (this.isInit) {
        return;
      }

      setGoogleAnalytics();

      this.isInit = true;

      this.customerId = customerId;
      this.settings = _settings;
      this.settings.RETURN_IFRAME = 1;
      this.settings.RETURN_EDITOR = 2;

      if (this.settings.hasOwnProperty('camera51Text')) {
        this.camera51Text = Object.assign(this.camera51Text, this.settings.camera51Text);
      }
      if (this.settings.hasOwnProperty('transparent') && this.settings.transparent == true) {
        this.transparent = true;
      }

      addDiv(this);

      this.apiUrl = apiUrl;

    };

    var addStyleSheet = function (url) {
      var sc = document.createElement("link");
      sc.setAttribute("href", url);
      sc.setAttribute("rel", "stylesheet");
      document.head.appendChild(sc);
    };

    var addDiv = function(_this) {

      addStyleSheet("https://fonts.googleapis.com/icon?family=Material+Icons"); //TODO - check if required
      addStyleSheet("https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/css/materialize.min.css");//TODO - check if required
      addStyleSheet("https://assets-malabi.s3.amazonaws.com/temp/malabi-image-background-editor.css");

      var newDiv = document.createElement('div');
      newDiv.id="modal1";
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

            frameDomain = camera51HelperExtractDomain(iFrameSrc);
            iFrame = document.createElement('iFrame');
            _this.iframeElement = iFrame;

            // For development, make API calls to local host - for Camera51 internal use only.
            if (window.location.search.indexOf('camera51api=local') > -1) {
              console.log("camera51api=localhost8080");
              _this.settings.apiUrl = "http://localhost:8080";
            }

            if (!_this.settings.hasOwnProperty('camera51EditorIframe')) {
              console.log('Camera51 Error: Please specify camera51EditorIframe');
              return;
            } else {
              if (document.getElementById(_this.settings.camera51EditorIframe) == null) {
                console.log('Camera51 Error: Cannot find camera51EditorIframe in dom ' + _this.settings.camera51EditorIframe);
                return;
              }
            }

            var element = document.getElementById('camera51Frame');
            if (element == null || typeof(element) == 'undefined') {   // If iFrame doesn't exist, create it.

              // _this.startLoader();
              iFrame.frameBorder = 0;
              iFrame.width = "100%";
              iFrame.height = "100%";
              iFrame.id = "camera51Frame";
              iFrame.setAttribute("src", iFrameSrc);
              iFrame.style = "border:0;";

              if (_this.settings != null)
                document.getElementById(_this.settings.camera51EditorIframe).appendChild(iFrame);


              //  _this.iframeElement =  document.getElementById(_this.settings.elementId);
            }

            var __this = _this;

            iFrame.addEventListener("load", function () {
              __this.editorFrame = document.getElementById('camera51Frame');
              stopLoader(__this.settings.RETURN_IFRAME);
              enableButtons();
              setEditorText();
              if (__this.settings.hasOwnProperty('apiUrl')) {
                __this.editorFrame.contentWindow.postMessage({'initCamera51': JSON.stringify(__this.settings)}, frameDomain);
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
        var elms = document.querySelectorAll('*[id^="camera51-btn"]');
        if (elms.length > 0) {

          for (var i = 0; i < elms.length; i++) {
            uclass.remove(elms[i], 'disabled');
          }
        }
    };

    var disableButtons = function () {

      var elms = document.querySelectorAll('*[id^="camera51-btn"]');
      if (elms.length > 0) {
        for (i = 0; i < elms.length; i++) {
          uclass.add(elms[i], 'disabled');
        }
      }

    };

    var disableUndo = function () {
      if (document.getElementById("camera51-btn-undo")) {
          var elm = document.getElementById("camera51-btn-undo");
          uclass.add(elm, 'disabled');
      } else {
        console.error("Error Camera51 Init: camera51-btn-undo element not found, looking for #camera51-btn-undo element. Or add your override with your own callbackDisableUndo function.");
      }
    };

    // this.openEditorWithTrackId = function (obj, responseOnSave, responseElement) {
    //
    //   ga('send', 'event', 'Site', 'open editor','customerId='+customerId+'imageId='+imageId);
    //
    //
    //   if (responseOnSave) {
    //     this.responseOnSave = responseOnSave;
    //     this.responseOnSave.imageId = obj.imageId;
    //     this.responseOnSave.responseElement = responseElement;
    //     this.responseOnSave.secret = obj.secret;
    //   } else {
    //     this.responseOnSave = null;
    //   }
    //   editorFrame.contentWindow.postMessage({
    //     'action': 'openEditor',
    //     'customerId': obj.customerId,
    //     'imageId': obj.imageId,
    //     'secret': obj.secret
    //   }, frameDomain);
    //   return true;
    // };

    this.edit = function (imageId, secret, callbackFunc) {

      $('#modal1').openModal();

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
      if (document.getElementById("camera51-show-shadow")) {
        removeShadow = document.getElementById("camera51-show-shadow").checked;
      }
      if (document.getElementById("camera51-show-transparent")) {
        applyTransparent = document.getElementById("camera51-show-transparent").checked;
      }
      var run = {"action": "showResult", removeShadow: removeShadow, applyTransparent: applyTransparent};
      this.editorFrame.contentWindow.postMessage(run, frameDomain);
      return 1;
    };

    this.saveImage = function () {
      var removeShadow = false;
      var applyTransparent = false;
      if (document.getElementById("camera51-show-shadow")) {
        removeShadow = document.getElementById("camera51-show-shadow").checked;
      }
      if (document.getElementById("camera51-show-transparent")) {
        applyTransparent = document.getElementById("camera51-show-transparent").checked;
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
          $('#modal1').closeModal();
          if (typeof _this.responseOnSave === 'function') {
            _this.responseOnSave(data.url);
            //camera51WithQueue.showImageCallback(_this.responseOnSave.responseElement, data.url, 0, _this.responseOnSave.imageId, _this.responseOnSave.secret);
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
        if (document.getElementById("camera51-btn-show-result")) {
          document.getElementById("camera51-btn-show-result").innerText = camera51Text['show-result'];
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
        if (document.getElementById("camera51-btn-show-result")) {
          document.getElementById("camera51-btn-show-result").innerText = camera51Text['back-to-edit'];
        }
      }
    });
  }
})(this, document);

