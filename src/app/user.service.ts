import {Injectable} from '@angular/core';
import {AppState} from "./app.service";
import {WindowRef} from "./WindowRef";
import {Headers, RequestOptions, Http, Response} from "@angular/http";
import {Observable} from "rxjs";
import {PlansService} from "./plans/plans.service";
import {UserstateService} from "./userstate.service";

@Injectable()
export class UserService {

    constructor(public appState: AppState, private windowRef: WindowRef, private http: Http
      , private plansService: PlansService,private userState:UserstateService){

    }

    checkUserSession(view){
      var that = this;
      if(localStorage.getItem("camera51-login")){
        var userInfo = JSON.parse(localStorage.getItem("camera51-login"));
        Object.keys(userInfo).forEach(function(key) {
          that.appState.set(key,userInfo[key] );
        });

        this.windowRef.nativeWindow.setIsloggedIn(true);
        this.windowRef.nativeWindow.setUserloggedIn(this.appState.get("userId"),this.appState.get("userToken") );
        this.windowRef.nativeWindow.ga('set', 'userId', this.appState.get("userId"));
        this.setUserinfoIntoView(view);

        this.retrieveUserData(this.appState.get("userId"), this.appState.get("userToken"))
          .subscribe(
            a => {
              if(a.status == "fail"){
                console.log("fail to retrieve info. Login again.");
                try {
                  localStorage.removeItem('camera51-login');
                } catch (e) {

                }


              } else {
                //this.loginservice.loginUser(this.eref,a);
                this.setDbDataToAppState(a);
                this.plansService.getPlans(this.appState.get("planProductId"))
                // .then(plan => this.plans = plan);
                  .subscribe(

                  );
              }
            }

          );

        this.userState.downloadState()
          .subscribe(

          );
      }
    }

    setDbDataToAppState(user){
      if(user.hasOwnProperty("creditExpires")){
        this.appState.set("creditExpires", user.creditExpires);
      }
      if(user.hasOwnProperty("userCredit")){
        try {
          this.windowRef.nativeWindow.setUserCredit(user.userCredit);
        }catch (e){

        }
      }
      if(user.hasOwnProperty("subscription")){
        this.appState.set("subscription", user.subscription);
      }
    }

    loginUser(view, user){
        if(!user.hasOwnProperty("userId")){
            return;
        }
        //  var view = this.eref;
        view.nativeElement.ownerDocument.getElementById("loginLabel").style.display = "none";
        view.nativeElement.ownerDocument.getElementById("registerLabel").style.display = "none";
        view.nativeElement.ownerDocument.getElementById("myAccountDropdownLabel").style.display = "block";
        var saveToLocalStorage = {};

            this.appState.set("userId", user.userId);
            this.appState.set("userEmail", user.userEmail);

        if(user.hasOwnProperty("userToken")){
          this.appState.set("userToken", user.userToken);
        }

        saveToLocalStorage["userToken"] = user.userToken;
        saveToLocalStorage["userId"] = user.userId;

        if(user.hasOwnProperty("creditExpires")){
            this.appState.set("creditExpires", user.creditExpires);
        }
        if(user.hasOwnProperty("userCredit")){
            this.appState.set("userCredit", user.userCredit);
        }
        if(user.hasOwnProperty("subscription")){
            this.appState.set("subscription", user.subscription);
        }

        if(user.hasOwnProperty("lastName") && user.lastName.length > 1){
            this.appState.set("lastName", user.lastName);
        }
        if(user.hasOwnProperty("firstName") && user.firstName.length > 1){
            this.appState.set("firstName", user.firstName);
            view.nativeElement.ownerDocument.getElementById("myAccountDropdown").innerHTML  =  user.firstName + '<i class="material-icons setting-icon">settings</i>';

        } else {
            view.nativeElement.ownerDocument.getElementById("myAccountDropdown").innerHTML  =  "My Account" + '<i class="material-icons setting-icon">settings</i>';
            this.appState.set("firstName", "My Account");
        }
        this.windowRef.nativeWindow.setIsloggedIn(true);
        this.windowRef.nativeWindow.setUserloggedIn(user.userId, user.userToken);
        this.windowRef.nativeWindow.ga('set', 'userId', user.userId); // Set the user ID using signed-in user_id.
        try {
          localStorage.setItem("camera51-login",JSON.stringify(user));
          this.saveUserPageToLocalStorage(view);
        } catch (e) {

        }



    }

    updateAppState(userInfo){
      var _this = this ;
      // show
      Object.keys(userInfo).forEach(key => {
        _this.appState.set(key,userInfo[key] );
      });
    }

    setUserinfoIntoView(view){
        view.nativeElement.ownerDocument.getElementById("loginLabel").style.display = "none";
        view.nativeElement.ownerDocument.getElementById("registerLabel").style.display = "none";
        view.nativeElement.ownerDocument.getElementById("myAccountDropdownLabel").style.display = "block";


        var firstName =  this.appState.get("firstName");

        if(firstName){
            view.nativeElement.ownerDocument.getElementById("myAccountDropdown").innerHTML  =  firstName + '<i class="material-icons setting-icon">settings</i>';
        } else {
            view.nativeElement.ownerDocument.getElementById("myAccountDropdown").innerHTML  =  "My Account"+ '<i class="material-icons setting-icon">settings</i>';
        }
    }


    setUserPageFormLocalStorage(view){
        var userId =  this.appState.get("userId");
        if(userId !== parseInt(userId, 10)){
          userId = 0;
        }
        if(localStorage.getItem("camera51-imageList"+"-"+userId)){
            var inner = localStorage.getItem("camera51-imageList"+"-"+userId);
            view.nativeElement.ownerDocument.getElementById("imageList").innerHTML = inner;
        }
    }

    saveUserPageToLocalStorage(view){
      if(this.supports_html5_storage() === false){
        return;
      }
      var userId =  this.appState.get("userId");
      if(userId !== parseInt(userId, 10)){
        userId = 0;
      } else {
        try {
          localStorage.removeItem("camera51-imageList-0");
        } catch (e) {
          return false;
        }

      }
      var images = view.nativeElement.ownerDocument.getElementById("imageList").innerHTML;
      try {
        localStorage.setItem("camera51-imageList"+"-"+userId, images);
      } catch (e) {
        localStorage.removeItem("camera51-imageList"+"-"+userId);
        return false;
      }
    }


   supports_html5_storage() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }


    changePassword(body): Observable<any>{

        var state= this.appState.get("apiURL");
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(state+"/changePassword", body, options)
            .map((res:Response) => res.json())
            .catch(this.handleError);
    }


    downloadImages(body): Observable<any>{

        var state= this.appState.get("apiDownloadURL");
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(state+"/Camera51Server/getZippedImages", body, options)
            .map((res:Response) => res.json())
            .catch(this.handleError);
    }

    retrieveUserData(userId, userToken ): Observable<any> {
        let body = JSON.stringify({
            userId:userId,
            userToken:userToken
        });
        var state= this.appState.get("apiURL");
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(state+"/retrieveUserData", body, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    private extractData(res: Response){
        try {
            let body = res.json();
            if(body.status == "success"){
                return body.user || { };
            } else {
                return  {"status":"fail"};
            }

        } catch (e){
            console.log(e);
            return ;
        }

    }

    private handleError (error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message

        return Observable.throw("error");
    }


}
