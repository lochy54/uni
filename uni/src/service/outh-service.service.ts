import { Injectable, signal } from '@angular/core';
import { ErrorServiceService } from './error-service.service';
import { ApiServiceService, login, user } from './api-service.service';
import { catchError, map, Observable, of, ReplaySubject, tap, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})



export class OuthServiceService implements CanActivate {
  private _username : ReplaySubject< string | undefined> = new ReplaySubject(1)

  get username() : Observable<string | undefined> {
    return this._username.asObservable();
  }

  
  constructor(private router : Router, private apiService : ApiServiceService) {}


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    this.apiService.chekToken().subscribe({
      next : (value) => {
        if(value){
          this._username.next(value)
        }
      } 
  })
  return true
}


  logOut(){
      localStorage.removeItem("token")
      this._username.next(undefined)
}


  login(l: login) {
    return this.apiService.login(l).pipe(
      tap(value => {
        localStorage.setItem("token", value);
        this._username.next(l.username)
      })
    );
  }

  register(u:user) {
    return this.apiService.register(u).pipe(
      tap(value => {
        localStorage.setItem("token", value);
        this._username.next(u.username)
      })
    );
  }

}
