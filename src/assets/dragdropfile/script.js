
//var apiUrl = "https://sandbox.malabi.co";
var apiUrl = "https://api.malabi.co";

var isloggedIn = false;
var showWatermark = true;
var siteUserId = null;
var siteUserToken = null;
var imageArray = [];

// remove if no image left
function updateRemoveImage() {
  setTimeout(function () {
    var numItems = $('.eachImage').length;
    if (numItems == 0) {
      $("#download-images-wrapper").css('display', 'none');
      //$("#try-it-free").css('display', 'block');
    }
  }, 100);
}

$(document).bind("contextmenu",function(e){
  e.preventDefault()
});


/*$(window).bind('beforeunload', function(){
 var numItems = $('.eachImage').length;
 if(numItems >0){
 return "Data will be lost if you leave the page, are you sure?";
 }
 });*/




$(document).ready(function () {
  $("#select-all").click(function(){
    $(".camera51-select-image").prop('checked', true);
  });
  $("#delete-selected").click(function(){
    $("input:checkbox:checked").each(function(){
      $(this).closest('.eachImage').remove();
    });

  });
  $("#download-images").click(function(){
    if(isloggedIn == false){
      window.location.href ="#/register";
      return;
    }
    imageArray = [];

    $(".eachImage").each(function(){
      var imgSrc = $(this).find(".resultPreview").find('img').attr('src');
      var imgE = $(this).find(".resultPreview").find('img');

      if(imgSrc != undefined){
        $(imgE).addClass("downloadMeDownload");
        imageArray.push(imgSrc);

      }
    });
    window.angularComponentApp.component.downloadImages(imageArray);
  });

  if ($(window).height() < 800) {
    console.log($(window).height());
    $('#modal1').css('height', $(window).height()-50);
    $('#modal1').css('max-height', $(window).height()-50);
  }
  else {
    //$('#modal1').removeClass("modal-height-small");
  }


  camera51WithQueue.callbackAsyncRequestError = function(mes){
    $('#show-token-error').openModal();
    $('#errorSubject').html("callbackAsyncRequestError");
    $('#errorMessage').html(mes);
  };

  camera51WithQueue.callbackNewSQSRequestError = function(mes){
    $('#show-token-error').openModal();
    $('#errorSubject').html("callbackNewSQSRequestError");
    $('#errorMessage').html("Error in creating SQS, please contact info@malabi.co <br> <br> error " + mes);
  };



  function getCamera51SessionToken(){
    var cookieForSession = "camera51.sessionToken";
    if(camera51WithQueue.getCookie(cookieForSession)){
      sessionToken = camera51WithQueue.getCookie(cookieForSession);
      sessionTokenReady(sessionToken);
    }
    if(customerToken == null){
      $('#show-token-error').openModal();
      $('#errorSubject').html("Missing token");
      $('#errorMessage').html("Token is missing, please contact info@malabi.co");
      return;
    }

    var settings = {
      "async": false,
      "url": apiUrl  + "Camera51Server/getSessionToken",
      "method": "POST",
      "headers": {
        "content-type": "application/x-www-form-urlencoded"
      },
      "data": {
        "token": customerToken,
        "customerId": customerId,
      }
    };

    $.ajax(settings).done(function (response) {
      sessionToken = response.response["sessionToken"];
      var date = new Date();
      date.setTime(date.getTime() + (60 * 60 * 1000));
      document.cookie =
        cookieForSession +'=' + sessionToken +
        '; expires=' + date.toUTCString() +
        '; path=/';
      sessionTokenReady(sessionToken);
    });
  }

  var MAX_FILES_TO_UPLOAD = 30;
  var dropbox;
  var _URL = window.URL;
  var oprand = {
    dragClass: "active",
    maxFiles: MAX_FILES_TO_UPLOAD,
    on: {
      load: function (e, file) {
        // check file type
        var imageType = /image.*/;
        if (!file.type.match(imageType)) {
          alert("File \"" + file.name + "\" is not a valid image file");
          return false;
        }

        // check file size
        if (parseInt(file.size) >= 1024 * 1024 * 6 ) {
          $('#show-token-error').openModal();
          $('#errorSubject').html("File \"" + file.name + "\" is too big");
          $('#errorMessage').html("File \"" + file.name + "\" is too big. Max allowed size is 6 MB.");
          return false;
        }

        var numItems = $('.eachImage').length;

        if(numItems > MAX_FILES_TO_UPLOAD){
          $('#show-token-error').openModal();
          $('#errorSubject').html("Images were not uploaded");
          $('#errorMessage').html("You may upload a MAXIMUM of "+MAX_FILES_TO_UPLOAD+" images");
          return false;
        }
        var img = new Image();

        img.onload = function () {
          //        console.log("Width:" + this.width + "   Height: " + this.height);//this will give you image width and height and you can easily validate here....
          var s = {w: this.width, h: this.height};
          create_box(e, file, s);
        };
        img.src = _URL.createObjectURL(file);
      },
      showerrors: function (msg) {
        //  $('#show-token-error').show();
        $('#show-token-error').openModal();
        $('#errorSubject').html("Images were not uploaded");
        $('#errorMessage').html("You may upload a MAXIMUM of "+MAX_FILES_TO_UPLOAD+" images");
      }
    }
  };

  try {
    var droptarget  = document.getElementById('droptarget');
    FileReaderJS.setupDrop(droptarget, oprand);
    FileReaderJS.setupInput(document.getElementById('file-input'), oprand);
  } catch (e){
    console.log(e);
  }

  var numItems = $('.eachImage').length;

  if(numItems > 0){
    $("#download-images-wrapper").css('display', 'block');
    $("#try-it-free").css('display', 'none');
  }

  $('#imageList').on('DOMNodeInserted', function(e) {
    var numItems = $('.eachImage').length;
    if(numItems > 0){
      $("#download-images-wrapper").css('display', 'block');
      $("#try-it-free").css('display', 'none');
    }

    if($(e.target).find('.btn-touchup').length != 0){
      var a =   $(e.target).find('.btn-touchup');
      $(a).addClass("waves-effect waves-teal btn-flat ");
    }
  });

  $('#fileupload-btn').on('click', function () {
    $('#file-input').trigger('click');
  });
  $('#dropbox').on('click', function () {
    $('#file-input').trigger('click');
  });

  (function($, window, document, undefined) {
    "use strict";

    var download = function (options) {
      var triggerDelay = (options && options.delay) || 1500;
      var cleaningDelay = (options && options.cleaningDelay) || 2000;

      this.each(function (index, item) {
        createIFrame(item, index * triggerDelay, cleaningDelay);
      });

      return this;
    };

    var createIFrame = function (item, triggerDelay, cleaningDelay) {

      setTimeout(function () {
        var frame = $('<iframe style="display: none;" class="multi-download-frame"></iframe>');
        frame.attr('src', $(item).attr('href') || $(item).attr('src'));
        $(item).after(frame);

        setTimeout(function () {
          frame.remove();
          $( item ).parents(".eachImage").remove();
          if($('.eachImage').length == 0){
            $("#download-images-wrapper").css('display', 'none');
            // $("#try-it-free").css('display', 'block');


          }

        }, cleaningDelay);

      }, triggerDelay);
    };

    $.fn.multiDownload = function(options) {
      return download.call(this, options)
    }

  })(jQuery, window, document);

});



