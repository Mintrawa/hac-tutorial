import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/** Angular Routing */
import { AppRoutingModule } from './app-routing.module';

/** Http Client */
import { HttpClientModule } from '@angular/common/http';

/** QRCode */
import { QrCodeModule } from 'ng-qrcode';

/** Material */
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatToolbarModule} from '@angular/material/toolbar';

/** Form */
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

/** Components */
import { AppComponent } from './app.component';
import { SigninComponent } from './signin/signin.component';
import { OperationsComponent, DialogOperationsDialog } from './operations/operations.component';


@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    OperationsComponent,
    DialogOperationsDialog
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    QrCodeModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
    MatToolbarModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
