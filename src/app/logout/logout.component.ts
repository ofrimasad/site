import { Component } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {WindowRef} from "../WindowRef";

@Component({
  selector: 'logout',
  styles: [``],
  template: ``
})
export class Logout {
  localState: any;
  constructor(public route: ActivatedRoute, private router: Router, private windowRef: WindowRef) {

  }

  ngOnInit() {
    this.windowRef.nativeWindow.ga('set', { page:'/logout',title:'Logout'});
    this.windowRef.nativeWindow.ga('send', 'pageview');
    this.router.navigate(['/']);

    try {
      localStorage.setItem('camera51-login','');

    } catch (e){

    }

    setTimeout(function () {
      location.reload(true)
    }, 200);
  }
}
