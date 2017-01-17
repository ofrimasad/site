import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {WindowRef} from "../WindowRef";


@Component({
  selector: 'paymentreceived',
  styles: [`
  `],
  template: `
   
  `
})
export class Paymentreceived {
  localState: any;
  constructor(public route: ActivatedRoute, private windowRef: WindowRef) {

    this.windowRef.nativeWindow.waitForSQS = true;
    this.windowRef.nativeWindow.camera51WithQueue.startSQS() ;
    this.windowRef.nativeWindow.ga('set', 'page', '/paymentreceived');
    this.windowRef.nativeWindow.ga('send', 'pageview');
  }



}
