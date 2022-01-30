import { Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

/** Router */
import { Router } from "@angular/router";

/** HttpClient */
import { HttpClient } from '@angular/common/http';

/** HIVE auth client */
import { 
  hacMsg, hasGetConnectionStatus, hacGetAccounts,
  hacFollowing, hacManualTransaction, hacVote, hacWitnessVote, 
  hacTransfer, hacTransferToVesting, hacWithdrawVesting, hacDelegation, hacConvert
} from '@mintrawa/hive-auth-client';
// import { 
//   hacMsg, hasGetConnectionStatus, hacGetAccounts,
//   hacFollowing, hacManualTransaction, hacVote, hacWitnessVote, 
//   hacTransfer, hacTransferToVesting, hacWithdrawVesting, hacDelegation, hacConvert
// } from '../../assets/lib';

export interface DialogData {
  username?: string;
  users: ReturnType <typeof hacGetAccounts>;
}

import { AppService } from '../app.service';
import { Subscription } from 'rxjs';

/** Account switcher */
@Component({
  selector: 'operation-dialog',
  templateUrl: 'operation-dialog.component.html',
  styleUrls: ['./operations.component.scss']
})
export class DialogOperationsDialog {
  constructor(
    public dialogRef: MatDialogRef<DialogOperationsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  switch(account: ReturnType <typeof hacGetAccounts>): void {
    this.dialogRef.close(account);
  }

  onNoClick(): void {
    this.dialogRef.close('NEW');
  }
}

@Component({
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.scss']
})
export class OperationsComponent implements OnInit, OnDestroy {
  /** User */
  userSubscription?: Subscription;
  username?: string

  hacSubscription?: any;

  trx?: any

  total_vesting_fund_hive:number = 0
  total_vesting_shares:number = 0

  opeLoader: string = "none"
  opeLoaderHas: string = "none"

  hasExpireDelay = 100;
  hasExpireDelayInterval!: ReturnType<typeof setInterval>;

  constructor(
    private appService: AppService,
    public dialog: MatDialog,

    private http: HttpClient,
    private ref: ChangeDetectorRef,
    private router: Router,
    private zone: NgZone
  ) {}

  /** Open the Account switcher */
  openDialog(): void {
    const data: DialogData = {
      username: this.username,
      users: hacGetAccounts()
    }

    const dialogRef = this.dialog.open(DialogOperationsDialog, { width: '250px', data });

    /** Result of Account switcher */
    dialogRef.afterClosed().subscribe((result: ReturnType <typeof hacGetAccounts>|"NEW"|undefined) => {
      /** Choose to switch to an account */
      if(result) {
        /** Click on New */  
        if(result === "NEW") {
          localStorage.removeItem("current")
          this.username = undefined;
          this.appService.emitUserLogin(this.username);
          this.router.navigate(['/']);

        /** Switch account */  
        } else {
          const hacPwd = sessionStorage.getItem("hacPwd");
          if(!hacPwd) throw new Error("No HAC password defined!");
          const a = hacGetAccounts(result[0].account, hacPwd);
          if(!a) throw new Error("user not found!");
  
          localStorage.setItem("current", result[0].account)
          this.username = result[0].account;
          this.appService.emitUserLogin(this.username);
        }
      }
    });
  }

  convertPOWERtoVEST(POWER: number): string {
    /** Value Per MVESTS */
    const valuePerMVESTS = ((this.total_vesting_fund_hive / this.total_vesting_shares))
    console.log(POWER, " HP","valuePerMVESTS = ", valuePerMVESTS)
    const VESTS = POWER && POWER > 0 ? ( POWER / valuePerMVESTS) : 0

    console.log("VERIF => POWER = ", Math.ceil((VESTS * valuePerMVESTS)* 1000)/1000)

    return VESTS.toFixed(6)
  }

  /**
   * 
   * OPERATIONS
   * 
   */
  manualTransaction(): void {
    this.opeLoader = 'manualTransaction'
    this.trx = null
    hacManualTransaction("active", [ "claim_account", { fee: "0.000 HIVE", creator: this.username, extensions: [] } ])
  }

  follow(account: string, follow: boolean): void {
    this.opeLoader = 'follow'
    this.trx = null
    hacFollowing(account, follow)
  }

  vote(author: string, permlink: string, weight: string, downvote: boolean): void {
    this.opeLoader = 'vote'
    this.trx = null
    hacVote(author, permlink, downvote ? parseInt(weight) * -1 : parseInt(weight))
  }

  voteWitness(witness: string, approve: boolean): void {
    this.opeLoader = 'voteWitness'
    this.trx = null
    hacWitnessVote(witness, approve)
  }

  transfer(to: string, amount: string, currency: string, memo: string): void {
    this.opeLoader = 'transfer'
    hacTransfer(to, amount, currency as "HIVE"|"HBD", memo)
  }

  transferToVesting(to: string, amount: string): void {
    this.opeLoader = 'transferToVesting'
    hacTransferToVesting(to, amount)
  }

  withdrawVesting(HIVE: string): void {
    this.opeLoader = 'withdrawVesting'
    const VESTS = this.convertPOWERtoVEST(parseInt(HIVE))
    hacWithdrawVesting(VESTS+' VESTS')
  }

  convert(amount: string, currency: string): void {
    this.opeLoader = 'convert'
    hacConvert(amount, currency as "HIVE"|"HBD")
  }

  delegation(delegatee: string, HIVE: string): void {
    this.opeLoader = 'delegation';
    const VESTS = this.convertPOWERtoVEST(parseInt(HIVE));
    hacDelegation(delegatee, VESTS+' VESTS');
  }

  logout(u: string): void {
    this.username = undefined;
    this.appService.emitUserLogout(u);

    /** Navigate to operations page (use ngZone because of Keychain) */
    this.zone.run(()=> {
      this.router.navigate(['/']);
    });
  }

  ngOnInit(): void {
    /** Previous connexion */
    if(!this.appService.username) {
      const current = localStorage.getItem("current");
      if(current) {
        this.username = current;
        this.appService.emitUserLogin(current);
      } else {
        this.router.navigate(['/']);
      }
    } else {
      this.username = this.appService.username;
    }

    /** Received user update */
    this.userSubscription = this.appService.userSubject.subscribe(user => { 
      this.username = user; 
      console.log("|> HAC subject |>", user);
    });

    /** HAC Subscription */
    this.hacSubscription = hacMsg.subscribe(m => {
      /** HAC => Received sign_wait */
      if(m.type === "sign_wait") {
        console.log('%c|> HAC Sign wait |>', 'color: goldenrod', m.msg? m.msg.uuid : null);

        /** expire Delay Timer */
        this.opeLoaderHas = this.opeLoader;

        this.hasExpireDelayInterval = setInterval(() => {
          this.hasExpireDelay -= 1;
          if(this.hasExpireDelay === 0) {
            clearInterval(this.hasExpireDelayInterval);
            
            this.opeLoader = 'none';
            this.opeLoaderHas = 'none';
            this.hasExpireDelay = 100;
          }
        }, 1000);
      }

      /** HAC => Received sign_result */
      if(m.type === "tx_result") {
        this.opeLoader = 'none';
        this.opeLoaderHas = 'none';
        this.hasExpireDelay = 100;

        console.log('%c|> HAC Sign result |>', 'color: goldenrod', m.msg? m.msg : null);
        const data: any = m.msg?.data;
        const txt = data && typeof(data) === "string" ? " | " + data : data && data.id ? " | " + data.id : "";
        const al = `${ m.msg?.status } | ${ m.msg?.uuid ? m.msg?.uuid : "" } ${ txt }`;
        window.alert(al);
        this.trx = m.msg?.status;
        this.ref.detectChanges();
      }
    })

    this.http.post("https://api.openhive.network", { "jsonrpc":"2.0", "method": "condenser_api.get_dynamic_global_properties", "params": [], "id":1 }, { "headers": { "Content-Type":  "application/json" }}).subscribe((data:any) => {
      console.log("|> Hive Get properties |>", data)
      if(data && data.result) {
        this.total_vesting_fund_hive = data.result.total_vesting_fund_hive.replace(' HIVE','')
        this.total_vesting_shares    = data.result.total_vesting_shares.replace(' VESTS','')
      }
    })

    setTimeout(() => {
      console.log('%c|> HAC status |>', 'color: goldenrod', hasGetConnectionStatus())
    }, 3000);
  }

  ngOnDestroy(): void { 
    if(this.hacSubscription) this.hacSubscription.unsubscribe();
    if(this.userSubscription) this.userSubscription.unsubscribe();
  }

}
