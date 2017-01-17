import { Component, ElementRef } from '@angular/core';
import {NgForm} from '@angular/forms';
import { Headers, Http, Response } from '@angular/http';
import {Observable}       from 'rxjs/Observable';
import { AppState } from '../app.service';
import 'rxjs/add/operator/toPromise';
import {WindowRef} from "../WindowRef";

@Component({

  selector: 'forgotpassword',
  styleUrls: [ 'forgotpassword.style.css' ],
  templateUrl: 'forgotpassword.template.html'
})
export class Forgotpassword {
  private headers = new Headers({'Content-Type': 'application/json'});
  userEmail:String;
  emailInvalid = false;
  localState = { value: '' };
  private emailLabel: any;
  private passwordResetSuccess: any;
  private passwordResetForm: any;
  // TypeScript public modifiers
  constructor(private windowRef: WindowRef,private _eref: ElementRef,private http: Http, public appState: AppState) {

  }

  inputchange(){
    console.log("inputchange");
    this.emailInvalid = false;

  }
  onClick(event){
     if (event.target.innerHTML =="Forgotpassword") // or some similar check
       this.openModal();
  }


  ngOnInit() {
    this.openModal();
  }

  openModal(){
    this.windowRef.nativeWindow.openModal('modalForgotpassword');

    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'open forgot password');

  }


  submitState(f: NgForm) {
    this.emailLabel.setAttribute("data-error","Enter valid email.");

    var email = f.value.email;

    this.create(email)
      .then(res => {
        if(res.status == "success"){
          this.userEmail = email;
          this.passwordResetSuccess.style.display ="block";
          this.passwordResetForm.style.display ="none";
        }
        if(res.status == "fail"){
          this.emailInvalid = true;
          this.emailLabel.setAttribute("data-error","Email not found.");

        }

      });
  }

  create(email: string): Promise<any> {
    var state = this.appState.get("apiURL");//+"/login";
    var headers = new Headers();
    headers = new Headers({'Content-Type': 'application/json'});
    return this.http
        .post(state+"/renewPassword", JSON.stringify({"userEmail":email}), {headers: this.headers})
            .toPromise()
      .then(res => res.json())
      .catch(this.handleError);
  }

  handleError(){

  }
}
