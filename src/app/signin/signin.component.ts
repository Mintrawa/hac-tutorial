import { Component, OnDestroy, OnInit } from '@angular/core';

/** Router */
import { Router } from "@angular/router"

/** HIVE auth client */
import { hacMsg, hacUserAuth, hasGetConnectionStatus, hacGetAccounts } from '@mintrawa/hive-auth-client';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit, OnDestroy {
  loader = false;
  qrHAS: string | undefined;
  username?: string;
  connected?: string;
  hacAccount!: ReturnType<typeof hacGetAccounts>;
  pwd = '520c5c9b-bd58-4253-850a-1fa591a2dabd';

  constructor(private router: Router) { }

  connect(username: string, hacModule:"HAS"|"KBE"): void {
    this.loader = true;
    this.username = username;

    hacUserAuth(
      username,
      { name: 'HACtutorial' },
      this.pwd,
      { key_type: 'active', value: 'MyCha11en6e' },
      hacModule === "KBE" ? "keychain" : "has"
    );
  }

  ngOnInit(): void {
    /** Previous */
    const username = localStorage.getItem("username")
    if(username) this.username = username

    if(username && this.pwd) this.hacAccount = hacGetAccounts(username, this.pwd)
    if(this.hacAccount && this.hacAccount[0]) {
      console.log('%cHAC Account', 'color: goldenrod', this.hacAccount[0].account)
      this.connected = this.hacAccount[0].has ? "via token HAS" : "via Keychain"
    }

    /** Subscription */
    hacMsg.subscribe((m) => {
      /** Received auth_wait => generate the qrCode */
      if (m.type === 'qr_code') {
        /** QRcode data */
        this.qrHAS = (m as any).msg;
      }

      /** Received authentication msg */
      if (m.type === 'authentication') {
        console.log('%cauthentication msg =>', 'color: goldenrod', m)
        if (m.msg?.status === "authentified") {
          this.loader = false;
          this.qrHAS = undefined;
          localStorage.setItem('username', this.username!);
          this.connected = m.msg?.data?.challenge.slice(0, 12) + '...';
          this.router.navigate(['/operations'])
        } else if (m.msg?.status === "rejected") {
          this.loader = false;
          this.qrHAS = undefined;
          window.alert(`${ m.msg.data?.challenge }`);
        } else {
          this.loader = false;
          this.qrHAS = undefined;
          window.alert(`${ m.error?.msg }`);
        }
      }
    });
  }

  ngOnDestroy(): void { 
    // hacMsg.unsubscribe(); 
  }
}
