import {Component, ElementRef, Input, Output, EventEmitter} from '@angular/core';

import { AppState } from '../../app.service';
import {WindowRef} from "../../WindowRef";
import {UserstateService} from "../../userstate.service";

@Component({
  selector: 'bigcommerceconfirmation',
  styleUrls: [ '../bigcommerce.style.css' ],
  templateUrl: 'confirmation.template.html',

})
export class Bigcommerceconfirmation {
  private product;
  private noshowagain:boolean = false;

  @Output() confirmReplace = new EventEmitter<boolean>();

  // TypeScript public modifiers
  constructor(public appState: AppState, private windowRef: WindowRef,
               private userState:UserstateService) {

  }


  currentReplaceProduct(product){
    if(product == null || product == "null"){

      return;
    } else {
      this.product = product;
      this.openModal();
    }
  }

  checkBoxChange(ev){
    this.noshowagain = ev.currentTarget.checked;
  }

  onSave(ev){
    if(ev == true) {
      if(this.noshowagain == true){
        this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce confirmation dont show again',"shop="+this.appState.get("userShop"));
        this.userState.set("bigcommerce-replace-warning-show", false);
        this.userState.uploadState();
      }

      this.confirmReplace.emit(this.product);
    }
    this.closeModal();
  }

  closeModal(){
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce cancel replace image confirmation',"shop="+this.appState.get("userShop"));
    this.windowRef.nativeWindow.closeModal('modal-bigcommerce-confirmation');
  }

  openModal(){
    this.windowRef.nativeWindow.ga('set', 'page', '/bigcommerce/imagereplace/confirmation');
    this.windowRef.nativeWindow.ga('send', 'pageview');
    this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'bigcommerce open replace image confirmation',"shop="+this.appState.get("userShop"));
    this.windowRef.nativeWindow.openModal('modal-bigcommerce-confirmation');
  }

}




