/**
 * Created by user on 13/10/2016.
 */

import { Injectable }    from '@angular/core';
import {Headers, RequestOptions, Http, Response} from "@angular/http";

import 'rxjs/add/operator/toPromise';

import {AppState} from "../app.service";
import {Observable} from "rxjs";

export class Plan {
    planId: number;
    name: string;
    currency: string;
    monthlyPrice: string;
    description:string;
    planColor:string;
    planCode:string;
    free:boolean;
    dateRenew:any;

}


@Injectable()
export class PlansService {

    private headers = new Headers({'Content-Type': 'application/json'});
    apiUrl:string;

    constructor(public appState: AppState,private http: Http) {
        this.apiUrl = appState.get("apiURL");
    }

    getPlans(productId:string): Observable<Plan[]> {
        this.apiUrl = this.appState.get("apiURL");
        let cached: any;
        var cacheKey = "ca-"+productId+"/getPlans-malabi";
        if (cached = sessionStorage.getItem(cacheKey)) {
            var a = JSON.parse(cached);

            var _final = new Date();
            var seconds = (_final.getTime() - new Date(a["saveData"]).getTime())/1000;
            if(seconds < 60*60 *100){
                return Observable.of(JSON.parse(cached).plans as Plan[]);
            }
        }

        let body = JSON.stringify({
            productId: productId
        });

        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});

        return this.http.post(this.apiUrl + "/getPlans", body, options)
            .map(response => {
                var res = response.json();
              if(res["status"] && res["status"] == "fail"){
                console.log(res["error"]);
                return;
              }

              res.saveData = new Date();

                sessionStorage.setItem(cacheKey, JSON.stringify(res));
                return response.json().plans as Plan[];
            })
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}



/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license
 */
