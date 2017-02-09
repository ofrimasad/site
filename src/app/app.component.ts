/*
 * Angular 2 decorators and services
 */
import {Component, ViewEncapsulation, state, ElementRef, NgZone, Compiler } from '@angular/core';
import { AppState } from './app.service';
import {UserService} from "./user.service";
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
}                           from '@angular/router';
import {WindowRef} from "./WindowRef";
import {PlansService} from "./plans/plans.service";
import {UserstateService} from "./userstate.service";
import {PlansComponentService} from "./shopify/mission.service";
declare  var $:any;

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.Emulated ,
  styleUrls: [
    './app.style.css'
  ],
  template: `
    <main>
      <router-outlet></router-outlet>
    </main>
   <plans></plans>
    
  `,
  providers: []

})
export class AppComponent {

  constructor(
    public appState: AppState, private eref: ElementRef, private zone:NgZone,
    private router: Router, private windowRef: WindowRef,private _compiler: Compiler,
    private userState:UserstateService, private loginservice: UserService, private plansComponentService:PlansComponentService) {

    appState.set("isSandbox", process.env.isSandbox);
    // clear cache
    _compiler.clearCache();
    appState.set("apiDownloadURL", "https://api.malabi.co");
    appState.set("apiURL", "https://users.malabi.co/UsersServer/v1");
    appState.set("apiShopifyURL", "https://users.malabi.co/UsersServer/shopify");
    appState.set("apiBigcommerceURL", "https://users.malabi.co/UsersServer/bigcommerce");
    appState.set("planProductId", "454354000000052180");


    if(appState.getExact("isSandbox")){
      console.log("Sandbox", appState.getExact("isSandbox"));
      appState.set("apiURL", "https://sandbox.users.malabi.co/UsersServer/v1");
      appState.set("apiShopifyURL", "https://sandbox.users.malabi.co/UsersServer/shopify");
      //appState.set("apiShopifyURL", "http://localhost:8080/UsersServer/shopify");
      appState.set("apiBigcommerceURL", "https://sandbox.users.malabi.co/UsersServer/bigcommerce");
     // appState.set("apiBigcommerceURL", "http://localhost:8080/UsersServer/bigcommerce");
      appState.set("planProductId", "402919000000047078");
    }

    appState.set("paymentRedirectUrl", window.location.protocol + "//" + window.location.host + "/#/paymentreceived");

   // appState.set("sqsURL", this.windowRef.nativeWindow.camera51WithQueue.getSQSurl());


    this.windowRef.nativeWindow.angularComponentApp = {
      zone: this.zone,
      componentFn: (value) => this.callCreditUpdate(value),
      component: this

    };
    this.windowRef.nativeWindow.angularComponentApp = {
      zone: this.zone,
      componentFn: (listImages) => this.downloadImages(listImages),
      component: this

    };
    this.windowRef.nativeWindow.angularComponentApp = {
      zone: this.zone,
      componentFn: () => this.updatedImages(),
      component: this

    };
  }



  downloadImages(listImages){
    if(this.appState.get("userCredit") == 0){
      //this.router.navigate(['/plans/notenough']);
      this.plansComponentService.openPlan({"noImagesTitle":true});
      this.windowRef.nativeWindow.ga('send','event', 'Site', 'download request no credit','userId='+this.appState.get("userId"));

      return;
    }

    if(listImages.length == 0){
      this.windowRef.nativeWindow.Materialize.toast('No images to download', 5000);
      return;
    }
    var obj = {
      userId:this.appState.get("userId"),
      userToken:this.appState.get("userToken"),
      imagesURLs: listImages
    };
    this.windowRef.nativeWindow.startLoadingCursor();
    this.windowRef.nativeWindow.ga('send','event', 'Site', 'download request','userId='+this.appState.get("userId")+"&amount="+listImages.length,listImages.length);

    this.loginservice.downloadImages(obj)
      .subscribe(
        a => this.download(a)
      );

  }

  download(res){

    this.windowRef.nativeWindow.stopLoadingCursor();

    if(res.status == "fail"){
      console.log("download request failed try again.");
      return;
    }

    if(res.response.hasOwnProperty("errors")){
      this.plansComponentService.openPlan({"noImagesTitle":true});
      return;
    }

    var link = document.createElement("a");
    link.download = "a";
    link.href = res.response.zipFileUrl;
    document.body.appendChild(link);

    link.click();
    this.appState.set("userCredit",res.response.userCredit );
    //localStorage.setItem("camera51-login",JSON.stringify(this.appState.get()));

    var elements = document.getElementsByClassName("downloadMeDownload");
    var that = this;
    this.windowRef.nativeWindow.ga('send','event', 'Site', 'download success','userId='+this.appState.get("userId"));

    $( ".downloadMeDownload" ).parents(".eachImage").fadeOut(1400, function(){
      $(this).remove();
      try {
        that.loginservice.saveUserPageToLocalStorage(that.eref);
      } catch (e) {

      }


      that.windowRef.nativeWindow.updateRemoveImage();
    });

  }

  updatedImages(){
    try {
      this.loginservice.saveUserPageToLocalStorage(this.eref);
    } catch (e) {

    }

  }

  callCreditUpdate(res){

    try {
      var message = 'Your credit is ' + res.userCredit;
      if(typeof this.appState.get("userShop") == "string"){
        parent.postMessage({"flashNotice":true,"text":"credit"},"*");
      } else {
        this.windowRef.nativeWindow.Materialize.toast(message, 10000);
      }

      this.windowRef.nativeWindow.ga('set', { page:'/creditupdate',title:'Credit update'});
      this.windowRef.nativeWindow.ga('send', 'pageview');

      this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'credit update','userId='+this.appState.get("userId")+"&credit="+res.userCredit);
      this.appState.set("userCredit",res.userCredit );
      this.appState.set("activePlanId",res.subscription.plan.planId );
      //localStorage.setItem("camera51-login",JSON.stringify(this.appState.get()));
      this.windowRef.nativeWindow.waitForSQS = false;
      this.router.navigate(['/']);
    } catch (e){
      console.log(e);
    }

  }

  ngOnInit() {
    //   console.log('Initial App State', this.appState.state);
  }

}
