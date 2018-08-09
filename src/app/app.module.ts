import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app/app.component';
import { CoordinadoresComponent } from './coordinadores/coordinadores.component';
import { LoginComponent } from './login/login.component';
import { MenuComponent } from './menu/menu.component';
import { AppRoutingModule } from './/app-routing.module';
import { StatesComponent } from './states/states.component';
import { PropertiesComponent } from './properties/properties.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {HttpModule} from '@angular/http';


@NgModule({
  declarations: [
    AppComponent,
    CoordinadoresComponent,
    LoginComponent,
    MenuComponent,
    StatesComponent,
    PropertiesComponent
  ],
  imports: [
    BrowserModule, 
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
