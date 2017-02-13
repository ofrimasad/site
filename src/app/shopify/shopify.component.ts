import {Component, ElementRef, ChangeDetectorRef, NgZone, Input} from '@angular/core';
import {AppState} from '../app.service';
import {Router, ActivatedRoute} from "@angular/router";
import {UserService} from "../user.service";
import {ProductsService, Products} from "./products.service";
import {forEach} from "@angular/router/src/utils/collection";
import {isUndefined} from "util";
import {WindowRef} from "../WindowRef";
import {ViewChild, ViewChildren} from "@angular/core/src/metadata/di";
import {PlansService} from "../plans/plans.service";
import {UserstateService} from "../userstate.service";
import {PlansComponentService} from "./mission.service";
import {Shopifyconfirmation} from "./confirmation";
import {Rateusshopify} from "./rateusshopify";
declare var $: any;

@Component({
  selector: 'shopify',  // <home></home>
  styleUrls: ['shopify.style.css'],
  templateUrl: 'shopify.template.html'
})
export class Shopify {
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
  private imageReplaceUrl:string = "/assets/loader.gif";
  private localStorageName:string = "shopify-malabi-image-id2-";
  private customerId:number = 1;
  private sessionToken:string = "283f67b2-a5a5-11e6-80f5-76304dec7eb7";
  private tableVisibility = "hidden";