create_box = function (e, file, size) {
  var loader = '<div class="preloader-wrapper">'
    +'<div class="spinner-layer " style="border-color:#77c2df ">'
    +'<div class="circle-clipper left">'
    +'<div class="circle"></div>'
    +'</div><div class="gap-patch">'
    +'<div class="circle"></div>'
    +'</div><div class="circle-clipper right">'
    +'<div class="circle"></div>'
    +'</div></div></div>';
  var rand = Math.floor((Math.random() * 100000) + 3);
  var imgName = file.name; // not used, Irand just in case if user wanrand to print it.
  var src = e.target.result;

  var x ;
  var height = (200/size.h);// * test.h;
  var width = (180/size.w);// * test.w;

  if(height < width){
    x = height;
  } else {
    x = width;
  }
  size.hPro = size.h *x;
  size.wPro = size.w *x;

  var template = '<div class="eachImage z-depth-1" id="eachImage-' + rand + '">';
  template += '<div class="save-option" onclick="updateRemoveImage()" >' +
    '<i id="save-option" style="font-size: 20px;margin: 5px;cursor: pointer !important;" title="remove" class="material-icons right" onclick="removeImage(this)">close</i></div>';
  template += '<div class="preview" id="' + rand + '" ><span class="camera51-darken"><img src="' + src + '" style="opacity: 0.6;margin: auto"></span><span class="overlay"><div class="progress" id="'+rand+'"><div class="determinate" style="width: 70%"></div></div>';
  template += '<div style="font-size: 14px;color: white; ">Uploading...</div></span>';
  template += '</div><div style="height: 20px;width: 100%"></div> ';
  template += '<div class="resultPreview" id="resultPreview-' + rand +
    '" style="width:100%;height:200px;" id="'
    + rand + '"><div style="top: 70px;position: relative;">' + loader + '</div></div>';

  if ($("#imageList .eachImage").html() == null)
    $("#imageList").html(template);
  else
    $("#imageList").append(template);

  // upload image
  var contentType = file.type;
  if (!contentType.match(/(gif|jpe?g|png)$/i)) {
    alert('Invalid file type only: gif, jpg, and png supported');
    return;
  }
  contentType = contentType.split("/")[1];
  $.ajax({
    url: "https://1yiwu07216.execute-api.us-east-1.amazonaws.com/getSignedUrl",
    type: "POST",
    data: JSON.stringify({ contentType: contentType}),
    contentType: "application/json",
    dataType: "json",
    crossDomain: true,
    complete: function( data ) {
      upload(file, rand, data.responseJSON.oneTimeUploadUrl, data.responseJSON.resultUrl);
    }
  });
};

