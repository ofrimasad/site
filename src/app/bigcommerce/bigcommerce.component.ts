import {Component, ElementRef, ChangeDetectorRef, NgZone, Input} from '@angular/core';
import {AppState} from '../app.service';
import {Router, ActivatedRoute} from "@angular/router";
import {UserService} from "../user.service";
import {ProductsBigcommerceService, Products} from "./products-bigcommerce.service";
import {forEach} from "@angular/router/src/utils/collection";
import {isUndefined} from "util";
import {WindowRef} from "../WindowRef";
import {ViewChild, ViewChildren} from "@angular/core/src/metadata/di";
import {PlansService} from "../plans/plans.service";
import {UserstateService} from "../userstate.service";
import {PlansComponentService} from "../shopify/mission.service";
import {Bigcommerceconfirmation} from "./confirmation";

import {Rateusbigcommerce} from "./rateusbigcommerce";
declare  var $:any;

@Component({
  selector: 'bigcommerce',  // <home></home>
  styleUrls: ['bigcommerce.style.css'],
  templateUrl: 'bigcommerce.template.html'
})
export class Bigcommerce {
  localState = {value: ''};
  userId: number;
  userToken: string;
  divToShowSrc: string;
  divToShowDisplay:string = "none";
  showALL: boolean = true;
  @Input() products: Products[] = [];
  currentReplaceProduct = null;
  pageNumber:number = 1;
  showMoreButton:boolean = true;
  private pageLimit:number = 10;
  private publishedStatus:string = "any";
  private searchTitle:string;
  private pageReturnfields:string;
  private imageReplaceUrl:string = "/assets/preloader.svg";
  private localStorageName:string = "bigcommerce-malabi-image-id2-";
  private customerId:number = 1;
  private sessionToken:string = "283f67b2-a5a5-11e6-80f5-76304dec7eb7";
  private tableVisibility = "hidden";

  @ViewChild(Bigcommerceconfirmation) shopCon: Bigcommerceconfirmation;
  @ViewChild(Rateusbigcommerce) rateus: Rateusbigcommerce;
  @ViewChildren('ImageRow') imageRow;


  private currentUserState;
  private userShop:string;
  private updated_at_min;
  // TypeScript public modifiers
  constructor(public appState: AppState, private route: ActivatedRoute, private router: Router,
              private windowRef: WindowRef, private eref: ElementRef, private changeDetector: ChangeDetectorRef,
              private userService: UserService, private productsService: ProductsBigcommerceService, private zone:NgZone,
              private plansService: PlansService, private plansComponentService: PlansComponentService,
              private userState:UserstateService ) {

    var params:any = this.route.params;
    params = params.getValue();
    this.eref.nativeElement.ownerDocument.getElementById("nav-bar").style.display = "none";
    this.eref.nativeElement.ownerDocument.getElementById("uploadload-container").style.display = "none";


    this.windowRef.nativeWindow.angularComponentBigcommerce = {
      zone: this.zone,
      componentFn: () => this.refreshBigcommerceProducts(),
      component: this
    };

    if (params.hasOwnProperty("userId")) {
      this.userId = params.userId;
      this.appState.set("userId", params.userId);
    }
    if (params.hasOwnProperty("userToken")) {
      this.userToken = params.userToken;
      this.appState.set("userToken", params.userToken);
      this.windowRef.nativeWindow.setIsloggedIn(true);
    }

    if (params.hasOwnProperty("shop")) {
      this.userShop = params.shop;
      this.appState.set("userShop", params.shop);
    }
    this.windowRef.nativeWindow.customerId = 1;
    this.windowRef.nativeWindow.camera51WithQueue.init({
      "customerId": this.customerId,
      "showTutorial": true,
      "sessionToken": this.sessionToken,
      "camera51EditorIframe": "camera51Iframe",
      "decreaseInnerHeight": 20,
      "wrappermarginTop":10,
      "apiUrl":this.windowRef.nativeWindow.apiUrl,
    });

    this.appState.set("sqsURL", this.windowRef.nativeWindow.camera51WithQueue.getSQSurl());
    this.appState.set("userCredit", "");
    this.appState.set("BigcommerceUser", true);
    this.appState.set("sessionToken", this.sessionToken);
    this.appState.set("customerId", this.customerId);

    appState.set("paymentRedirectUrl", (parent !== window) ? document.referrer : document.location);
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce app enter', "userId="+params.userId+"&shop="+this.userShop);
    this.windowRef.nativeWindow.ga('set', { page:'/bigcommerce',title:'Bigcommerce App'});
    this.windowRef.nativeWindow.ga('send', 'pageview');
    this.appState.set("planProductId", "454354000000223025");
    if(appState.getExact("isSandbox")){
      console.log("Sandbox Shopify", appState.getExact("isSandbox"));
      this.appState.set("planProductId", "402919000000318001"); // sandbox
    }
    this.plansService.getPlans(this.appState.get("planProductId"))
    // .then(plan => this.plans = plan);
      .subscribe(

      );

    //this.rateus.openModal();

  }

