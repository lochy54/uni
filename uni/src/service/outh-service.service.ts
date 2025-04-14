import { inject, Injectable, signal } from '@angular/core';
import { ApiServiceService, login, user} from './api-service.service';
import { BehaviorSubject, catchError, map, Observable, of, ReplaySubject, switchMap, take, tap, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})



export class OuthServiceService implements CanActivate {
  private readonly _username = new BehaviorSubject<string | undefined>(undefined);
  private readonly router = inject(Router)
  private readonly apiService = inject(ApiServiceService)
  get username() : Observable<string | undefined> {
    return this._username.asObservable();
  }

  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.username.pipe(
      switchMap(username => {
        if (username) {
          return of(true);
        }
        return this.chekToken()
      }))
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

  private chekToken(){
    return this.apiService.chekToken().pipe(
      tap(res => this._username.next(res)),
      map(() => true),
      catchError(() => {
        this.router.navigateByUrl("");
        return of(false);
      })
    );
  }


}