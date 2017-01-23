import { Component, ElementRef } from '@angular/core';
import {NgForm} from '@angular/forms';
import { Headers, Http, Response } from '@angular/http';
import {Observable}       from 'rxjs/Observable';
import { AppState } from '../app.service';
import {
    CanActivate, Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
}                           from '@angular/router';
import 'rxjs/add/operator/toPromise';
declare  var $:any;
import 'rxjs/Rx';
import {UserService} from "../user.service";
import {WindowRef} from "../WindowRef";
import {PlansComponentService} from "../shopify/mission.service";

@Component({
    host: {
        '(document:click)': 'onClick($event)',
    },
    selector: 'login',
    styleUrls: [ 'login.style.css' ],
    templateUrl: 'login.template.html'
})
export class Login {

    passwordError = "";
    localState = { email: '' };
    private headers = new Headers({'Content-Type': 'application/json'});
  private passwordLabel: any;

    // TypeScript public modifiers
    constructor(private eref: ElementRef, private http: Http,
                public appState: AppState, private router: Router, private loginservice: UserService,
                private windowRef: WindowRef, private plansComponentService:PlansComponentService) {
        // this.passwordError = "Use at least 8 charaters";
    }

    onClick(event){

      if(this.appState.get("userId") >0){
            // if (event.target.innerHTML =="Login") // or some similar check
            //     $('#modalLogin').openModal();
            if (event.target.id =="download-images") // or some similar check

                this.windowRef.nativeWindow.openModal('modalLogin');
        }
    }

    ngOnDestroy(){
        this.closeModal();
    }

    ngOnInit() {
        // console.log('hello `Login` component');
        this.openModal();
    }

    openModal(){
      var that = this;
      this.windowRef.nativeWindow.openModal('modalLogin',{complete: function() {
        that.router.navigate(['/']);
        $(".lean-overlay").remove();
      }});



      this.windowRef.nativeWindow.ga('set', { page:'/login',title:'Login'});
      this.windowRef.nativeWindow.ga('send', 'pageview');
    }

    closeModal(){
        $(".lean-overlay").remove();

        this.windowRef.nativeWindow.closeModal('modalLogin');
    }

    submitState(f: NgForm) {
        var email = f.value.email;
        var password = f.value.password;
        if(email == ""){
            $('#email').addClass("invalid");
            $('#emailLabel').addClass("active");
            return false;
        }
        if(password == ""){
            this.passwordLabel.setAttribute("data-error","Use at least 8 characters.");
            $('#password').addClass("invalid");
            $('#passwordLabel').addClass("active");
            return false;
        }
        var that = this;
        this.windowRef.nativeWindow.startLoadingCursor();

        this.create(email, password)
            .then(res => {
                that.windowRef.nativeWindow.stopLoadingCursor();
                if(res.status == "success"){
                    this.closeModal();
                    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'login success', email);
                    this.loginservice.loginUser(this.eref, res.user);
                    if(this.appState.getExact("changePlan") > 1){
                      this.plansComponentService.changePlan(this.appState.getExact("changePlan"));
                    } else {
                      this.router.navigate(['/']);
                    }
                    //this.router.navigate(['/']);
                } else {
                    $('#password').addClass("invalid");
                    $('#passwordLabel').addClass("active");
                    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'login fail', email);

                    this.passwordLabel.setAttribute("data-error","The password you have entered is incorrect.");
                }
            });
    }

    create(email: string, password:string): Promise<any> {
        var state = this.appState.get("apiUrl");//+"/login";
        var headers = new Headers();
        headers = new Headers({'Content-Type': 'application/json'});

        return this.http

            .post(state.apiURL+"/login", JSON.stringify({"userEmail":email,"userPassword":password}),{
                headers: headers
            })
            .toPromise()
            .then(res =>  res.json())
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.log('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
