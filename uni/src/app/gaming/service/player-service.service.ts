import { Injectable, signal } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, CanActivateChild, GuardResult, MaybeAsync, NavigationEnd, Params, Router, RouterStateSnapshot } from '@angular/router';
import { ApiServiceService, sensibility } from '../../../service/api-service.service';
import { BehaviorSubject, filter, Observable, of, ReplaySubject, switchMap } from 'rxjs';
import { SoundServiceService } from './sound-service.service';
import { ErrorServiceService } from '../../../service/error-service.service';



@Injectable({
  providedIn: 'root'
})
export class PlayerServiceService implements CanActivate{
  
  private gameCode : string = ""
  private _username  : ReplaySubject<string> = new ReplaySubject(1)
  private _pressureSet: BehaviorSubject<number> = new BehaviorSubject(1);
  private _difficulty  : BehaviorSubject<number> = new BehaviorSubject(2);
  private _pouse  : BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private apiService : ApiServiceService,private router : Router, private errorService : ErrorServiceService
  ) { 

  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const params = route.params;
    this.gameCode = params["code"] || "";
    this._username.next(params["username"] || "")

    if (!params["username"]) {
      this.router.navigate(['/']);
      return false;
    }
    this.apiService.isCodeActive(this.gameCode).subscribe({
      error : (_)=> {
        this.router.navigate(['/']);
      }, 
  })
  return true
}

pouse(k : boolean){
  this._pouse.next(k)
}

setDifficulty(n : number){
  this._difficulty.next(n)
}

setPressure(n : number){
    this._pressureSet.next(n)
}

public get usernameSignal() {
  return this._username.asObservable();
}
public get pressureSetSignal() {
  return this._pressureSet.asObservable();
}
public get difficultySignal() {
  return this._difficulty.asObservable();
}
public get pouseSignal() {
  return this._pouse.asObservable();
}



savePression( p : sensibility[]){
  this._username.subscribe((val) => {
    this.apiService.saveSens(p, this.gameCode , val).subscribe({
      error : (error)=> {
        this.errorService.setError(error.error)
      }, 
    })
    }
  )
}
}