upload = function (file, rand, signedUrl, resultUrl) {

  var _this = this;
  var formData = new FormData();
  formData.append(file.name, file);


  var data = null;
  //
  // var xhr = new XMLHttpRequest();
  // xhr.withCredentials = true;
  //
  // xhr.addEventListener("readystatechange", function () {
  //   if (this.readyState === 4) {
  //     console.log(this.responseText);
  //   }
  // });
  //
  // xhr.open("PUT", "https://malabi-upload.s3.amazonaws.com/2017-01-02/1483366943635.jpeg?AWSAccessKeyId=ASIAICH6SMOG5C5OV6SA&Content-Type=jpeg&Expires=1483367843&Signature=rYCsTYm7%2FGSeWiwf4WORvziLT%2Fk%3D&x-amz-security-token=FQoDYXdzEKj%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDF3tMi0PwKeVooDYBSLkAbVrvMMtoOnSIZxI0d9JdQKkd%2FW5xxH%2BrC9%2FODXq8nD1LPv%2BD2jA4i5JmjtsWBBPNf9Mx7OOCwrSvGw4LuKwDWJt%2FHaxdGvQo2e2RSCeqazjVAGundgfkixRByGSsMv5qidtpqpH%2BFc2%2B87xHEsm9cPXEHST%2FjGemciQelvnYDgNN0R%2F6J6U4FOdGpx1VqmKAdj28Udq6J52tXhq1jVRLGd3lMFgOcJU7TuoMtGsXa0LvMlXaJEzA%2F9LBxgGFZbvfHHsnhiWxuaAQMsJ5t%2F07udgfJDYP9QGFBI6ZRAqG2WBke4exyifxKnDBQ%3D%3D");
  // xhr.open("PUT", signedUrl);
  // var contentType = file.type.split("/")[1];
  // xhr.setRequestHeader("Content-Type", contentType);
  //
  //
  // xhr.send(file);
  var contentType = file.type.split("/")[1];
  // now upload the file
  var xhr = new Array();
  xhr[rand] = new XMLHttpRequest();
  //xhr[rand].open("post", apiUrl + "/Camera51Server/uploadimage", true);
  xhr[rand].open("PUT",  signedUrl);
  xhr[rand].setRequestHeader("Content-Type", contentType);
  xhr[rand].upload.addEventListener("progress", function (event) {
    //console.log(event);
    if (event.lengthComputable) {
      $(".progress[id='" + rand + "'] .determinate").css("width", (event.loaded / event.total) * 100 + "%");
    }
    else {
      alert("Failed to compute file upload length");
    }
  }, false);

  xhr[rand].ontimeout = function (e) {
    // XMLHttpRequest timed out. Do something here.
    console.error(e);
  };

  xhr[rand].onreadystatechange = function (oEvent) {
    if (xhr[rand].readyState === 4) {
      if (xhr[rand].status === 200) {
        $(".progress[id='" + rand + "'] .determinate").css("width", "100%");
        $(".preview[id='" + rand + "'] img").css("opacity","1");
        $(".preview[id='" + rand + "'] .camera51-darken").css("background","transparent");
        $(".preview[id='" + rand + "'] .camera51-darken").css("opacity","1");
        $(".preview[id='" + rand + "']").find(".updone").html("100%");
        $(".preview[id='" + rand + "'] .overlay").css("display", "none");
        try{

          // data = JSON.parse(xhr[rand].responseText);
          var url = resultUrl;
          var res = url.slice(0, 6);
          if(res == "http:/"){
            url = "https://"+url.split("http://")[1];
          }
          $(".preview[id='" + rand + "'] img").attr("src", url);
        } catch (e){
          //    _this.upload(file, rand);
          return false;
        }
        requestImage(rand, resultUrl);

      } else {
        //  _this.upload(file, rand);
        return false;
        console.error(xhr[rand]);
      }
    }
  };

  xhr[rand].send(file);

};

