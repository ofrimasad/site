import {Component, ElementRef} from '@angular/core';

import { AppState } from '../app.service';

import {UserService} from "../user.service";
import {WindowRef} from "../WindowRef";
import {UserstateService} from "../userstate.service";
import {PlansService} from "../plans/plans.service";


@Component({
  selector: 'home',  // <home></home>
  styleUrls: [ 'home.style.css' ],
  //templateUrl: 'home.template.html'
  templateUrl: 'homeempty.template.html'
})
export class Home {

  localState = { value: '' };

  constructor(public appState: AppState,
              private windowRef: WindowRef, private plansService: PlansService,private userState:UserstateService,
              private eref: ElementRef, private userService: UserService) {


    this.userService.checkUserSession(eref);
    this.userService.setUserPageFormLocalStorage(eref);


    this.plansService.getPlans(this.appState.get("planProductId")).subscribe();
  }


  ngOnInit() {
    if(this.appState.get("userId") >0){
      this.windowRef.nativeWindow.ga('set', 'userId', this.appState.get("userId"));
    }
    this.windowRef.nativeWindow.ga('set', { page:'/',title:'Home'});
    this.windowRef.nativeWindow.ga('send', 'pageview');


    // this.title.getData().subscribe(data => this.data = data);
  }

  paymentreceived(){

  }
}
