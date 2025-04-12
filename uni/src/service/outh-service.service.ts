import { inject, Injectable, signal } from '@angular/core';
import { ApiServiceService, login, user} from './api-service.service';
import { catchError, map, Observable, of, ReplaySubject, tap, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})



export class OuthServiceService implements CanActivate {
  private readonly _username : ReplaySubject< string | undefined> = new ReplaySubject(1)
  private readonly router = inject(Router)
  private readonly apiService = inject(ApiServiceService)
  get username() : Observable<string | undefined> {
    return this._username.asObservable();
  }

  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let username : string|undefined 
    this._username.subscribe((val)=>username = val)
    if(username){
        this._username.next(username)
        return true
    }
    return this.apiService.chekToken().pipe(
      tap((res) => {this._username.next(res)}),
      map(() => true),
      catchError(() => {
        this.router.navigateByUrl("")
        return of(false)})
    )
}


  logOut(){
      localStorage.removeItem("token")
      this._username.next(undefined)
      this.router.navigateByUrl("")
}


  login(l: login) {
    return this.apiService.login(l).pipe(
      tap(value => {
        localStorage.setItem("token", value);
        this._username.next(l.username)
        this.router.navigateByUrl("private")
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