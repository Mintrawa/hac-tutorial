import { Component, OnDestroy, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

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

@Component({
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush // add this
})
export class OperationsComponent implements OnInit {
  trx?: any
  username?: string
  hacAccount!: ReturnType<typeof hacGetAccounts>;
  pwd = '520c5c9b-bd58-4253-850a-1fa591a2dabd';

  total_vesting_fund_hive:number = 0
  total_vesting_shares:number = 0

  opeLoader: string = "none"

  constructor(
    private router: Router,
    private http: HttpClient,
    private ref: ChangeDetectorRef
  ) {}

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

  ngOnInit(): void {
    /** Previous */
    const username = localStorage.getItem("username")
    if(!username) this.router.navigate(['/sign'])
    if(username) this.username = username

    if(username && this.pwd) this.hacAccount = hacGetAccounts(username, this.pwd)
    if(this.hacAccount && this.hacAccount[0]) {
      console.log('%cHAC Account', 'color: goldenrod', this.hacAccount[0].account)
    }

    hacMsg.subscribe(m => {
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
    }, 2000);
  }

  ngOnDestroy(): void { 
    // hacMsg.unsubscribe(); 
  }

}