  @ViewChild(Shopifyconfirmation) shopCon: Shopifyconfirmation;
  @ViewChild(Rateusshopify) rateus: Rateusshopify;
  @ViewChildren('ImageRow') imageRow;
  private currentUserState;
  private userShop:string;
  private updated_at_min;
  private currentScroll: number;
  // TypeScript public modifiers
  constructor(public appState: AppState, private route: ActivatedRoute, private router: Router,
              private windowRef: WindowRef, private eref: ElementRef, private changeDetector: ChangeDetectorRef,
              private userService: UserService, private productsService: ProductsService, private zone:NgZone,
              private plansService: PlansService, private plansComponentService: PlansComponentService,
              private userState:UserstateService ) {

    var params:any = this.route.params;
    params = params.getValue();
    this.eref.nativeElement.ownerDocument.getElementById("nav-bar").style.display = "none";
    this.eref.nativeElement.ownerDocument.getElementById("uploadload-container").style.display = "none";


    this.windowRef.nativeWindow.angularComponentShopify = {
      zone: this.zone,
      componentFn: () => this.refreshShopifyProducts(),
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
    //this.windowRef.nativeWindow.customerId = 1;
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
    this.appState.set("ShopifyUser", true);
    this.appState.set("ShowSubscriptionRow5", false);
    this.appState.set("sessionToken", this.sessionToken);
    this.appState.set("customerId", this.customerId);
    this.appState.set("planProductId", "454354000000052226");
    if(appState.getExact("isSandbox")){
      console.log("Sandbox Shopify", appState.getExact("isSandbox"));
      this.appState.set("planProductId", "402919000000206001"); // sandbox
    }



    appState.set("paymentRedirectUrl", (parent !== window) ? document.referrer : document.location);
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify app enter', "userId="+params.userId+"&shop="+this.userShop);
    this.windowRef.nativeWindow.ga('set', { page:'/shopify',title:'Shopify App'});
    this.windowRef.nativeWindow.ga('send', 'pageview');

    this.plansService.getPlans(this.appState.get("planProductId"))
    // .then(plan => this.plans = plan);
      .subscribe(

      );

    //this.rateus.openModal();

  }

  refreshShopifyProducts(){
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
// ShopifyOverRide
    var that = this;
    this.windowRef.nativeWindow.camera51WithQueue.showImageCallbackOverride = (elem, imgUrl , processingResultCode, trackId) => {

      //console.log(elem, imgUrl , processingResultCode, trackId);

      if(processingResultCode >= 100){
        imgUrl = "/assets/appimages/error.jpg";
      }
      if(processingResultCode == 103){
        imgUrl = "/assets/appimages/errorsize.jpg";
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
          "trackId":trackId,
          "timestamp": new Date().getTime().toString()
        };

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
    if(this.userState.get("shopifyRateDontAsk") != null){
      return;
    }

    if(this.userState.get("shopifyRateRemindMe") != null){
      var saveDate = this.userState.get("shopifyRateRemindMe");
      var dateObject = new Date(Date.parse(saveDate));
      var today = new Date();
      var one_day=1000*60*60*24;
      var difference_ms = (today.getTime() - dateObject.getTime()) ;
      var days = Math.floor(difference_ms / one_day);
      if(days > 2){
        this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify rateus remindme',"shop="+this.userShop);
        this.rateus.openModal();
        return;
      }
      return;
    }
    var ratingInfo = this.userState.get("shopify-image-save-log");
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

    if(ev == false ){
      this.divToShowDisplay = "none";
      return;
    }


    this.divToShowDisplay = "block";
    var divToShow = $("#popupBox");
    divToShow.css({
      position: "absolute",
      left: ($(ev.relatedTarget).offset().left + $(ev.relatedTarget).width()) + "px",
      top: $(ev.relatedTarget).offset().top + "px"
    });
    //console.log(ev);
    //console.log($(ev.relatedTarget).offset().left,$(ev.relatedTarget).width() );
    //this.divToShowSrc = ev.srcElement.currentSrc;//ev.fromElement.children[0].getElementsByTagName('img')[0].src;
    this.divToShowSrc = ev.currentTarget.currentSrc;
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
    if(this.userState.get("shopify-welcome-message") === null){
      this.windowRef.nativeWindow.openModal('modal-welcome-shopify');
      this.userState.set("shopify-welcome-message", true);
      this.userState.uploadState();
    }
    this.addToUserStateRateUs("shopify-image-save-log",0);
    this.showRateUs();
  }

  private addToUserStateRateUs(key, value){

    let shopifyRateUsKey = "show-shopify-rating";
    let shopifyRateUsDoneKey = "shopify-rating-done";
    if(this.userState.get(shopifyRateUsDoneKey) !== null){
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
      this.userState.set(shopifyRateUsKey, true);
    }

    this.userState.uploadState();
  }


  addProductImage(product){
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify add enhanced image',"shop="+this.userShop);
    this.startLoader();

    this.addToUserStateRateUs("shopify-image-save-log",1);
    this.windowRef.nativeWindow.ga('send', 'event', 'Site shopify ADD orig image', this.userId,product.imageSrc);
    this.windowRef.nativeWindow.ga('send', 'event', 'Site shopify ADD result image', this.userId,product.imageRes);

    var imgName = product.imageSrc.substring(product.imageSrc.lastIndexOf("/") + 1).split("?")[0];
    var imgUrl = (product.imageRes.slice(0,4) == "http") ? product.imageRes : "https:"+product.imageRes;
    product.btnTouchUpDisable = false;
    product.btnAddProductImageDisable = false;
    product.btnReplaceProductImageDisable = false;
    this.sendEventTrackId(product, "shopify_add_image");
    this.productsService.addProductImage(this.userId, this.userToken, product.id,product.imageId,
      product.imagePosition, imgUrl, imgName )
      .subscribe(
        res => {
          if (res.status == "fail") {
            if(res.error == "credit-not-enough"){
              this.plansComponentService.openPlan({"noImagesTitle":true});
            }
          } else {
            parent.postMessage({"flashNotice":true,"text":'Image has been added to your product'},"*");
            this.sendEventTrackId(product, "accept_new_image");
            this.appState.set("userCredit", res.result.userCredit);
            // for refresh page
            // this.currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
            // this.products = [];
            // this.getProducts();
          }

          this.stopLoader();
          //product.btnTouchUpDisable = true;

        }
      )
  }

  private confirmReplace(product){
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify replace enhanced image',"shop="+this.userShop);
    this.startLoader();
    this.addToUserStateRateUs("shopify-image-save-log",1);
    this.windowRef.nativeWindow.ga('send', 'event', 'Site shopify REPLACE orig image', this.userId,product.imageSrc);
    this.windowRef.nativeWindow.ga('send', 'event', 'Site shopify REPLACE result image', this.userId,product.imageRes);

    var imgUrl = (product.imageRes.slice(0,4) == "http") ? product.imageRes : "https:"+product.imageRes;
    var tempOriginalImage = product.imageSrc;
    product.imageSrc = this.imageReplaceUrl;
    product.btnTouchUpDisable = true;
    product.btnAddProductImageDisable = true;
    product.btnReplaceProductImageDisable = true;
    this.sendEventTrackId(product, "shopify_replace_image")

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
              this.plansComponentService.openPlan({"noImagesTitle":true});
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
    if(this.userState.get("shopify-replace-warning-show") === false){
      this.confirmReplace(product);
      return;
    }
    this.shopCon.currentReplaceProduct(product);// currentReplaceProduct = product;
  }


  private getProducts(productIds:string = "") {
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify search products',"shop="+this.userShop);

    this.startLoader();
    this.productsService.getProducts(this.userId, this.userToken, this.pageReturnfields,
      this.pageLimit, this.pageNumber, this.searchTitle, this.publishedStatus, this.updated_at_min, productIds)
      .subscribe(
        products => {
          this.tableVisibility = "visible";
          if (products["status"] == "fail") {
            console.log("fail to retrieve info. Login again.");
          } else {
            this.mapProductResults(products["products"]);
          }
          this.stopLoader();
        }
      );
  }

  private addToRequest(id, src){
    var res = {};
    var one_day=1000*60*60*24;
    var getInfoFromServer = false;
    var localStorageImage = localStorage.getItem(this.localStorageName +id);
    if (localStorageImage) {
      try {
        localStorageImage = JSON.parse(localStorageImage);
        if(localStorageImage["timestamp"] === undefined ||
          ((localStorageImage["timestamp"] - new Date().getTime() )/one_day) > 1 ){
          localStorage.removeItem(this.localStorageName +id);

        } else if (localStorageImage.hasOwnProperty("elem")) {
            return localStorageImage;
        }
      } catch (e) {
        // no local storage
      }
    }

    res['trackId'] = this.windowRef.nativeWindow.camera51WithQueue.requestAsync(src/*.split("?",1)[0]*/, id,
      "", true, false, true, this.userId, this.userToken);
    this.windowRef.nativeWindow.ga('send', 'event', 'Site shopify request async', this.userId, src);

    res['imgUrl'] = this.imageReplaceUrl;
    return res;


  }

  private createProduct(b, imageInfo, res){

    var c = {};
    c["imageRes"] = res['imgUrl'];
    c["trackId"] = res['trackId'];
    c["id"] = b.id;
    c["title"] = b.title;
    c["imageSrc"] = imageInfo.src;
    c["imageId"] = imageInfo.id;
    c["imagePosition"] = imageInfo.position;
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
    var res = products.reduce((a:any, b:any)=> {
      var newArray = [];
      if(this.showALL){

        for(var i=0; i < b.images.length;i++){

          var res = this.addToRequest(b.images[i].id, b.images[i].src);
          newArray.push(this.createProduct(b, b.images[i], res));
        }
      } else {
        var res = this.addToRequest(b.images[0].id, b.images[0].src);
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
      // for refresh page to position
      // if(this.currentScroll > 0){
      //   this.windowRef.nativeWindow.document.documentElement.scrollTop = this.windowRef.nativeWindow.document.body.scrollTop = this.currentScroll;
      //   this.currentScroll = 0;
      // }
    }, 200);
  }

  touchUp(product){
    if(product.processingResultCode >= 100){
      return;
    }
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify touchUp',"shop="+this.userShop);

    var onSaveWithResult = (resultUrl) => {
      this.windowRef.nativeWindow.closeModal('modal1');

    };


    this.windowRef.nativeWindow.openModal('modal1');

    this.windowRef.nativeWindow.document.getElementById("camera51-show-transparent").checked = false;
    this.windowRef.nativeWindow.document.getElementById("camera51-show-shadow").checked = false;
    // open the editor
    this.windowRef.nativeWindow.camera51WithQueue.openEditorWithTrackId({
      'customerId': this.customerId,
      'trackId': product.trackId
    }, onSaveWithResult, product.imageId );
  }

  showImgPreview(e) {
    var src = e.toElement.children[0].src;
    this.windowRef.nativeWindow.openModal('modal-show-img');

    var img = this.windowRef.nativeWindow.document.getElementById("#preview-img-src");
    img.src = src;

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
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify showmore',"shop="+this.userShop);

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
}
