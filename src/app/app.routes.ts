import { Routes, RouterModule } from '@angular/router';
import { Home } from './home';

import { Login } from './login';
import { CreateCustomer } from './createCustomer';
import { Yourinfo } from './yourinfo';
import { Register } from './register';
import { Paymentreceived } from './paymentreceived';
import { Plans } from './plans';
import { Contactus } from './contactus';
import { Forgotpassword } from './forgotpassword';
import { Changepassword } from './changepassword';

import { NoContent } from './no-content';

import { DataResolver } from './app.resolver';
import {Logout} from "./logout/logout.component";
import {Shopify} from "./shopify";
import {Bigcommerce} from "./bigcommerce";


export const ROUTES: Routes = [
  { path: '',      component: Home },
  { path: 'home',  component: Home },
  { path: 'shopify/:userId/:userToken',  component: Shopify },
  { path: 'shopify/:userId/:userToken/:shop',  component: Shopify },
  { path: 'bigcommerce/:userId/:userToken',  component: Bigcommerce },
  { path: 'bigcommerce/:userId/:userToken/stores/:storeHash',  component: Bigcommerce },
  { path: 'login',  component: Login },
  { path: 'createCustomer',  component: CreateCustomer },
  { path: 'yourinfo',  component: Yourinfo },

  { path: 'paymentreceived', component: Paymentreceived },
  { path: 'logout', component: Logout },
  { path: 'register', component: Register },
  { path: 'plans', component: Plans },
  { path: 'plans/:notenough', component: Plans },
  { path: 'contactus', component: Contactus },
  { path: 'forgotpassword', component: Forgotpassword },
  { path: 'changepassword', component: Changepassword },

  { path: 'changepassword/:id/:token', component: Changepassword }

];
