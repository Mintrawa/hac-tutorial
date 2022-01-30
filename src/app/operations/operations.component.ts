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

export interface DialogData {
  username?: string;
  users: ReturnType <typeof hacGetAccounts>;
}

import { AppService } from '../app.service';
import { Subscription } from 'rxjs';

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
    this.dialogRef.close();
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

  constructor(
    private appService: AppService,
    public dialog: MatDialog,

    private http: HttpClient,
    private ref: ChangeDetectorRef,
    private router: Router,
    private zone: NgZone
  ) {}

  openDialog(): void {
    const data: DialogData = {
      username: this.username,
      users: hacGetAccounts()
    }

    const dialogRef = this.dialog.open(DialogOperationsDialog, { width: '250px', data });

    dialogRef.afterClosed().subscribe((result: ReturnType <typeof hacGetAccounts>|undefined) => {
      if(result) {
        localStorage.setItem("current", result[0].account)
        this.username = result[0].account;
        this.appService.emitUserLogin(this.username);
      } else {
        localStorage.removeItem("current")
        this.username = undefined;
        this.appService.emitUserLogin(this.username);
        this.router.navigate(['/']);
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
    this.opeLoader = 'delegation'
    const VESTS = this.convertPOWERtoVEST(parseInt(HIVE))
    hacDelegation(delegatee, VESTS+' VESTS')
  }

  logout(u: string): void {
    this.appService.emitUserLogout(u);

    /** Navigate to operations page (use ngZone because of Keychain) */
    this.zone.run(()=> {
      this.router.navigate(['/']);
    });
  }

  ngOnInit(): void {
    if(!this.appService.username) {
      const current = localStorage.getItem("current");
      if(current) {
        this.username = current;
        this.appService.emitUserLogin(current);
      } else {
        this.router.navigate(['/']);
      }
    }

    this.userSubscription = this.appService.userSubject.subscribe(user => { 
      this.username = user; 
      console.log("userSubject", user);
    });

    this.hacSubscription = hacMsg.subscribe(m => {
      /** HAC => Received sign_wait */
      if(m.type === "sign_wait") {
        console.log('%cReceived sign_wait =>', 'color: goldenrod', m.msg? m.msg.uuid : null)
      }

      /** HAC => Received sign_result */
      if(m.type === "tx_result") {
        this.opeLoader = 'none'

        console.log('%cReceived sign_result =>', 'color: goldenrod', m.msg? m.msg : null)
        const data: any = m.msg?.data
        const txt = data && typeof(data) === "string" ? " | " + data : data && data.id ? " | " + data.id : ""
        const al = `${ m.msg?.status } | ${ m.msg?.uuid ? m.msg?.uuid : "" } ${ txt }`
        window.alert(al)
        this.trx = m.msg?.status
        this.ref.detectChanges()
      }
    })

    this.http.post("https://api.openhive.network", { "jsonrpc":"2.0", "method": "condenser_api.get_dynamic_global_properties", "params": [], "id":1 }, { "headers": { "Content-Type":  "application/json" }}).subscribe((data:any) => {
      console.log(" DATA => ", data)
      if(data && data.result) {
        this.total_vesting_fund_hive = data.result.total_vesting_fund_hive.replace(' HIVE','')
        this.total_vesting_shares    = data.result.total_vesting_shares.replace(' VESTS','')
      }
    })

    setTimeout(() => {
      console.log('%cHAS Status', 'color: goldenrod', hasGetConnectionStatus())
    }, 3000);
  }

  ngOnDestroy(): void { 
    if(this.hacSubscription) this.hacSubscription.unsubscribe();
    if(this.userSubscription) this.userSubscription.unsubscribe();
  }

}
