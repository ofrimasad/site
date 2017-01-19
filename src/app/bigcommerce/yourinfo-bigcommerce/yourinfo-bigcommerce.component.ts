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
import {PlansComponentService} from "../../shopify/mission.service";
import {SubscriptionService} from "../../yourinfo/subscription.service";
@Component({
  selector: 'yourinfobigcommerce',
  styleUrls: [ 'yourinfo-bigcommerce.style.css' ],
  templateUrl: 'yourinfo-bigcommerce.template.html'
})
export class Yourinfobigcommerce {
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
    this.windowRef.nativeWindow.angularComponentYourinfobigcommerce = {
      zone: this.zone,
      componentFn: () => this.openMyAccountBigcommerce(),
      component: this
    };

    this.userService.retrieveUserData(this.appState.get("userId"), this.appState.get("userToken"))
      .subscribe(
        a => {
          this.updateUserInfoInApp(a);

        }
      );

  }

  private openMyAccountBigcommerce(){
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
    this.windowRef.nativeWindow.ga('set', { page:'/bigcommerce/cancelsubscription',title:'Bigcommerce Cancel Subscription'});
    this.windowRef.nativeWindow.ga('send', 'pageview');
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce open cancel subscription',"shop="+this.appState.get("userShop"));
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
      this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce cancel subscription success',"shop="+this.appState.get("userShop"));
      this.windowRef.nativeWindow.stopLoadingCursor();
    }

    if(a.status == "fail"){
      this.showCancelRequest = "none";
      this.showCancelResponse = "block";
      this.cancelResponse = "No subscription found";
      this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce cancel subscription fail',"shop="+this.appState.get("userShop"));

      this.windowRef.nativeWindow.stopLoadingCursor();
    }
  }

  changePlan(){
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce click update plan',"shop="+this.appState.get("userShop"));

    this.closeModal();
    this.plansComponentService.openPlan({});

  }

  returnToYourInfo(modalToClose:string){
    this.windowRef.nativeWindow.closeModal(modalToClose );
    this.openModal();
  }

  closeModal(){
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce close my account',"shop="+this.appState.get("userShop"));

    this.windowRef.nativeWindow.closeModal('modalYourInfo-bigcommerce');

  }

  openModal(){
    this.windowRef.nativeWindow.ga('set', { page:'/bigcommerce/myaccount',title:'Bigcommerce My Account'});
    this.windowRef.nativeWindow.ga('send', 'pageview');
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce open my account',"shop="+this.appState.get("userShop"));
    this.windowRef.nativeWindow.startLoadingCursor();

    this.userService.retrieveUserData(this.appState.get("userId"), this.appState.get("userToken"))
      .subscribe(
        a => {
          this.updateUserInfoInApp(a);

        }
      );
    this.windowRef.nativeWindow.openModal('modalYourInfo-bigcommerce');

  }

}




