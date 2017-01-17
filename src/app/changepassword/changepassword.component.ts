import { Component, ElementRef } from '@angular/core';
import {NgForm} from '@angular/forms';
import { Headers, Http, Response } from '@angular/http';
import {Observable}       from 'rxjs/Observable';
import { AppState } from '../app.service';
import 'rxjs/add/operator/toPromise';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { WindowRef } from '../WindowRef';
import {UserService} from "../user.service";
declare  var $:any;

@Component({

  selector: 'changepassword',
  styleUrls: [ 'changepassword.style.css' ],
  templateUrl: 'changepassword.template.html'
})
export class Changepassword {
  private headers = new Headers({'Content-Type': 'application/json'});
  userToken:String;
  userId = 0;
  passwordLabel;
  passwordConfirmLabel;
  passwordError = false;
  passwordErrorLabel = false;
  passwordValidityMessage:string = "Use at least 6 characters.";
  localState = { value: '' };
  // TypeScript public modifiers
  constructor(private windowRef: WindowRef,private eref: ElementRef,private http: Http,
              private route: ActivatedRoute, private router: Router,  public appState: AppState, private userService: UserService) {

  }

  ngOnInit() {
    this.openModal();
  }

  closeModal(){
    //$('#modalPlans').closeModal();
    this.router.navigate(['/']);

    this.windowRef.nativeWindow.closeModal('modalChangepassword');
  }

  openModal(){
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'open change password');
    var that = this;
    this.windowRef.nativeWindow.openModal('modalChangepassword',{complete: function() {
      that.router.navigate(['/']);
    }});
  }

  submitState(f: NgForm) {
    this.passwordLabel.setAttribute("data-error",this.passwordValidityMessage);
    this.passwordConfirmLabel.setAttribute("data-error",this.passwordValidityMessage);

    var password = f.value.password;
    var passwordConfirm = f.value.passwordConfirm;
    if(password == "" || password.length < 6){
      this.passwordLabel.setAttribute("data-error","Use at least 6 characters.");
      $('#password').addClass("invalid");
      $('#passwordLabel').addClass("active");
      return false;
    }
    if(passwordConfirm == "" || passwordConfirm.length < 6){
      this.passwordConfirmLabel.setAttribute("data-error",this.passwordValidityMessage);
      $('#passwordConfirm').addClass("invalid");
      $('#passwordConfirmLabel').addClass("active");
      return false;
    }
    if(passwordConfirm != password){
      this.passwordConfirmLabel.setAttribute("data-error","Passwords don't match");
      $('#passwordConfirm').addClass("invalid");
      $('#passwordConfirmLabel').addClass("active");
      return false;
    }

    if(this.appState.get("userId") >0){
      this.userLoggedIn(password);
    } else {
      this.userNotLoggedIn(password);
    }

  }

  userLoggedIn(password){

    var body = {
      "userId":this.appState.get("userId"),
      "userToken":this.appState.get("userToken"),
      "userPassword":password,
    };
    this.userService.changePassword(body)
        .subscribe(
           res => this.handleResponse(res)
        );

  }



  userNotLoggedIn(password){
    var params:any = this.route.params;
    params = params.getValue();
    try {
      var userId = null;
      var userToken = null;
      if(params.hasOwnProperty("id")){
        userId = params.id;
      }
      if(params.hasOwnProperty("token")){
        userToken =  params.token;
      }


      if(userToken != null && userId > 0){
        this.userId = userId;
        this.userToken = userToken;
      } else{
        console.log("userID or Token are not avaiable.");
        return;
      }

    } catch (e) {
      // statements to handle any exceptions
      console.log(e); // pass exception object to error handler
    }
    var body = {
      "userId":this.userId,
      "passwordToken":this.userToken,
      "userPassword":password,
    };
    var that = this;

    this.userService.changePassword(body)
        .subscribe(
            res => this.handleResponse(res)
        );
  }

  private handleResponse(res){
    if(res.status == "success"){
      if(this.appState.get("userId") >0){

      } else {
        this.windowRef.nativeWindow.setIsloggedIn(true);
        this.userService.loginUser(this.eref, res.user);
      }

      this.closeModal();

    }
    if(res.status == "fail"){

        this.passwordErrorLabel = true;
        this.passwordError = true;

    }

  }


}