  refreshBigcommerceProducts(){
    this.pageNumber = 1;
    this.products = [];
    this.getProducts();
  }

  private findProductIds(){
    var url = (parent !== window) ? document.referrer : document.location.href;

    var productsIds = [];
    var urlSplit = url.split("?");
    if(urlSplit.length > 1){
      urlSplit = urlSplit[1].split("&");
      for(var i =0; i < urlSplit.length; i++){
        var parm = urlSplit[i].split("=");
        if(parm.length > 1){
          if(decodeURI(parm[0]) == "ids[]"){
            productsIds.push(parm[1]);
          }
        }
      }
    }
    this.getProducts(productsIds.join());

  }

  ngAfterViewInit() {
// BigcommerceOverRide
    var that = this;
    this.windowRef.nativeWindow.camera51WithQueue.showImageCallbackOverride = (elem, imgUrl , processingResultCode, trackId) => {

      //console.log(elem, imgUrl , processingResultCode, trackId);

      if(processingResultCode >= 100){
        imgUrl = "/assets/appimages/error.png";
      }
      if(processingResultCode == 103){
        imgUrl = "/assets/appimages/errorsize.png";
      }
      for(var i=0; i < that.products.length; i++){
        //ronen

        if(that.products[i].trackId == trackId){
          that.products[i].btnReplaceProductImageDisable = false;
          that.products[i].btnAddProductImageDisable = false;
          if(processingResultCode >= 100){
            that.products[i].btnTouchUpDisable = true;
            that.products[i].btnAddProductImageDisable = true;
            that.products[i].btnReplaceProductImageDisable = true;

          }
          that.products[i]["processingResultCode"] = processingResultCode;
          that.products[i]["imageRes"] = imgUrl;
          setTimeout(() => {
            this.changeDetector.detectChanges();
          }, 1000);
          continue;
        }

      }

      if (typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        var a = {"elem":elem,
          "imgUrl":imgUrl,
          "processingResultCode":processingResultCode,
          "trackId":trackId};

        localStorage.setItem(this.localStorageName+elem, JSON.stringify(a));
      } else {
        // Sorry! No Web Storage support..
      }
    }

    this.userState.downloadState()
      .subscribe(
        res => this.renderAfterState(res)
      );
  }