var get_params = function(search_string) {

  var parse = function(params, pairs) {
    var pair = pairs[0];
    var parts = pair.split('=');
    var key = decodeURIComponent(parts[0]);
    var value = decodeURIComponent(parts.slice(1).join('='));

    // Handle multiple parameters of the same name
    if (typeof params[key] === "undefined") {
      params[key] = value;
    } else {
      params[key] = [].concat(params[key], value);
    }

    return pairs.length == 1 ? params : parse(params, pairs.slice(1))
  };

  // Get rid of leading ?
  return search_string.length == 0 ? {} : parse({}, search_string.substr(1).split('&'));
};


var params = get_params(location.search);


$(document).ready(function () {
  document.addEventListener("dragstart", function(event) {
    event.target.style.opacity = "0.4";
  });

  document.addEventListener("drag", function(event) {
  });

  // Output some text when finished dragging the p element and reset the opacity
  document.addEventListener("dragend", function(event) {
  });

  document.addEventListener("dragenter", function(event) {

    $('.droptarget').css('display','block');

    if ( event.target.className == "droptarget" ) {
      $('.dropImagePopup').css('visibility','visible');
    }
  });
  var obj = document.getElementById("droptarget");
  obj.addEventListener("drop", function(event) {
    $('.droptarget').css('display','none');
  });

  // By default, data/elements cannot be dropped in other elements. To allow a drop, we must prevent the default handling of the element
  document.addEventListener("dragover", function(event) {
    event.preventDefault();
  });

  // When the draggable p element leaves the droptarget, reset the DIVS's border style
  document.addEventListener("dragleave", function(event) {

    if ( event.target.className == "droptarget" ) {
      $('.droptarget').css('display','none');
    }
  });
});


var isIE;
(function() {
  var ua = window.navigator.userAgent,
    msie = ua.indexOf('MSIE '),
    trident = ua.indexOf('Trident/');

  isIE = (msie > -1 || trident > -1) ? true : false;
})();

$(document).ready(function () {

  if (isIE) {
    $('#show-token-error').openModal();
    $('#errorSubject').html("Internet Explorer is not supported");
    $('#errorMessage').html("We do not support Internet Explorer 11 and below. Please use a diffrent web browser.");
    $('.modal-footer').hide();
  }
});


function setIsloggedIn(type){
  if(type == false){
    $("#download-images").html("Download images");
  } else {
    $("#download-images").html("Download images");
  }
  isloggedIn = type;
}
function setUserCredit(val){
  if(val > 0){
    showWatermark = false;
  } else {
    showWatermark = true;
  }

}
function setUserloggedIn(userId, userToken){
  siteUserId = userId;
  siteUserToken = userToken;
}

function startLoadingCursor(){
  $('body').addClass('busy');
}

function stopLoadingCursor(){
  $('body').removeClass('busy');
}

function showUserError(mesg){
  Materialize.toast(mesg, 8000);
}

function showToast(mesg){
  Materialize.toast(mesg, 4000);
}

window.closeModal = function(id){
  $('#'+id).closeModal();
};

window.openModal = function(id, func){
  if(func == null){
    $('#'+id).openModal();
  } else {
    $('#'+id).openModal(func);
  }

};

function removeImage(img){
  $(img).closest('.eachImage').remove();
  window.ga('send', 'event', 'Site', 'remove image')
  window.angularComponentApp.component.updatedImages();

}
