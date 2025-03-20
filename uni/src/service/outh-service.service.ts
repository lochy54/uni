import { Injectable, signal } from '@angular/core';
import { ErrorServiceService } from './error-service.service';
import { ApiServiceService, login, user } from './api-service.service';
import { catchError, map, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})



export class OuthServiceService {
  private _username = signal<{username : string, token : string} | undefined>(undefined);
  public get username() {
    return this._username.asReadonly();
  }

  
  constructor(private errorService : ErrorServiceService, private apiService : ApiServiceService) { 
    const token = localStorage.getItem("token")
    if(token){
      this.apiService.chekToken(token).subscribe({
        next : (value) => {
          this._username.set({
            username: value,
            token: token
          })
        },error : (err) =>  {
          this.errorService.setError("Login Spoiled")
        }
       })
    }
  }


  logOut(){
      return this.apiService.logout(this._username()!.token).pipe(
        tap( _ => {
          localStorage.removeItem("token")
          this._username.set(undefined)
        }),
        catchError(err => {
          return throwError(() => err.message); 
        })
      );

}


  login(l: login) {
    return this.apiService.login(l).pipe(
      tap(value => {
        localStorage.setItem("token", value);
        this._username.set({
          username: l.username,
          token: value
        });
      }),
      catchError(err => {
        return throwError(() => err.message); 
      })
    );
  }

  register(u:user) {
    return this.apiService.register(u).pipe(
      tap(value => {
        localStorage.setItem("token", value);
        this._username.set({
          username: u.username,
          token: value
        });
      }),
      catchError(err => {
        return throwError(() => err.message); 
      })
    );
  }

}
