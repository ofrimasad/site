import { Injectable }    from '@angular/core';
import {Headers, RequestOptions, Http, Response} from "@angular/http";

import 'rxjs/add/operator/toPromise';

import {AppState} from "../app.service";
import {Observable} from "rxjs";

export class Products {
  id: number;
  images: Object;
  title: string;
  trackId:string;
  btnReplaceProductImageDisable:boolean;
  btnTouchUpDisable:boolean;
  btnAddProductImageDisable:boolean;
  status:any;

}


@Injectable()
export class ProductsService {

  private headers = new Headers({'Content-Type': 'application/json'});

  apiBigcommerceURL:string;

  constructor(public appState:AppState, private http:Http) {
  }

  getProducts(userId:number, userToken:string, fields:string, limit:number, page:number,
              title:string,  published_status:string, updated_at_min:number
      , productIds:string): Observable<Products[]> {
    this.apiBigcommerceURL = this.appState.get("apiBigcommerceURL");
    //this.apiBigcommerceURL = "http://localhost:8080/UsersServer/bigcommerce";
    let body = JSON.stringify({
      userId:userId,
      userToken:userToken,
      fields:fields,
      limit:limit, page:page, title:title, published_status:published_status,
      productIds:productIds, updated_at_min: updated_at_min

    });

    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this.http.post(this.apiBigcommerceURL + "/getProducts", body, options)
      .map(response => {

        return response.json().products as Products[];
      })
      .catch(this.handleError);
  }

  replaceProductImage(userId:number, userToken:string, productId:string, imageId:string, imageUrl:string){
    this.apiBigcommerceURL = this.appState.get("apiBigcommerceURL");
    //this.apiBigcommerceURL = "http://localhost:8080/UsersServer/bigcommerce";

    let body = JSON.stringify({
      userId:userId,
      userToken:userToken,
      productId:productId,
      imageId:imageId,
      resultImageURL:imageUrl
    });

    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this.http.put(this.apiBigcommerceURL + "/setProductImage", body, options)
      .map(response => {

        return response.json();
      })
      .catch(this.handleError);
  }

  addProductImage(userId:number, userToken:string, productId:string, imagePosition:number, imageUrl:string, imgName:string){
    this.apiBigcommerceURL = this.appState.get("apiBigcommerceURL");
    //this.apiBigcommerceURL = "http://localhost:8080/UsersServer/bigcommerce";
    let body = JSON.stringify({
      userId:userId,
      userToken:userToken,
      fileName:imgName,
      productId:productId,
      imagePosition:imagePosition,
      resultImageURL:imageUrl
    });

    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this.http.post(this.apiBigcommerceURL + "/setProductImage", body, options)
      .map(response => {

        return response.json();
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
