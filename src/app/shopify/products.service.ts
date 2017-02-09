import { Injectable }    from '@angular/core';
import {Headers, RequestOptions, Http, Response} from "@angular/http";

import 'rxjs/add/operator/toPromise';

import {AppState} from "../app.service";
import {Observable} from "rxjs";

export class Products {
  id: number;
  imageId: number;
  images: Object;
  title: string;
  trackId:string;
  btnReplaceProductImageDisable:boolean;
  btnTouchUpDisable:boolean;
  btnAddProductImageDisable:boolean;
  status:any;
  showTransition:boolean=false;
  displayUndo:boolean=false;

}


@Injectable()
export class ProductsService {

  private headers = new Headers({'Content-Type': 'application/json'});

  apiShopifyURL:string;

  constructor(public appState:AppState, private http:Http) {
  }

  getProducts(userId:number, userToken:string, fields:string, limit:number, page:number,
              title:string,  published_status:string, updated_at_min:number
      , productIds:string): Observable<Products[]> {
    this.apiShopifyURL = this.appState.get("apiShopifyURL");
    //this.apiShopifyURL = "http://localhost:8080/UsersServer/shopify";
    let body = JSON.stringify({
      userId:userId,
      userToken:userToken,
      fields:fields,
      limit:limit, page:page, title:title, published_status:published_status,
      productIds:productIds, updated_at_min: updated_at_min

    });

    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this.http.post(this.apiShopifyURL + "/getProducts", body, options)
      .map(response => {

        return response.json().products as Products[];
      })
      .catch(this.handleError);
  }

  undoProductImage(userId:number, userToken:string, productId:string, imageId:string, imagePosition:string, filename:string){
    this.apiShopifyURL = this.appState.get("apiShopifyURL");

    let body = JSON.stringify({
      userId:userId,
      userToken:userToken,
      productId:productId,
      imagePosition:1,
      imageId:imageId,
      filename: "lala.jpg"
    });

    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this.http.put(this.apiShopifyURL + "/undoReplaceImage", body, options)
      .map(response => {

        return response.json();
      })
      .catch(this.handleError);
  }

  replaceProductImage(userId:number, userToken:string, productId:string, imageId:string, imageUrl:string, imageSrc:string){
    this.apiShopifyURL = this.appState.get("apiShopifyURL");
    //this.apiShopifyURL = "http://localhost:8080/UsersServer/shopify";

    let body = JSON.stringify({
      userId:userId,
      userToken:userToken,
      productId:productId,
      imageId:imageId,
      originalImageURL:imageSrc,
      resultImageURL:imageUrl
    });

    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this.http.put(this.apiShopifyURL + "/setProductImage", body, options)
      .map(response => {

        return response.json();
      })
      .catch(this.handleError);
  }

  addProductImage(userId:number, userToken:string, productId:string, imageId, imagePosition:number, imageUrl:string, imgName:string){
    this.apiShopifyURL = this.appState.get("apiShopifyURL");
    //this.apiShopifyURL = "http://localhost:8080/UsersServer/shopify";
    let body = JSON.stringify({
      userId:userId,
      userToken:userToken,
      fileName:imgName,
      productId:productId,
      imageId:imageId,
      imagePosition:imagePosition,
      resultImageURL:imageUrl
    });

    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this.http.post(this.apiShopifyURL + "/setProductImage", body, options)
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
