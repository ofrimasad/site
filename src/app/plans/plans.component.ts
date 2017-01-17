import {Component, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy, NgZone} from '@angular/core';
import { WindowRef } from '../WindowRef';
import { Headers, Http, Response } from '@angular/http';

import { AppState } from '../app.service';

import {
    CanActivate, Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot, ActivatedRoute
}                           from '@angular/router';
import {UserService} from "../user.service";
import {PlansService, Plan} from "./plans.service";
import {TakefirstPipe} from "./takefirst";
import {forEach} from "@angular/router/src/utils/collection";
import {PlansComponentService} from "../shopify/mission.service";
import {Subscription} from "rxjs";
import {unescape} from "querystring";
import {isUndefined} from "util";
declare  var $:any;

@Component({
    host: {
        '(document:click)': 'onClick($event)',
    },
    //pipes: [TakefirstPipe],
    selector: 'plans',
    styleUrls: [ 'plans.style.css' ],
    templateUrl: 'plans.template.html',
    changeDetection: ChangeDetectionStrategy.Default

})
export class Plans {
    // Set our default values
    showSubscriptionDetails:boolean = false;
    downgradeShow = "none";
    downgradePlanId = 0;
    planListZoom = 1;
    plantitle:string = "";
    plantitleBuyplan:string = "For downloading the enhanced images purchase a Malabi plan";
    plantitleNoCredit:string = "Not enough image credits left. Renew or upgrade a plan for downloading images.";
    arrowOpen = "keyboard_arrow_down";
    buttontitle:string = "Login to subscribe";
    buttontitleLogedIn:string = "Subscribe";
    plans:Plan[] = [];
    isOpen:boolean = false;
    noImagesTitle = false;
    subscription: Subscription;
    private plansCounter:number;
  private dateRenew: any;
    //plans = [];
    // TypeScript public modifiers
    constructor(private http: Http, private windowRef: WindowRef, private _eref: ElementRef, public appState: AppState,
                private router: Router, private loginservice: UserService, private plansService: PlansService,
                private route: ActivatedRoute, private ref: ChangeDetectorRef, private zone:NgZone,
                private plansComponentService:PlansComponentService) {
      this.windowRef.nativeWindow.angularComponentRef = {
        zone: this.zone,
        componentFn: () => this.toggelPlans(),
        component: this
      };
      this.subscription = plansComponentService.missionAnnounced$.subscribe(
        mission => {
          this.openModal();
          if(mission != undefined && mission.hasOwnProperty("noImagesTitle")){
            this.noImagesTitle = mission["noImagesTitle"];
          }
        });
      plansComponentService.missionAnnouncedChange$.subscribe(
        mission => {
          this.changePlan(mission);
        });

    }

    showSubscriptionDetailsFunc(){
        this.showSubscriptionDetails = (this.showSubscriptionDetails == true) ? false : true;
        if(this.showSubscriptionDetails){
            this.arrowOpen = "keyboard_arrow_up";

        } else {
            this.arrowOpen = "keyboard_arrow_down";
        }
      //  showSubscriptionDetails ? keyboard_arrow_down : keyboard_arrow_up
    }

    onClick(event){
        if (event.target.id =="plans-link")
            this.openModal();
    }

    toggelPlans(){
      (this.isOpen)? this.closeModal(): this.openModal();

    }

    ngOnDestroy(){
        this.closeModal();
    }