  private showRateUs(){
    if(this.userState.get("bigcommerceRateDontAsk") != null){
      return;
    }

    if(this.userState.get("bigcommerceRateRemindMe") != null){
      var saveDate = this.userState.get("bigcommerceRateRemindMe");
      var dateObject = new Date(Date.parse(saveDate));
      var today = new Date();
      var one_day=1000*60*60*24;
      var difference_ms = (today.getTime() - dateObject.getTime()) ;
      var days = Math.floor(difference_ms / one_day);
      if(days > 2){
        this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce rateus remindme',"shop="+this.userShop);
        this.rateus.openModal();
        return;
      }
      return;
    }
    var ratingInfo = this.userState.get("bigcommerce-image-save-log");
    var numDaysValid =0;
    var numImages =0;
    if(ratingInfo != null){
      for (var dateKey in ratingInfo) {
        if (!ratingInfo.hasOwnProperty(dateKey)) continue;
        var obj = ratingInfo[dateKey];
        if(obj >= 0){
          numDaysValid++;
          numImages += obj;
        }
      }
      console.log(numDaysValid,numImages);
      if(numDaysValid >= 3 && numImages >=12){
        this.rateus.openModal();
        return;
      }
    }
  }

  resultImageMouseOver(ev){
    if(ev == false){
      this.divToShowDisplay = "none";
      return;
    }

    this.divToShowDisplay = "block";
    var divToShow = $("#popupBox");
    divToShow.css({
      position: "absolute",
      left: ($(ev.fromElement).offset().left + $(ev.fromElement).width()) + "px",
      top: $(ev.fromElement).offset().top + "px"
    });
    this.divToShowSrc = ev.currentTarget.currentSrc;//ev.fromElement.children[0].getElementsByTagName('img')[0].src;

  }
  updateProduct(index, attr, value){
    this.products[index][attr] = value;
  }

  ngOnInit() {
    this.userService.retrieveUserData(this.userId, this.userToken)
      .subscribe(
        a => {
          if (a.status == "fail") {
            console.log("fail to retrieve info. Login again.");
            localStorage.removeItem('camera51-login');
            return;
          } else {
            this.userService.updateAppState( a);
            this.userLoged();
          }
        }
      );
    this.products = [];
    // find if products ids
    this.findProductIds();
    this.currentUserState = this.userState.get();
  }

  renderAfterState(state){
    console.log("renderAfterState",this.userState.get());
    if(this.userState.get("bigcommerce-welcome-message") === null){
      this.windowRef.nativeWindow.openModal('modal-welcome-bigcommerce');
      this.userState.set("bigcommerce-welcome-message", true);
      this.userState.uploadState();
    }
    this.addToUserStateRateUs("bigcommerce-image-save-log",0);
    this.showRateUs();
  }

  private addToUserStateRateUs(key, value){

    let bigcommerceRateUsKey = "show-bigcommerce-rating";
    let bigcommerceRateUsDoneKey = "bigcommerce-rating-done";
    if(this.userState.get(bigcommerceRateUsDoneKey) !== null){
      return;
    }

    var stateKey = key;
    var stateInfo = {};
    let today = new Date().toISOString().slice(0, 10);
    if(this.userState.get(stateKey) === null){
      this.userState.set(stateKey, {});
    } else {
      stateInfo = this.userState.get(stateKey);
    }

    if(stateInfo.hasOwnProperty(today)){
      stateInfo[today] = stateInfo[today] + value;
    }
    else {
      stateInfo[today] = value;
    }
    this.userState.set(stateKey,stateInfo);
    // check if can show rating.
    var numDaysValid = 0;
    for (var dateKey in stateInfo) {
      if (!stateInfo.hasOwnProperty(dateKey)) continue;
      var obj = stateInfo[dateKey];
      if(obj > 2){
        numDaysValid++;
      }
    }
    if(numDaysValid > 2){
      this.userState.set(bigcommerceRateUsKey, true);
    }

    this.userState.uploadState();
  }


