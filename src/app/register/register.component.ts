import { Component, ElementRef } from '@angular/core';
import {NgForm} from '@angular/forms';
import { Headers, Http, Response } from '@angular/http';
import {Observable}       from 'rxjs/Observable';
import { AppState } from '../app.service';
import 'rxjs/add/operator/toPromise';
import {
    CanActivate, Router, ActivatedRoute,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
}                           from '@angular/router';
import 'rxjs/Rx';
import {UserService} from "../user.service";
import {WindowRef} from "../WindowRef";
import {PlansComponentService} from "../shopify/mission.service";
declare  var $:any;

@Component({
  host: {
    '(document:click)': 'onClick($event)',
  },
  selector: 'register',

  styleUrls: [ 'register.style.css' ],
  templateUrl: 'register.template.html'
})
export class Register {
  emailError = false;
  submitted = false;
  passwordError = false;
  passwordErrorLabel = false;
  emailErrorLabel = false;
  localState = { email: '' };
  private headers = new Headers({'Content-Type': 'application/json'});
  acceptsMail = true;
  private passwordLabel: any;
  emailLabel: any;
  emailLabelDataError = "Enter valid email";
  passwordLabelDataError = "Use at least 6 characters.";
  couponCode:string = '';
  checkboxLabel:string = "I agree to receive tips and updates by email once in a while.";
  coupon:string = null;
  showHeading:boolean = true;
  // TypeScript public modifiers
  constructor(private eref: ElementRef, private http: Http,
              public appState: AppState, private router: Router, private loginservice: UserService,
              private windowRef: WindowRef,private plansComponentService:PlansComponentService, private route: ActivatedRoute) {


  }

  onClick(event){
    // if (event.target.innerHTML =="Create Account") // or some similar check
    //   $('#modalRegister').openModal();

  }

  openModal(){
    this.coupon = this.route.snapshot.queryParams["coupon"];

    var that = this;
    this.windowRef.nativeWindow.ga('set', { page:'/register',title:'Register'});
    this.windowRef.nativeWindow.ga('send', 'pageview');

    if (this.coupon != null) {
      this.couponCode = this.coupon;
      this.checkboxLabel = "Sign up to our emails for the latest news, promo codes, competitions and the latest Malabi hints and tips for even better clipping results.";
      this.showHeading = false;
      // $("#materialize-lean-overlay-1")[0].style.opacity = "1"
      $('#modalRegister').openModal({dismissible:false, opacity: 0.75,
        complete: function() {
          that.router.navigate(['/']);
          $(".lean-overlay").remove();
        }
      });
    } else {
      $('#modalRegister').openModal({
        complete: function() {
          that.router.navigate(['/']);
          $(".lean-overlay").remove();
        }
      });
    }

    var coupon = this.windowRef.nativeWindow.camera51WithQueue.getCookie("malabiCoupon");
    if (coupon != null) {
      this.couponCode = coupon;
    }
  }


  ngOnInit() {
    this.openModal();
  }

  ngAfterViewChecked() {
    //$("#materialize-lean-overlay-1")[0].style.opacity = "1";
  }

  checkBoxChange(ev){
    this.acceptsMail = ev.currentTarget.checked;
    console.log(ev.currentTarget.checked);
  }

  ngOnDestroy(){
    //console.log('hello `modalRegister` ngOnDestroy');
    this.closeModal();
  }

  closeModal(){
    $(".lean-overlay").remove();
    $('#modalRegister').closeModal();
  }

  submitState(f: NgForm) {
    this.passwordErrorLabel = false;
    this.passwordError = false;
    var firstName = f.value.firstName;
    var email = f.value.email;
    var password = f.value.password;
    var acceptsMail = (this.acceptsMail) ? "true" : "false";


    if(email == ""){
      $('#email').addClass("invalid");
      $('#emailLabel').addClass("active");
      return false;
    }
    if(password == ""){

      this.passwordLabelDataError = "Use at least 6 characters.";
      $('#password').addClass("invalid");
      $('#passwordLabel').addClass("active");
      return false;
    }

    if(!this.validateEmail(email) ){
      $('#email').addClass("invalid");
      $('#emailLabel').addClass("active");
      return false;
    }

    var a = {
      "firstName":f.value.firstName,
      "userEmail":f.value.email,
      "userPassword":f.value.password,
      "acceptsMail":acceptsMail,
      "coupon":f.value.couponCode
    };
    var that = this;
    this.windowRef.nativeWindow.startLoadingCursor();

    this.create(a)
      .then(res => {
        // console.log(res);
        that.windowRef.nativeWindow.stopLoadingCursor();
        that.emailErrorLabel = false;
        that.emailError = false;

        if(res.status == "success"){
         // this.closeModal();
          this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'register success', email);
          this.loginservice.loginUser(this.eref, res.user);

          if(this.appState.getExact("changePlan") > 1){
            this.plansComponentService.changePlan(this.appState.getExact("changePlan"));
          } else {
            this.submitted = true; // welcome popup
          }
        }

        if(res.status = "fail"){
          this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'register fail', email);
          if(res.error == "invalid_password"){
            this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'register fail', "invalid_password,"+email);
            that.passwordErrorLabel = true;
            that.passwordError = true;
            that.passwordLabelDataError = "Invalid password, use at least 6 characters.";
          }

          if(res.error == "email_exists"){
            that.emailErrorLabel = true;
            that.emailError = true;
            that.emailLabelDataError = "The email is already registered.";
          }
        }

      });
  }

  create(name: Object): Promise<any> {

    var state = this.appState.get("apiUrl");
    return this.http
      .post(state.apiURL+"/createUser", JSON.stringify(name), {headers: this.headers})
      .toPromise()
      .then(res => res.json())
      .catch(this.handleError);
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