    closeModal(){
        this.isOpen = false;
      this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'close plans');
        this.windowRef.nativeWindow.closeModal('modalPlans');
    }

    openModal(){
        this.back ();
        this.isOpen = true;
        this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'open plans');
        this.windowRef.nativeWindow.ga('set', { page:'/plans',title:'Plans'});
        this.windowRef.nativeWindow.ga('send', 'pageview');

        var params:any = this.route.params;
        params = params.getValue();
        var that = this;
        this.plansService.getPlans(this.appState.get("planProductId"))
            .subscribe(
              plans => {
      this.validatePlans(plans),
        that.showOther(params)
    }, error => this.handleError()
        );
    }



    validatePlans(plans:Plan[]){
      this.plansCounter = -1;
      var that = this;

      var x = plans.reduce(function(a, b) {

          if(b.monthlyPrice == "-"){
            b.free = true;
            b['counter'] = "free";
          } else {
            that.plansCounter = that.plansCounter +1;
            b['counter'] = that.plansCounter;
            b.free = false;
          }

        if(b.planCode.includes("no_visual") != true && b.planCode.includes("free") == true && isNaN(parseInt(that.appState.get("userId")))) {
          return a.concat(b);
        }
        if(b.planCode.includes("no_visual") != true && b.planCode.includes("free") != true) {
          return a.concat(b);
        }
        //if(b.planCode.includes("no_visual") != true){

        // }
        return a;
      },[]);

      if(x.length > 3 ){
        this.planListZoom = 0.79;
      } else {
        this.planListZoom = 1;
      }
      this.plans = x;
      return true;
    }

    public showOther(params){


      if(this.appState.get("userId") >0){
            this.plantitle = this.plantitleBuyplan;
            this.buttontitle = this.buttontitleLogedIn;
            this.noImagesTitle = false;

            if(params.hasOwnProperty("notenough") ){
                this.noImagesTitle = true;
            }

        } else {
            this.noImagesTitle = false;
        }

          this.windowRef.nativeWindow.openModal('modalPlans');


      setInterval(() => {
        this.ref.detectChanges();
      }, 100);
        //this.loginservice.saveUserPageToLocalStorage(this._eref);
    }


    private isDowngrade(plan){
        if(plan.planCode.includes("shopify")){
          return false;
        }
        var requestPlanId = plan.planId;
        var subscription = this.appState.get("subscription");
        if(subscription && typeof subscription === 'object' && subscription.hasOwnProperty("plan")){

            if(requestPlanId < subscription.plan.planId){
                var plansList = this._eref.nativeElement.getElementsByClassName("plans-list");
                for (var i = 0; i < plansList.length; i++) {
                    var planElement = plansList[i];
                    var thenum = planElement.id.match(/\d+/)[0];
                    if(thenum != requestPlanId){
                        planElement.style.display = "none";
                    }
                    plansList[0].parentElement.style.textAlign = "left";

                }
                this.downgradePlanId = requestPlanId;
                this.downgradeShow = "inline-block";
                this.dateRenew = subscription.endDate;
                return true;
            }
            return false;
        } else {
            return false;
        }
    }

    confirmDowngrade(){
        this.changePlan(this.downgradePlanId);
    }

    requestPlan(plan){
        var planId = plan.planId;
        if(typeof this.appState.get("userId") != "string" && isNaN(this.appState.get("userId"))  ){
          this.closeModal();
          this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'select non-registered use plan '+plan.planCode,'not logged in');
          if(!plan.planCode.includes("free")){
            this.appState.set("changePlan",planId );
          }
          this.router.navigate(['/register']);
          return;
        }

        // check if downgrade
        if(this.isDowngrade(plan)){
          this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'downgrade to plan '+plan.planCode,'user='+this.appState.get("userId"));
        } else {
            this.changePlan(planId);
            this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'change to plan '+plan.planCode,'user='+this.appState.get("userId"));
        }
    }

    back(){
        this.downgradeShow = "none";

        var plansList = this._eref.nativeElement.getElementsByClassName("plans-list");
        for (var i = 0; i < plansList.length; i++) {
            var planElement = plansList[i];
            planElement.style.display = "inline-block";
            plansList[0].parentElement.style.textAlign = "center";

        }
    }

    changePlan (id){

        //var paymentWindow = this.windowRef.nativeWindow.open("/assets/zoho-pay.html");
        var paymentRedirectUrl = this.appState.get("paymentRedirectUrl");
        var sqs = this.windowRef.nativeWindow.camera51WithQueue.getSQSurl();
        var a = {
            "planId":id,
            "userId": this.appState.get("userId"),
            "userToken":this.appState.get("userToken"),
            "queueUrl":sqs,
            "redirectUrl": paymentRedirectUrl
        };
        this.windowRef.nativeWindow.startLoadingCursor();
        var that = this;
        this.requestPaymentUrl(a)
            .then(res => {

                try {
                    res = res.json();
                } catch (e){
                    console.error(e);
                    that.windowRef.nativeWindow.stopLoadingCursor();
                    that.windowRef.nativeWindow.showUserError("Unknown server error, try again later.");
                    return;
                }

                if(res.status == "success"){
                    //paymentWindow.location.replace(res.checkoutUrl);
                    window.top.location.href = res.checkoutUrl;

                }
            });
    }


    requestPaymentUrl(name: Object): Promise<any> {
        var state = this.appState.get("apiURL");
        var headers = new Headers();
        headers = new Headers({'Content-Type': 'application/json'});
        return this.http
            .post(state+"/getPaymentURL", JSON.stringify(name), {headers: headers})
            .toPromise()
            .then(res => res)
            .catch(this.handleError);
    }


    handleError(){
      console.log("error");
    }


    ngOnInit() {
        //this.openModal();
        // this.title.getData().subscribe(data => this.data = data);
    }

}
