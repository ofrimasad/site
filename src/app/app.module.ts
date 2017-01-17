import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ROUTES } from './app.routes';
// App is our top level component
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState, InteralStateType } from './app.service';
import { Home } from './home';
import { Shopify } from './shopify';
import { Logout } from './logout';
import { Login } from './login';
import { Plans } from './plans';
import { Paymentreceived } from './paymentreceived';
import { Yourinfo } from './yourinfo';
import { Register } from './register';
import { Forgotpassword } from './forgotpassword';
import { Changepassword } from './changepassword';
import { UserService } from './user.service';
import { ProductsService } from './shopify/products.service';
import { Contactus } from './contactus';

import { NoContent } from './no-content';
import { XLarge } from './home/x-large';
import { WindowRef } from './WindowRef';
import {PlansService} from "./plans/plans.service";
import {TakefirstPipe} from "./plans/takefirst";
import {InvoiceService} from "./yourinfo/invoice.service";
import {SubscriptionService} from "./yourinfo/subscription.service";
import {UserstateService} from "./userstate.service";
import {Yourinfoshopify} from "./shopify/yourinfo-shopify";
import {PlansComponentService} from "./shopify/mission.service";
import {Shopifyconfirmation} from "./shopify/confirmation/confirmation.component";
import {Rateusshopify} from "./shopify/rateusshopify";

//
//
// // Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState,UserService, PlansService, InvoiceService, SubscriptionService, ProductsService,
  UserstateService, PlansComponentService
];
//
// type StoreType = {
//   state: InteralStateType,
//   restoreInputValues: () => void,
//   disposeOldHosts: () => void
// };

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    AppComponent,
    Home,
    Forgotpassword,
    Changepassword,
    Login,Logout,
    Plans,
    Paymentreceived,
    Yourinfo,
    Register,
    NoContent,
      Contactus,Yourinfoshopify, Shopifyconfirmation,
    XLarge, TakefirstPipe,Shopify, Rateusshopify
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES, { useHash: true })
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection

    APP_PROVIDERS,
  WindowRef

]
})
export class AppModule { }

// export class AppModule {
//   constructor(public appRef: ApplicationRef, public appState: AppState) {}
//
//   hmrOnInit(store: StoreType) {
//     if (!store || !store.state) return;
//     console.log('HMR store', JSON.stringify(store, null, 2));
//     // set state
//     this.appState._state = store.state;
//     // set input values
//     if ('restoreInputValues' in store) {
//       let restoreInputValues = store.restoreInputValues;
//       setTimeout(restoreInputValues);
//     }
//
//     this.appRef.tick();
//     delete store.state;
//     delete store.restoreInputValues;
//   }
//
//   hmrOnDestroy(store: StoreType) {
//     const cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
//     // save state
//     const state = this.appState._state;
//     store.state = state;
//     // recreate root elements
//     store.disposeOldHosts = createNewHosts(cmpLocation);
//     // save input values
//     store.restoreInputValues  = createInputTransfer();
//     // remove styles
//     removeNgStyles();
//   }
//
//   hmrAfterDestroy(store: StoreType) {
//     // display new elements
//     store.disposeOldHosts();
//     delete store.disposeOldHosts;
//   }
//
// }

