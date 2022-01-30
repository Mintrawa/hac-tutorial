import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { hacRemoveAccount } from '@mintrawa/hive-auth-client';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public username?: string;
  userSubject = new Subject<string|undefined>();

  constructor(private router: Router){}

  public emitUserLogin(u: string|undefined) {
    this.userSubject.next(u);
  }

  public emitUserLogout(u: string): void {
    const hacPwd = sessionStorage.getItem("hacPwd");

    /** delete current from localStorage */
    localStorage.removeItem('current');

    /** delete user from HAC */
    // hacRemoveAccount(u);

    /** empty user */
    this.username = undefined;
    this.userSubject.next(this.username);

    /** redirect to root app */
    this.router.navigate(['/']);
  }
}
