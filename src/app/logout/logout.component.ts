import { Component } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {WindowRef} from "../WindowRef";
/*
 * We're loading this component asynchronously
 * We are using some magic with es6-promise-loader that will wrap the module with a Promise
 * see https://github.com/gdi2290/es6-promise-loader for more info
 */


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
    localStorage.setItem('camera51-login','');
    this.router.navigate(['/']);
    location.reload();

    this.route
      .data
      .subscribe((data: any) => {
        // your resolved data from route
        this.localState = data.yourData;
      });
  }


}
