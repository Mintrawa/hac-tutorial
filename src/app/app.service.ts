import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/** HIVE auth client */
import { hacRemoveAccount } from '@mintrawa/hive-auth-client';
// import { hacRemoveAccount } from '../assets/lib';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public username?: string;
  userSubject = new Subject<string|undefined>();

  public emitUserLogin(u: string|undefined) {
    this.username = u;
    this.userSubject.next(u);

    console.log("|> HAC AppService emitUserLogin |>", this.username);
  }

  public emitUserLogout(u: string): void {
    console.log("|> HAC AppService emitUserLogout |>", u);

    /** delete current from localStorage */
    localStorage.removeItem('current');

    /** delete user from HAC */
    hacRemoveAccount(u);

    /** empty user */
    this.username = undefined;
    this.userSubject.next(this.username);
  }
}
