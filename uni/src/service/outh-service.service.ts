import { Injectable, signal } from '@angular/core';
import { ErrorServiceService } from './error-service.service';
import { ApiServiceService, login } from './api-service.service';

@Injectable({
  providedIn: 'root'
})



export class OuthServiceService {
  private _username = signal<string | undefined>(undefined);

  public get username() {
    return this._username();
  }

  
  constructor(private errorService : ErrorServiceService, private apiService : ApiServiceService) { 
    const token = localStorage.getItem("token")
    if(token){
      this.apiService.chekToken(token).subscribe({
        next : (value) => {
          this._username.set(value)
        },error : (err) =>  {
          this.errorService.setError(err)
        }
       })
    }
  }

  logOut(){
    const credential = localStorage.getItem("token")
    if(!credential){
      this.errorService.setError("not loged in")
    }else{
      this.apiService.logout(credential).subscribe({
        next:(_)=> {
          localStorage.removeItem("token")
          this._username.set(undefined)
        },error:(err)=> {
          this.errorService.setError(err)
        }
       })

    }
  }


  login(l : login){
     this.apiService.login(l).subscribe({
      next:(value)=> {
          localStorage.setItem("token",value)
          this._username.set(l.username)
      },error:(err)=> {
        this.errorService.setError(err)
      }
     })
  }

}
