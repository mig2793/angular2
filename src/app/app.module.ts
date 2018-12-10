import { BrowserModule } from '@angular/platform-browser';
import { NgModule,enableProdMode } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './/app-routing.module';
import { ClickOutsideModule } from 'ng-click-outside';
import { FilterPipePipe } from './filter-pipe.pipe';

import { AppComponent } from './app/app.component';
import { CoordinadoresComponent } from './coordinadores/coordinadores.component';
import { LoginComponent } from './login/login.component';
import { MenuComponent } from './menu/menu.component';
import { StatsComponent } from './stats/stats.component';

import { InterceptService } from './utils/intercept.service';
import { SortPipe } from './sort.pipe';

enableProdMode();
@NgModule({
  declarations: [
    AppComponent,
    CoordinadoresComponent,
    LoginComponent,
    MenuComponent,
    StatsComponent,
    FilterPipePipe,
    SortPipe
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule, 
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    NgbModule.forRoot(),
    ClickOutsideModule,
    FormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: InterceptService, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
