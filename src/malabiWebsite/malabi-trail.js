

  var myurl = "trial.malabi.co";
  var currenturl = window.location.hostname;
  if(window.location.protocol != "https:" && myurl == currenturl) {
    window.location = 'https:' + window.location.href.substring(window.location.protocol.length);
  }

  /*if (screen.width <= 800) {
    window.location = "http://malabi.co";
  }*/

  var customerId = 5;
  var customerSessionToken = "2acb46bb-d9ce-4c5f-9e7d-c0cb909418d9";
  var camera51EditorIframe = "camera51Iframe";
  /* create this mapping and pass it to camera51WithQueue.init in order to
   * override text with localization
   * see full list of keys in documentation
   */

  window.addEventListener("message", function(e){
    switch (e.data){
      case "openPlans":
        window.angularComponentRef.component.toggelPlans();
        break;
      case "openMyAccount":
        window.angularComponentYourinfoshopify.component.openModal();
        break;
//      case "modalConfirmResponseFalse":
//        window.angularComponentShopify.component.modalConfirmResponse(false);
//        break;
//      case "modalConfirmResponseTrue":
//        window.angularComponentShopify.component.modalConfirmResponse(true);
//        break;
      case "refreshShopifyProducts":
        window.angularComponentShopify.component.refreshShopifyProducts();
        break;
      default:
        //console.log(e.data, "nothing to run");
    }

  }, false);


  $(document).ready(function () {
    /*$(".button-collapse").sideNav();
$(".dropdown-button").dropdown({ 'hover': true });
*/

    // call to initialize the Camera51 object
    camera51WithQueue.init({
      "customerId": customerId,
      "showTutorial": true,
      "sessionToken": customerSessionToken,
      "camera51EditorIframe": camera51EditorIframe,
      "decreaseInnerHeight": 20,
      "wrappermarginTop":10,
      "apiUrl":apiUrl,
    });


    // version which does not show errors.
    camera51WithQueue.showImageCallbackOverride = function(elem, imgUrl , processingResultCode, trackId){
      var elementHeight = elem.clientHeight;
      var maxImage = elementHeight;// - 45;
      var wrapper = document.createElement('div');
      if (processingResultCode < 100 ) {
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
      if (processingResultCode > 100) {
        elem.innerHTML = "";
        var errorWrapper = document.createElement('div');

        var header = document.createElement('div');

        if(processingResultCode > 100){

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
      window.angularComponentApp.component.updatedImages();
    }

  });


  // implement this function and call it after your user has uploaded a new image
  function requestImage(imageId, origImgUrl) {
    var responseElement = document.getElementById("resultPreview-" + imageId);

    // start loader
    var str = 'resultPreview-' + imageId + ' .preloader-wrapper';
    $("#"+str ).addClass('active');

    // image should be https !

    if(isloggedIn){
      ga('send', 'event', 'Site', 'request async','isloggedIn=true&userId='+siteUserId+'&customerId='+customerId);
      ga('send', 'event', 'Site request async', siteUserId , origImgUrl);
    } else {
      ga('send', 'event', 'Site', 'request async','isloggedIn=false&customerId='+customerId);
      ga('send', 'event', 'Site request async', "unknown" , origImgUrl);
    }


    /*
     call to process an image. pass the element
     and camera51.js will insert the response into this element.
     response will include and image or response message. Under it a button.
     */
    camera51WithQueue.requestAsync( origImgUrl, responseElement, "", true,false, false, siteUserId, siteUserToken );
  }

  /*
   implement this function to open Camera51 Editor.
   function name must be camera51OpenEditor in order to use camera51 builtin callback.
   function receives a trackId and imgElementId to set the src to the resultUrl.
   */
  function camera51OpenEditor(trackId, responseElementId) {
    var showWatermark = false;
    if(isloggedIn){
      ga('send', 'event', 'Site', 'open editor','isloggedIn=true&userId='+siteUserId+'customerId='+customerId);
    } else {
      showWatermark= true;
      ga('send', 'event', 'Site', 'open editor','isloggedIn=false&customerId='+customerId+'trackId='+trackId);
    }

    //reset transparent, shadow
    document.getElementById("camera51-show-transparent").checked = false;
    document.getElementById("camera51-show-shadow").checked = false;

    var responseElement = document.getElementById(responseElementId);
    /*
     implement the onSaveWithResult and pass it to Camera51.openEditorWithTrackId.
     this function specify what to do once the user selected an image in the editor.
     */
    var onSaveWithResult = function (resultUrl) {
      $('#modal1').closeModal();
    };

    $('#modal1').openModal();


    // open the editor
    camera51WithQueue.openEditorWithTrackId({
      'customerId': customerId,
      'trackId': trackId,
      'showWatermark':showWatermark,
      // 'wrappermarginTop': "10"
    }, onSaveWithResult, responseElement);
  }
