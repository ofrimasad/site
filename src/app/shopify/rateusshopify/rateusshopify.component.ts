import {Component, ElementRef, Input, Output, EventEmitter, ViewChildren} from '@angular/core';
import {UserstateService} from "../../userstate.service";
import {AppState} from "../../app.service";
import {WindowRef} from "../../WindowRef";
import {Http, Headers} from "@angular/http";


@Component({
  selector: 'rateusshopify',
  styleUrls: ['../shopify.style.css'],
  templateUrl: 'rateusshopify.template.html',

})
export class Rateusshopify {
  private showDobetter = false;
  public starSelected = [];
  private ratingNumber: number = 0;
  @ViewChildren('textDoBetterArea') textDoBetterArea;
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private appState: AppState, private windowRef: WindowRef,
              private userState: UserstateService, private http: Http) {

  }

  closeModal() {
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify close rateus', "shop=" + this.appState.get("userShop"));
    this.windowRef.nativeWindow.closeModal('modal-shopify-rateus');
  }

  public openModal() {
    this.windowRef.nativeWindow.ga('set', 'page', '/shopify/rateus');
    this.windowRef.nativeWindow.ga('send', 'pageview');
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify open rateus', "shop=" + this.appState.get("userShop"));

    this.windowRef.nativeWindow.openModal('modal-shopify-rateus', {
      complete: () => {
        this.sendInfo();
      }
    });

  }

  public remindme() {
    let today = new Date().toISOString().slice(0, 10);
    this.userState.set("shopifyRateRemindMe", today);
    this.userState.uploadState();
    this.closeModal();
  }

  public dontask() {
    this.userState.set("shopifyRateDontAsk", true);
    this.userState.uploadState();
    this.closeModal();
  }

  public submit() {
    this.sendInfo();
    this.dontask();
    this.closeModal();
  }

  sendRequest(name: Object): Promise<any> {

    var apiURL = this.appState.get("apiShopifyURL");
    return this.http
      .post(apiURL + "/rateus", JSON.stringify(name), {headers: this.headers})
      .toPromise()
      .then(res => res.json())
      .catch(this.handleError);
  }


  private sendInfo() {

    if (this.ratingNumber == 0) {
      this.remindme();
      return;
    }

    var body = "Rating from shop: " + this.appState.get("shop") + " <br>";
    body += "Rating given:" + this.ratingNumber + " <br>";
    body += "Text:" + this.textDoBetterArea.first.nativeElement.value + " <br>";
    body += "UserId:" + this.appState.get("userId") + " <br>";

    var a = {
      userId: this.appState.get("userId"),
      userToken: this.appState.get("userToken"),
      messageSubject: "Shopify Rate Us",
      messageBody: body
    };
    this.dontask();
    this.sendRequest(a)
      .then(res => console.log(res));

    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'shopify rateus', "shop=" + this.appState.get("userShop"), this.ratingNumber);


  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  public rate(num: number) {
    this.ratingNumber = num;
    if (num == 5) {
      this.windowRef.nativeWindow.open("https://apps.shopify.com/dc4b0d5a27a5f392b8d0e29e64097614?reveal_new_review=true");
      this.dontask();
      this.sendInfo();
      this.closeModal();
    } else {
      this.showDobetter = true;
      this.starSelected = [];
      for (var i = 1; i <= num; i++) {
        this.starSelected[i + 1] = true;
      }
    }
  }

}




