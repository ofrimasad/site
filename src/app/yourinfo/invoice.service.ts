/**
 * Created by user on 13/10/2016.
 */

import { Injectable }    from '@angular/core';
import {Headers, RequestOptions, Http, Response} from "@angular/http";

import 'rxjs/add/operator/toPromise';

import {AppState} from "../app.service";
import {Observable} from "rxjs";

export class Invoice {
    invoiceCode: number;
    invoiceDate: string;
    invoiceURL: string;
    invoiceId:number;
}


@Injectable()
export class InvoiceService {

    private headers = new Headers({'Content-Type': 'application/json'});
    apiUrl:string;

    constructor(public appState: AppState,private http: Http) {
        this.apiUrl = appState.get("apiURL");
    }

    getInvoices(userId, userToken): Promise<Invoice[]> {

        let body = JSON.stringify({
            userId:userId,
            userToken:userToken
        });

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(this.apiUrl+"/getInvoices", body, options)
            .toPromise()
            .then(response => response.json().invoices as Invoice[])
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
