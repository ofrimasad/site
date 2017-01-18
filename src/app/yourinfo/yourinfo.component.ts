import {Component, ElementRef} from '@angular/core';

import { AppState } from '../app.service';
import {WindowRef} from "../WindowRef";
import {UserService} from "../user.service";

import {
    CanActivate, Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
}                           from '@angular/router';
import {InvoiceService, Invoice} from "./invoice.service";
import {SubscriptionService} from "./subscription.service";
import {isUndefined} from "util";
import {PlansComponentService} from "../shopify/mission.service";
@Component({

  selector: 'yourinfo',
  styleUrls: [ 'yourinfo.style.css' ],
  templateUrl: 'yourinfo.template.html'
})
export class Yourinfo {
  // Set our default values
  userInfo: Object;
  showCancelRequest:string = "block";
  showCancelResponse:string = "none";
  hasSubscription:boolean = false;

  cancelResponse:string = '';
  localState = { value: '' };
  plan:Object = {"name":"","description":""};
  subscription:Object = {"plan":{}};
  invoices:Invoice[] = [];
  noInvoices:boolean = false;

  // TypeScript public modifiers
  constructor(public appState: AppState, private windowRef: WindowRef, private router: Router,
              private userService: UserService, private eref: ElementRef, private invoiceService: InvoiceService,
              private subscriptionService: SubscriptionService, private plansComponentService: PlansComponentService) {

    this.userService.checkUserSession(eref);
    this.userInfo = appState.get();
  }

  ngOnInit() {
    var that = this;

    this.windowRef.nativeWindow.ga('set', { page:'/myaccount',title:'My Account'});
    this.windowRef.nativeWindow.ga('send', 'pageview');
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'my account open','userId='+this.appState.get("userId"));

    this.windowRef.nativeWindow.openModal('modalYourInfo', {complete: function() {
      that.router.navigate(['/']);
    }});
    this.windowRef.nativeWindow.startLoadingCursor();

    this.userService.retrieveUserData(this.appState.get("userId"), this.appState.get("userToken"))
        .subscribe(
            a => this.updateUserInfoInApp(a)
        );

    // this.title.getData().subscribe(data => this.data = data);
  }

  updateUserInfoInApp(a){


    if(a.status == "fail"){
      console.log("fail to retrieve info. Login again.");
      localStorage.removeItem('camera51-login');
      this.windowRef.nativeWindow.stopLoadingCursor();
      return;
    }
    this.userService.updateAppState( a);
    if(a.firstName == ""){
      a.firstName = "Your"
    } else {
      a.firstName = a.firstName + "'s";
    }
    this.userInfo = a;
    if(a.hasOwnProperty("subscription") && typeof a.subscription === 'object'){
      this.subscription = a.subscription;
      this.hasSubscription = true;
    }
    this.windowRef.nativeWindow.stopLoadingCursor();

  }

  changePassword(){
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'my account click change password','userId='+this.appState.get("userId"));

    this.windowRef.nativeWindow.closeModal('modalYourInfo');
    this.router.navigate(['/changepassword']);



  }
  cancelSubscriptionDialog(){
    this.windowRef.nativeWindow.closeModal('modalYourInfo');
    this.windowRef.nativeWindow.ga('set', { page:'/myaccount/cancelsubscription',title:'Cancel Subscription'});
    this.windowRef.nativeWindow.ga('send', 'pageview');
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'my account click cancel subscription','userId='+this.appState.get("userId"));
    var that = this;
    this.windowRef.nativeWindow.openModal('modalCancelSubscription', {complete: function() {
      that.router.navigate(['/']);
    }});
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
      this.windowRef.nativeWindow.stopLoadingCursor();
      this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'my account cancel subscription success','userId='+this.appState.get("userId"));


    }
    if(a.status == "fail"){
      this.showCancelRequest = "none";
      this.showCancelResponse = "block";
      this.cancelResponse = "No subscription found";
      this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'my account cancel subscription fail','userId='+this.appState.get("userId"));
      this.windowRef.nativeWindow.stopLoadingCursor();
    }
  }

  changePlan(){
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'my account click update plan','userId='+this.appState.get("userId"));
    this.windowRef.nativeWindow.closeModal('modalYourInfo');
    this.router.navigate(['/']);
    this.plansComponentService.openPlan({"noImagesTitle":false});

  }

  returnToYourInfo(modalToClose){
    var that = this;

    this.windowRef.nativeWindow.closeModal(modalToClose );
    this.windowRef.nativeWindow.openModal('modalYourInfo', {complete: function() {
      that.router.navigate(['/']);
    }});

  }

  showInvoices(){
    var that = this;
    this.windowRef.nativeWindow.ga('set', { page:'/myaccount/showinvoices',title:'Show Invoices'});
    this.windowRef.nativeWindow.ga('send', 'pageview');
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'my account click invoices','userId='+this.appState.get("userId"));

    this.windowRef.nativeWindow.closeModal('modalYourInfo');
    this.windowRef.nativeWindow.startLoadingCursor();

    this.invoiceService.getInvoices(this.appState.get("userId"), this.appState.get("userToken"))
        .then(invoice => this.checkInvoices(invoice))
        .then(    that.windowRef.nativeWindow.stopLoadingCursor());


    this.windowRef.nativeWindow.openModal('modalShowInvoices', {complete: function() {
      that.router.navigate(['/']);
    }});
  }

  checkInvoices(list){

    if(list == null || list.length == 0){
      this.noInvoices = true;
    } else {
      this.invoices = list;
    }

  }

  ngOnDestroy(){
    this.closeModal();
  }

  closeModal(){
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'my account close','userId='+this.appState.get("userId"));
    this.windowRef.nativeWindow.closeModal('modalYourInfo');
  }
}




