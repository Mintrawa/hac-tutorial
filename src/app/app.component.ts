import { Component, OnInit } from '@angular/core';

/** Hive Authentication Client (HAC) */
import { HiveAuthClient, hacGetAccounts } from '@mintrawa/hive-auth-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  hasServer = ["wss://has.mintrawa.com", "wss://hive-auth.arcange.eu"]

  ngOnInit(): void {
    const pwd      = localStorage.getItem("pwd")
    const username = localStorage.getItem("username")

    /** Check previous */
    let hacAccount: ReturnType<typeof hacGetAccounts> = []
    if(username && pwd) hacAccount = hacGetAccounts(username, pwd)
    if(hacAccount[0]) {
      console.log('%cHAC Account', 'color: goldenrod', hacAccount[0])
      if(hacAccount[0].has) this.hasServer = [ hacAccount[0].has.has_server ]
      /** Initialize the HIVE auth client */
      HiveAuthClient(this.hasServer, { debug: true, delay: 200 }) 
    } else {
      /** Initialize the HIVE auth client */
      HiveAuthClient(this.hasServer, { debug: true, delay: 200 })
    }
  }
}