  addProductImage(product){
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce add enhanced image',"shop="+this.userShop);
    this.startLoader();

    this.addToUserStateRateUs("bigcommerce-image-save-log",1);

    var imgName = product.imageSrc.substring(product.imageSrc.lastIndexOf("/") + 1).split("?")[0];
    var imgUrl = (product.imageRes.slice(0,4) == "http") ? product.imageRes : "https:"+product.imageRes;
    product.btnTouchUpDisable = false;
    product.btnAddProductImageDisable = false;
    product.btnReplaceProductImageDisable = false;
    this.sendEventTrackId(product, "bigcommerce_add_image");
    this.productsService.addProductImage(this.userId, this.userToken, product.id,
      product.imagePosition, imgUrl, imgName )
      .subscribe(
        res => {
          if (res.status == "fail") {
            if(res.error == "credit-not-enough"){

              this.openPlans({"noImagesTitle":true});
            }
          } else {
            parent.postMessage({"flashNotice":true,"text":'Image has been added to your product'},"*");
            this.sendEventTrackId(product, "accept_new_image");
            this.appState.set("userCredit", res.result.userCredit)
          }

          this.stopLoader();
          //product.btnTouchUpDisable = true;

        }
      )
  }


  private openPlans(obj = {}){

    this.plansComponentService.openPlan(obj);
  }

  private confirmReplace(product){
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce replace enhanced image',"shop="+this.userShop);
    this.startLoader();
    this.addToUserStateRateUs("bigcommerce-image-save-log",1);

    var imgUrl = (product.imageRes.slice(0,4) == "http") ? product.imageRes : "https:"+product.imageRes;
    var tempOriginalImage = product.imageSrc;
    product.imageSrc = this.imageReplaceUrl;
    product.btnTouchUpDisable = true;
    product.btnAddProductImageDisable = true;
    product.btnReplaceProductImageDisable = true;
    this.sendEventTrackId(product, "bigcommerce_replace_image")

    this.productsService.replaceProductImage(this.userId, this.userToken, product.id, product.imageId, imgUrl )
      .subscribe(
        res => {
          if (res.status == "fail") {
            this.stopLoader();
            product.imageSrc = tempOriginalImage;
            product.btnTouchUpDisable = false;
            product.btnAddProductImageDisable = false;
            product.btnReplaceProductImageDisable = false;
            if(res.error == "credit-not-enough"){
              this.openPlans({"noImagesTitle":true});
            }
            //@TOdo: show place.
          } else {
            var img = new Image();
            img.onload = () => {
              product.imageSrc = res.result.imageURL;
              setTimeout(() => {
                this.changeDetector.detectChanges();
              }, 200);
              parent.postMessage({"flashNotice":true,"text":'Image has been replaced'},"*");
              this.stopLoader();
              product.btnTouchUpDisable = true;
            };
            img.src = res.result.imageURL;
            this.appState.set("userCredit", res.result.userCredit);
            this.sendEventTrackId(product, "accept_new_image");

          }
        }
      );
  }


  replaceProductImage(product){
    if(this.userState.get("bigcommerce-replace-warning-show") === false){
      this.confirmReplace(product);
      return;
    }
    this.shopCon.currentReplaceProduct(product);// currentReplaceProduct = product;
  }


  private getProducts(productIds:string = "") {
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce search products',"shop="+this.userShop);

    this.startLoader();
    this.productsService.getProducts(this.userId, this.userToken, this.pageReturnfields,
      this.pageLimit, this.pageNumber, this.searchTitle, this.publishedStatus, this.updated_at_min, productIds)
      .subscribe(
        products => {
          this.tableVisibility = "visible";
          if (products["status"] == "fail") {
            console.log("fail to retrieve info. Login again.");
          } else {
            this.mapProductResults(products["data"]);
          }
          this.stopLoader();
        }
      );
  }

  private addToRequest(id, src){
    var res = {};
    var localStorageImage = localStorage.getItem(this.localStorageName +id);
    if (localStorageImage) {
      try {
        localStorageImage = JSON.parse(localStorageImage);
      } catch (e) {

      }
      if (localStorageImage.hasOwnProperty("elem")) {
        return localStorageImage;
      }
    } else {
      res['trackId'] = this.windowRef.nativeWindow.camera51WithQueue.requestAsync(src/*.split("?",1)[0]*/, id,
        "", true, false, true, this.userId, this.userToken);

      res['imgUrl'] = this.imageReplaceUrl;
      return res;

    }

  }

