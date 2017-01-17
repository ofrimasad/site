import {Component, ElementRef, NgZone} from '@angular/core';

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
  selector: 'youtubevideo',
  styleUrls: [ 'youtubevideo.style.css' ],
  templateUrl: 'youtubevideo.template.html'
})
export class Youtubevideo {
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
              private userService: UserService, private eref: ElementRef, private zone:NgZone,
              private plansComponentService: PlansComponentService, private subscriptionService:SubscriptionService) {



  }



}




