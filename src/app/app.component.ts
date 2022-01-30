import { Component, OnInit } from '@angular/core';

/** Router */
import { Router } from "@angular/router"

/** FingerPrint */
import FingerprintJS from '@fingerprintjs/fingerprintjs'

/** Hive Authentication Client (HAC) */
import { HiveAuthClient, hacGetAccounts } from '@mintrawa/hive-auth-client';
// import { HiveAuthClient, hacGetAccounts } from '../assets/lib';

import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  hasServer = ["wss://has.mintrawa.com", "wss://hive-auth.arcange.eu"];

  constructor(
    private appService: AppService,
    private router: Router
  ) { }

  ngOnInit(): void {
    /**
     * Hive Authentication Client
     * 
     * Use fingerprint to generate the hac pwd for encryption
     * store it in sessionStorage
     * 
     */
    const fpPromise = FingerprintJS.load({ monitoring: false });
    fpPromise
    .then(fp => fp.get())
    .then(result => {
      sessionStorage.setItem("hacPwd", result.visitorId);
      const current = localStorage.getItem('current');
      
      /** If returning */
      if(current) {
        let hacAccount = hacGetAccounts(current, result.visitorId);
        /** We found the account in storage */
        if(hacAccount[0]) {
          console.log("|> HAC account |>", hacAccount[0]);

          const has_expire = hacAccount[0].has?.has_expire
          const expire = has_expire ? new Date(has_expire) : 1;
          console.log("|> expire |>", expire);

          /** emit username */
          this.appService.emitUserLogin(current);
          
          /** Initialize the HIVE auth client */
          HiveAuthClient(hacAccount[0].has ? [hacAccount[0].has.has_server] : undefined, { debug: true, delay: 500 });

          /** Routing to operation page */
          this.router.navigate(['/operations']);
        } else {
          /** Delete current */
          localStorage.removeItem('current');
          
          /** Initialize the HIVE auth client */
          HiveAuthClient(undefined, { debug: true, delay: 500 });
        }
      } else {
        HiveAuthClient(undefined, { debug: true, delay: 500 });
      }
    }).catch(e => console.error(e));
  }
}
