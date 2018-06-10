(function (window, document) {

  var editorVersion = "v3";
  var malabiAPI = new MalabiAPI();

  window.waitForSQS = false; // should sqs keep listening.

  window.malabiAPI = malabiAPI;

  camera51Text = {
    "show-result": "preview result",
    "back-to-edit": "back to edit",
    "click-to-fix": "Click to edit",
    "tooltip-mark-background": "Draw lines to mark areas you want to remove from the image",
    "tooltip-mark-object": "Draw lines to mark areas you want to keep in the image",

    "error-header-default": "Press here for manual background removal",
    "error-header-image-failure": "Image error",
    "error-text-7": "<b>GRAPHIC BANNER</b>",
    "error-text-6": "<b>GRAPHIC BANNER</b>",
    "error-text-100": "<b>GRAPHIC BANNER</b>",
    "error-text-5": "<b>CLEAR BACKGROUND</b>",
    "error-text-2": "<b>LOW CONTRAST</b>",
    "error-text-4": "<b>CLUTTERED IMAGE</b>",
    "error-text-103": "Image <b>too small</b> to be processed<br><font size='2'>(image size should be at least 70x70px)</font>",
    "error-text-101": "Image cannot be processed",
    "error-text-default": "Background was not automatically removed, you may remove it manually"
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
    this.settings;

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
        return window.location.protocol + "//" + domain[1];
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

    this.init = function (_settings) {

      this.settings = _settings;

      _settings.RETURN_IFRAME = 1;
      _settings.RETURN_EDITOR = 2;

      if (this.settings.hasOwnProperty('camera51Text')) {
        this.camera51Text = Object.assign(this.camera51Text, this.settings.camera51Text);
      }
      if (this.settings.hasOwnProperty('transparent') && this.settings.transparent == true) {
        this.transparent = true;
      }

      this.apiUrl = apiUrl;

      if (this.settings.hasOwnProperty('iFrameSrc') && this.settings.iFrameSrc.length > 1) {
        iFrameSrc = this.settings.iFrameSrc;
      } else {
        iFrameSrc = window.location.protocol + "//d8tv8no6fkiw3.cloudfront.net/version/" + editorVersion + "/index.html";
      }

      frameDomain = camera51HelperExtractDomain(iFrameSrc);
      iFrame = document.createElement('iFrame');
      this.iframeElement = iFrame;

      // For development, make API calls to local host - for Camera51 internal use only.
      if (window.location.search.indexOf('camera51api=local') > -1) {
        console.log("camera51api=localhost8080");
        this.settings.apiUrl = "http://localhost:8080";
      }

      if (!this.settings.hasOwnProperty('camera51EditorIframe')) {
        console.log('Camera51 Error: Please specify camera51EditorIframe');
        return;
      } else {
        if (document.getElementById(this.settings.camera51EditorIframe) == null) {
          console.log('Camera51 Error: Cannot find camera51EditorIframe in dom ' + this.settings.camera51EditorIframe);
          return;
        }
      }

      var element = document.getElementById('camera51Frame');
      if (element == null || typeof(element) == 'undefined') {   // If iFrame doesn't exist, create it.

        // this.startLoader();
        iFrame.frameBorder = 0;
        iFrame.width = "100%";
        iFrame.height = "100%";
        iFrame.id = "camera51Frame";
        iFrame.setAttribute("src", iFrameSrc);
        iFrame.style = "border:0;";

        if (this.settings != null)
          document.getElementById(this.settings.camera51EditorIframe).appendChild(iFrame);


        //  this.iframeElement =  document.getElementById(this.settings.elementId);
      }

      var _this = this;

      iFrame.addEventListener("load", function () {
        editorFrame = document.getElementById('camera51Frame');
        stopLoader(_this.settings.RETURN_IFRAME);
        enableButtons();
        setEditorText();
        if (_this.settings.hasOwnProperty('apiUrl')) {
          editorFrame.contentWindow.postMessage({'initCamera51': JSON.stringify(_settings)}, frameDomain);
        }
        if (_this.settings.hasOwnProperty('backgroundColor')) {
          editorFrame.contentWindow.postMessage({'backgroundColor': _this.settings.backgroundColor}, frameDomain);
        }
        if (_this.injectStyleToIframe) {
          _this.iframeElement.contentDocument.head.appendChild(_this.injectStyleToIframe);
        }
        if (_this.overrideTutorialElement) {
          _this.iframeElement.contentDocument.getElementById("show-tutorial-first-time").innerHTML = "";
          _this.iframeElement.contentDocument.getElementById("show-tutorial-first-time").appendChild(_this.overrideTutorialElement);
        }

      });
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

    this.openEditorWithTrackId = function (obj, responseOnSave, responseElement) {

      if (responseOnSave) {
        this.responseOnSave = responseOnSave;
        this.responseOnSave.trackId = obj.trackId;
        this.responseOnSave.responseElement = responseElement;
      } else {
        this.responseOnSave = null;
      }
      editorFrame.contentWindow.postMessage({
        'action': 'openEditorWithTrackId',
        'customerId': obj.customerId,
        'trackId': obj.trackId,
        'objInJsonString': JSON.stringify(obj)
      }, frameDomain);
      return true;
    };

    this.setColor = function (color) {
      editorFrame.contentWindow.postMessage('setColor_' + color, frameDomain);
      return 1;
    };

    this.backToEdit = function () {
      var run = {"action": "backToEdit"};
      editorFrame.contentWindow.postMessage(run, frameDomain);
      return 1;
    };

    this.showResult = function () {
      console.log("showResult");
      var removeShadow = false;
      var applyTransparent = false;
      if (document.getElementById("camera51-show-shadow")) {
        removeShadow = document.getElementById("camera51-show-shadow").checked;
      }
      if (document.getElementById("camera51-show-transparent")) {
        applyTransparent = document.getElementById("camera51-show-transparent").checked;
      }
      var run = {"action": "showResult", removeShadow: removeShadow, applyTransparent: applyTransparent};
      editorFrame.contentWindow.postMessage(run, frameDomain);
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
      editorFrame.contentWindow.postMessage(run, frameDomain);
      return 1;
    };

    this.zoomIn = function () {
      /** @namespace editorFrame.contentWindow */
      editorFrame.contentWindow.postMessage('zoomIn', frameDomain);
      return 1;
    };

    this.zoomOut = function () {
      editorFrame.contentWindow.postMessage('zoomOut', frameDomain);
      return 1;
    };

    this.onclickLongZoomIn = function () {
      editorFrame.contentWindow.postMessage('onclickLongZoomIn', frameDomain);
      return 1;
    };

    this.onmouseupLongZoomIn = function () {
      editorFrame.contentWindow.postMessage('onmouseupLongZoomIn', frameDomain);
      return 1;
    };

    this.onclickLongZoomOut = function () {
      editorFrame.contentWindow.postMessage('onclickLongZoomOut', frameDomain);
      return 1;
    };

    this.onmouseupLongZoomOut = function () {
      editorFrame.contentWindow.postMessage('onmouseupLongZoomOut', frameDomain);
      return 1;
    };

    this.undo = function () {
      editorFrame.contentWindow.postMessage('undo', frameDomain);
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
          if (typeof _this.responseOnSave === 'function') {
            _this.responseOnSave(data.url);
            camera51WithQueue.showImageCallback(_this.responseOnSave.responseElement, data.url, 0, _this.responseOnSave.trackId);
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
          document.getElementById("camera51-btn-show-result").innerText = _this.camera51Text['show-result'];
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
          document.getElementById("camera51-btn-show-result").innerText = _this.camera51Text['back-to-edit'];
        }
      }
    });
  }
})(this, document);

