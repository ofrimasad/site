import {Component, ElementRef} from '@angular/core';

import { AppState } from '../app.service';
import {WindowRef} from "../WindowRef";
import {UserService} from "../user.service";

import {
    CanActivate, Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
}                           from '@angular/router';
import {NgForm} from "@angular/forms";
import {Http, Headers} from "@angular/http";
import {isNull} from "util";
declare  var $:any;

@Component({

  selector: 'contactus',  // <home></home>

  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: [ 'contactus.style.css' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'contactus.template.html'
})
export class Contactus {
  // Set our default values
  userInfo: Object;
  firstName:boolean;
  firstNameLabel:boolean;
  submitted = false;
  localState = { value: '' };
  plan:Object = {"name":"","description":""};
  subscription:Object = {"plan":{}};
  private headers = new Headers({'Content-Type': 'application/json'});

  // TypeScript public modifiers
  constructor(public appState: AppState, private windowRef: WindowRef, private userService: UserService,
              private router: Router,private eref: ElementRef, private http: Http) {

    this.userService.checkUserSession(eref);
  }

  submitState(f: NgForm) {
    this.firstName = false;
    this.firstNameLabel = false;
    var firstName = f.value.firstName;
    var email = f.value.email;
    var responseMessage = "";
    var message = f.value.message;
    var subject = f.value.subject;

    responseMessage = "<b>Submitted by Contact us form</b>";

    if(firstName == ""){
      $('#firstName').addClass("invalid");
      $('#firstNameLabel').addClass("active");
      return false;
    }
    if(email == ""){
      $('#email').addClass("invalid");
      $('#emailLabel').addClass("active");
      return false;
    }
    if(message == "" ){
      $('#message').addClass("invalid");
      $('#messageLabel').addClass("active");
      return false;
    }

    if(!this.validateEmail(email) ){
      $('#email').addClass("invalid");
      $('#emailLabel').addClass("active");
      return false;
    }

    responseMessage += "<br> name: " +firstName;
    responseMessage += "<br> email: " +email;
    responseMessage += "<br> subject: " +subject;
    responseMessage += "<br> message: " +f.value.message;
    responseMessage += "<br><br>" ;
    responseMessage += "<b>Data from logged in user</b>";

    responseMessage += "<br> userId: " + (this.appState.getExact("userId") != null) ? this.appState.getExact("userId") : " Not logged in";
    responseMessage += "<br> userEmail: " + (this.appState.getExact("userEmail") != null) ? this.appState.getExact("userEmail") : " Not logged in";
    responseMessage += "<br> subscription: " +JSON.stringify(this.appState.getExact("subscription"));

    var a = {

      "userEmail":f.value.email,
      "messageSubject":f.value.subject,
      "messageBody":responseMessage

    };
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'contactus send mail');
    this.submitted = true;
    this.sendRequest(a)
      .then();

  }


  sendRequest(name: Object): Promise<any> {

    var apiURL = this.appState.get("apiURL");
    return this.http
      .post(apiURL + "/contactUs", JSON.stringify(name), {headers: this.headers})
      .toPromise()
      .then(res => res.json())
      .catch(this.handleError);
  }



  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  ngOnInit() {

    if(this.appState.getExact("BigcommerceUser") == null){
      this.openModal();
    }
  }



  openModal(){

    var that = this;
    if(this.appState.getExact("BigcommerceUser") == null){
      this.windowRef.nativeWindow.openModal('modalContactus', {complete: function() {
        that.router.navigate(['/']);
      }});
    } else {
      this.windowRef.nativeWindow.openModal('modalContactus');
    }


    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'open contactus');
    this.windowRef.nativeWindow.ga('set', 'page', '/contactus');
    this.windowRef.nativeWindow.ga('send', 'pageview');
  }

  ngOnDestroy(){
    this.closeModal();
  }

  closeModal(){
    this.windowRef.nativeWindow.closeModal('modalContactus');

  }


}
