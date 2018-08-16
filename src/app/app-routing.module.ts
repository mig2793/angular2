import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {LoginComponent} from "./login/login.component";
import {MenuComponent} from "./menu/menu.component";
import {CoordinadoresComponent} from "./coordinadores/coordinadores.component";
import {StatesComponent} from "./states/states.component";
import {PropertiesComponent} from "./properties/properties.component";

const routes: Routes = [
	{
		path: 'login', 
		component:LoginComponent
	},
	{
		path: 'menu', 
		component:MenuComponent,
    	children: [
      		{
      			path: '', pathMatch:'full', 
      			redirectTo: 'coordinadores'
      		}, 
      		{
      			path: 'coordinadores', 
      			component: CoordinadoresComponent
      		},
      		{
      			path: 'states', 
      			component: StatesComponent
      		},
      		{
      			path: 'properties', 
      			component: StatesComponent
      		},
			{
				path: '**', 
				pathMatch:'full', 
				redirectTo:'coordinadores'
			}
    	]
  	},
	{
		path: '**', 
		pathMatch:'full', 
		redirectTo:'login'
	}
]

@NgModule({
  imports: [ RouterModule.forRoot(routes,{useHash:true}) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule { }
