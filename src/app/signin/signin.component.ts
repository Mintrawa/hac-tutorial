import { Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';

/** Router */
import { Router } from "@angular/router"

/** HIVE auth client */
import { hacMsg, hacUserAuth } from '@mintrawa/hive-auth-client';
// import { hacMsg, hacUserAuth } from '../../assets/lib';

import { AppService } from '../app.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit, OnDestroy {
  username = localStorage.getItem('current');

  hacSubscription?: any;

  loader = false;
  qrHAS: string | undefined;

  hasLoader = false;
  hasExpireDelay = 100;
  hasExpireDelayInterval!: ReturnType<typeof setInterval>;
  
  constructor(
    private appService: AppService,

    private ref: ChangeDetectorRef,
    private router: Router,
    private zone: NgZone
  ) { }

  connect(username: string, hacModule:"HAS"|"KBE"): void {
    const hacPwd = sessionStorage.getItem("hacPwd");
    if(!hacPwd) throw new Error("No HAC password defined!");

    this.loader   = true;
    this.username = username;

    hacUserAuth(
      username,
      { name: 'HACtutorial' },
      hacPwd,
      { key_type: 'active', value: 'MyCha11en6e' },
      hacModule === "KBE" ? "keychain" : "has"
    );
  }

  ngOnInit(): void {
    /** Subscription */
    this.hacSubscription = hacMsg.subscribe((m) => {

      /** Received auth_wait => generate the qrCode */
      if (m.type === 'qr_code') {
        /** QRcode data */
        this.qrHAS = (m as any).msg;

        /** expire Delay Timer */
        this.hasLoader = true;
        this.hasExpireDelayInterval = setInterval(() => {
          this.hasExpireDelay -= 1;
          if(this.hasExpireDelay === 0) {
            clearInterval(this.hasExpireDelayInterval);
            
            this.qrHAS = undefined;
            this.loader = false;
            this.hasLoader = false;
            this.hasExpireDelay = 100;
          }
        }, 1000);
      }

      /** Received authentication msg */
      if (m.type === 'authentication') {
        console.log('%c|> HAC authentication msg |>', 'color: goldenrod', m);

        this.hasLoader = false;
        this.hasExpireDelay = 100;

        /** Authentication approved */
        if (m.msg?.status === "authentified") {
          this.loader = false;
          this.qrHAS = undefined;

          localStorage.setItem('current', this.username!);

          /** emit username */
          this.appService.emitUserLogin(this.username!);

          /** Navigate to operations page (use ngZone because of Keychain) */
          this.zone.run(()=> {
            this.router.navigate(['/operations']);
          });

        /** Authentication rejected */
        } else if (m.msg?.status === "rejected") {
          this.loader = false;
          this.qrHAS = undefined;
          window.alert(`${ m.msg.data?.challenge }`);

          /** Force update DOM for Keychain extension */
          this.ref.detectChanges();

        /** Authentication error */
        } else {
          this.loader = false;
          this.qrHAS = undefined;
          window.alert(`${ m.error?.msg }`);

          /** Force update DOM for Keychain extension */
          this.ref.detectChanges();
        }
      }
    });
  }

  ngOnDestroy(): void { 
    this.hacSubscription.unsubscribe(); 
  }
}