  private createProduct(b, imageInfo, res){

    var c = {};
    c["imageRes"] = res['imgUrl'];
    c["trackId"] = res['trackId'];
    c["id"] = b.id;
    c["title"] = b.name;
    c["imageSrc"] = imageInfo.url_standard;
    c["imageId"] = imageInfo.id;
    c["imagePosition"] = imageInfo.sort_order;
    c["processingResultCode"] = res['processingResultCode'];
    c["btnTouchUpDisable"] = false;
    c["btnReplaceProductImageDisable"] = false;
    c["btnAddProductImageDisable"] = false;
    if(res['processingResultCode'] >= 100){
      c["btnTouchUpDisable"] = true;
      c["btnReplaceProductImageDisable"] = true;
      c["btnAddProductImageDisable"] = true;
    }
    return c;

  }

  private mapProductResults(products: Products[]) {

    if(products === undefined ||  products.constructor !== Array ){
      return;
    }
    //console.log(products);
    var res = products.reduce((a:any, b:any)=> {
      var newArray = [];
      if(this.showALL){

        for(var i=0; i < b.images.length;i++){

          var res = this.addToRequest(b.images[i].id, b.images[i].url_standard);
          newArray.push(this.createProduct(b, b.images[i], res));
        }
      } else {
        var res = this.addToRequest(b.images[0].id, b.images[0].url_standard);
        newArray.push(this.createProduct(b, b.images[0], res));
      }

        return a.concat(newArray);
      }, []
    );
    if(res.length == 0){
      this.showMoreButton = false;
    } else {
      this.showMoreButton = true;
    }

    this.products.push(...res);
    setTimeout(() => {
      this.changeDetector.detectChanges();
    }, 200);
  }

  touchUp(product){
    if(product.processingResultCode >= 100){
      return;
    }
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce touchUp',"shop="+this.userShop);

    var onSaveWithResult = function (resultUrl) {

      $('#modal1').closeModal();
    };

    $('#modal1').openModal();

    // open the editor
    this.windowRef.nativeWindow.camera51WithQueue.openEditorWithTrackId({
      'customerId': this.customerId,
      'trackId': product.trackId
    }, onSaveWithResult, product.imageId );
  }

  showImgPreview(e) {
    var src = e.toElement.children[0].src;
    $("#modal-show-img").openModal();
    $("#preview-img-src").attr("src", src);
  }

  onInputFilter(val){
    this.resetSearchRequest();
    this.searchTitle = val;
    this.getProducts();
  }

  onSelectProduct(val) {
    this.updated_at_min = null;
    if (val == "all") {
      this.showALL = true;
    }
    else if (val == "main") {
      this.showALL = false;
    }
    else if (val.split("hours_").length >1 ) {
      this.updated_at_min =  val.split("hours_")[1];
      this.showALL = true;
    }
    this.products = [];
    this.pageNumber = 1;
    this.getProducts();
  }

  private userLoged() {
    this.eref.nativeElement.ownerDocument.getElementById("nav-bar").style.display = "none";
    this.eref.nativeElement.ownerDocument.getElementById("uploadload-container").style.display = "none";
  }

  private startLoader(){
    this.windowRef.nativeWindow.startLoadingCursor();
    parent.postMessage({"loader":true},"*");
  }

  private stopLoader(){
    this.windowRef.nativeWindow.stopLoadingCursor();
    parent.postMessage({"loader":false},"*");
  }

  showMoreProducts(){
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce showmore',"shop="+this.userShop);

    parent.postMessage({"loader":true},"*");
    this.pageNumber++;
    this.getProducts();
  }

  private resetSearchRequest(){
    this.pageNumber = 1;
    this.products = [];
    this.searchTitle = "";
  }

  sendEventTrackId(product, message){
    this.windowRef.nativeWindow.camera51UserFunctions.sendEventTrackId(product.trackId, this.customerId,message );
  }

  openModalVideo() {
    this.windowRef.nativeWindow.openModal('modal-video');
  }
}
