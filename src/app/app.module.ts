import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

/** Angular Routing */
import { AppRoutingModule } from './app-routing.module';

/** Http Client */
import { HttpClientModule } from '@angular/common/http';
/** QRCode */
import { QrCodeModule } from 'ng-qrcode';

/** Components */
import { AppComponent } from './app.component';
import { SigninComponent } from './signin/signin.component';
import { OperationsComponent } from './operations/operations.component';

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    OperationsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    QrCodeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
