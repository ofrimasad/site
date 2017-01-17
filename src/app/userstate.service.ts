/**
 * Created by user on 13/10/2016.
 */

import { Injectable }    from '@angular/core';
import {Headers, RequestOptions, Http, Response} from "@angular/http";

import 'rxjs/add/operator/toPromise';

import {AppState} from "./app.service";
import {Observable} from "rxjs";

export type InteralStateType = {
  [key: string]: any
};

@Injectable()
export class UserstateService {

  private headers = new Headers({'Content-Type': 'application/json'});
  apiUrl:string;
  private apiShopifyURL;
  firsttime:boolean = false;



  _state: InteralStateType = { };

  constructor(public appState: AppState,private http: Http) {

  }

  // already return a clone of the current state
  get state() {
    return this._state = this._clone(this._state);
  }
  // never allow mutation
  set state(value) {
    throw new Error('do not mutate the `.state` directly');
  }

  get(prop?: any) {
    // use our state getter for the clone
    const state = this.state;
    if(prop != undefined){
      return state.hasOwnProperty(prop) ? state[prop] : null;
    }
    return state.hasOwnProperty(prop) ? state[prop] : state;
  }

  set(prop: string, value: any) {
    // internally mutate our state
    return this._state[prop] = value;
  }


  private _clone(object: InteralStateType) {
    // simple object clone
    return JSON.parse(JSON.stringify( object ));
  }


  uploadState() {
    var state = this.get();
    var apiShopifyURL = this.appState.get("apiShopifyURL");
    let body = JSON.stringify({
      userId:this.appState.get("userId"),
      userToken:this.appState.get("userToken"),
      state:state
    });

    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(apiShopifyURL+"/userState", body, options)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }


  downloadState(): Observable<any> {
    var userId =this.appState.get("userId");
    var userToken = this.appState.get("userToken");
    var apiShopifyURL = this.appState.get("apiShopifyURL");

    return  this.http.get(apiShopifyURL+"/userState?userId="+userId+"&userToken="+userToken)
      .map(res => this.addFromDownload(res)
       )
      .catch(this.handleError);
  }

  private addFromDownload(response){
    var res;
    try {
      res = response.json();

    } catch (e){
      throw new Error('state response error');
    }

    if(res.status == "fail"){
      if(res.error == "user-not-found"){
      }
    } else {
      var _this = this;
      var a = JSON.parse(res.state);
      Object.keys(a).forEach(function(key) {
        _this.set(key, a[key]);
      });
    }
    return this.get();
  }


  private handleError(error: any): Observable<any> {
    console.error('An error occurred', error); // for demo purposes only
    return (error.message || error);
  }
}



/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license
 */
