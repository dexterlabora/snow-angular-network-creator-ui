import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { APP_BASE_HREF, Location } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { SnowInterceptor } from './services/snow.interceptor';
import { MerakiService } from './services/meraki.service';
import { MessageService } from './services/message.service';
import { GlideService } from './services/glide.service';

import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { HomeComponent } from './home/home.component';
import { ClaimComponent } from './claim/claim.component';


// Table components
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { MessagesComponent } from './messages/messages.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'claim/:orgId/:netId', component: ClaimComponent }, 
  { path: '404', component: NotFoundComponent },
  { path: '*', redirectTo: '404' },
  { path: '**', redirectTo: '404' }
];


@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    HomeComponent,
    ClaimComponent,
    MessagesComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes, { useHash: true }),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxDatatableModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: SnowInterceptor, multi: true },
    { provide: APP_BASE_HREF, useValue: '/' },
    MerakiService,
    MessageService,
    GlideService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
