import {Component, ElementRef, NgZone, ChangeDetectorRef} from '@angular/core';

import { AppState } from '../../app.service';
import {WindowRef} from "../../WindowRef";
import {UserService} from "../../user.service";

import {
    CanActivate, Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
}                           from '@angular/router';
import {isUndefined} from "util";
import {PlansComponentService} from "../mission.service";
import {SubscriptionService} from "../../yourinfo/subscription.service";
@Component({
  selector: 'yourinfoshopify',
  styleUrls: [ 'yourinfo-shopify.style.css' ],
  templateUrl: 'yourinfo-shopify.template.html'
})
export class Yourinfoshopify {
  // Set our default values
  userInfo: Object;
  showCancelRequest:string = "block";
  showCancelResponse:string = "none";
  hasSubscription:boolean = false;
  canCancelSubscription:boolean = false;

  cancelResponse:string = '';
  localState = { value: '' };
  plan:Object = {"name":"","description":""};
  subscription:Object = {"plan":{}};
  noInvoices:boolean = false;

  // TypeScript public modifiers
  constructor(public appState: AppState, private windowRef: WindowRef, private router: Router,
              private userService: UserService, private eref: ElementRef, private zone:NgZone, private changeDetector: ChangeDetectorRef,
              private plansComponentService: PlansComponentService, private subscriptionService:SubscriptionService) {

    this.userInfo = appState.get();
    this.windowRef.nativeWindow.angularComponentYourinfoshopify = {
      zone: this.zone,
      componentFn: () => this.openMyAccountShopify(),
      component: this
    };

    this.userService.retrieveUserData(this.appState.get("userId"), this.appState.get("userToken"))
      .subscribe(
        a => {
          this.updateUserInfoInApp(a);

        }
      );

  }

  private openMyAccountShopify(){
    this.openModal();
  }

  updateUserInfoInApp(a){

    if(a.status == "fail"){
      console.log("fail to retrieve info. Login again.");
      localStorage.removeItem('camera51-login');
      return;
    }

    this.userInfo = a;
    this.userService.updateAppState( a);
    if(a.hasOwnProperty("subscription") && typeof a.subscription === 'object' && a.subscription != ""){
      this.subscription = a.subscription;

      if(this.subscription.hasOwnProperty("plan") &&
          this.subscription["plan"].hasOwnProperty("planCode") &&
          this.subscription["plan"].planCode.includes("no_visual")){

          this.canCancelSubscription = false; // Can not cancel free subscription.

      } else {
        this.hasSubscription = true;
        this.canCancelSubscription = true;
      }

    } else {
      this.canCancelSubscription = false;
      this.hasSubscription = false;
    }
    setTimeout(() => {
      this.changeDetector.detectChanges();
    }, 200);
    this.windowRef.nativeWindow.stopLoadingCursor();


  }


  cancelSubscriptionDialog(){
    this.closeModal();
    this.windowRef.nativeWindow.ga('set', { page:'/shopify/cancelsubscription',title:'Shopify Cancel Subscription'});
    this.windowRef.nativeWindow.ga('send', 'pageview');
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify open cancel subscription',"shop="+this.appState.get("userShop"));
    this.windowRef.nativeWindow.openModal('modalCancelSubscription');
  }

  cancelSubscription(){

    this.windowRef.nativeWindow.startLoadingCursor();

    this.subscriptionService.cancelSubscription(this.appState.get("userId"), this.appState.get("userToken"))
        .subscribe(
            a => this.cancelSubscriptionResponse(a)
        );
  }

  cancelSubscriptionResponse(a){

    if(a.status == "success"){
      this.showCancelRequest = "none";
      this.showCancelResponse = "block";
      this.cancelResponse = "Subscription was canceled successfully";
      this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify cancel subscription success',"shop="+this.appState.get("userShop"));
      this.windowRef.nativeWindow.stopLoadingCursor();
    }

    if(a.status == "fail"){
      this.showCancelRequest = "none";
      this.showCancelResponse = "block";
      this.cancelResponse = "No subscription found";
      this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify cancel subscription fail',"shop="+this.appState.get("userShop"));

      this.windowRef.nativeWindow.stopLoadingCursor();
    }
  }

  changePlan(){
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify click update plan',"shop="+this.appState.get("userShop"));

    this.closeModal();
    this.plansComponentService.openPlan({});

  }

  returnToYourInfo(modalToClose:string){
    this.windowRef.nativeWindow.closeModal(modalToClose );
    this.openModal();
  }

  closeModal(){
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify close my account',"shop="+this.appState.get("userShop"));

    this.windowRef.nativeWindow.closeModal('modalYourInfo-shopify');

  }

  openModal(){
    this.windowRef.nativeWindow.ga('set', { page:'/shopify/myaccount',title:'Shopify My Account'});
    this.windowRef.nativeWindow.ga('send', 'pageview');
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify open my account',"shop="+this.appState.get("userShop"));
    this.windowRef.nativeWindow.startLoadingCursor();

    this.userService.retrieveUserData(this.appState.get("userId"), this.appState.get("userToken"))
      .subscribe(
        a => {
          this.updateUserInfoInApp(a);

        }
      );
    this.windowRef.nativeWindow.openModal('modalYourInfo-shopify');

  }

}




