import {Component} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Headers, Http} from '@angular/http';
import {AppState} from '../app.service';
import {
   Router
}                           from '@angular/router';
import 'rxjs/add/operator/toPromise';
declare var $:any;
import 'rxjs/Rx';
import {WindowRef} from "../WindowRef";

@Component({
  host: {
    '(document:click)': 'onClick($event)',
  },
  selector: 'createCustomer',
  styleUrls: ['createCustomer.style.css'],
  templateUrl: 'createCustomer.template.html'
})
export class CreateCustomer {

  localState = {name: ''};


  // TypeScript public modifiers
  constructor(private http:Http,
              public appState:AppState, private router:Router,
              private windowRef:WindowRef) {
  }

  onClick(event) {

    if (this.appState.get("userId") > 0) {
      if (event.target.id == "download-images") // or some similar check

        this.windowRef.nativeWindow.openModal('modalGetAPIKey');
    }
  }

  ngOnDestroy() {
    this.closeModal();
  }

  ngOnInit() {
      this.openModal();
  }

  openModal() {
    var that = this;
    this.windowRef.nativeWindow.openModal('modalGetAPIKey', {
      complete: function () {
        that.router.navigate(['/']);
        $(".lean-overlay").remove();
      }
    });
  }

  closeModal() {
    $(".lean-overlay").remove();
    this.router.navigate(['../']);
    this.windowRef.nativeWindow.closeModal('modalGetAPIKey');

    if (localStorage.getItem("apiId") != null && localStorage.getItem("apiKey") != null
    && localStorage.getItem("apiId") != "" && localStorage.getItem("apiKey") != "") {
      $("#apiCredBox").css("visibility", "visible");
      $("#apiCredBox").css("height", "inherit");
      $("#apiKeyText").text(localStorage.getItem("apiKey"));
      $("#apiIdText").text(localStorage.getItem("apiId"));

      $("#getKeyButton").css("visibility", "collapse");
      $("#getKeyButton").css("height", "0");

      $("#getKeyButtonTop").css("visibility", "collapse");
      $("#getKeyButtonTop").css("height", "0");
    }

  }

  submitState(f:NgForm) {
    var name = f.value.name;
    if (name == "") {
      $('#name').addClass("invalid");
      $('#nameLabel').addClass("active");
      return false;
    }

    var that = this;
    this.windowRef.nativeWindow.startLoadingCursor();

    this.create(name)
      .then(res => {
        that.windowRef.nativeWindow.stopLoadingCursor();
        if (res.id != null) {
          this.closeModal();
          localStorage.setItem("apiId", res.id);
          localStorage.setItem("apiKey", res.value);
          that.router.navigate(['/']);
          $(".lean-overlay").remove();
        }
      });
  }

  create(name:string):Promise<any> {
    var state = this.appState.get("apiUrl");
    var headers = new Headers({'Content-Type': 'application/json'});

    var obj = {
      userId: JSON.parse(localStorage.getItem("camera51-login")).userId,
      userToken: JSON.parse(localStorage.getItem("camera51-login")).userToken,
      customerName: name
    };

    return this.http

      .post(state.apiURL + "/createApiCustomer", JSON.stringify(obj), {
        headers: headers
      })
      .toPromise()
      .then(res => res.json())
      .catch(CreateCustomer.handleError);
  }

  private static handleError(error:any):Promise<any> {
    console.log('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
