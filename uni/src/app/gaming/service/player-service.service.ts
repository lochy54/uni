import { inject, Injectable } from '@angular/core';
import {  ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { ApiServiceService, sensibility } from '../../../service/api-service.service';
import { BehaviorSubject, catchError, filter, map, Observable, of, ReplaySubject } from 'rxjs';
import { MessageService } from 'primeng/api';



@Injectable({
  providedIn: 'root'
})
export class PlayerServiceService implements CanActivate{
  
  private readonly router = inject(Router)
  private readonly apiService = inject(ApiServiceService)
  private readonly errorService= inject(MessageService)

  private gameCode : string = ""

  private readonly _username  : ReplaySubject<string> = new ReplaySubject(1)
  private readonly _pressureSet: BehaviorSubject<number> = new BehaviorSubject(1);
  private readonly _difficulty  : BehaviorSubject<number> = new BehaviorSubject(2);
  private readonly _pouse  : BehaviorSubject<boolean> = new BehaviorSubject(false);


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    const params = route.params;
    this.gameCode = params["code"] || "";
    this._username.next(params["username"] || "");
  
    if (!params["username"]) {
      this.router.navigate(['/']);
      return false;
    }
  
    return this.apiService.isCodeActive(this.gameCode).pipe(
      map(() => true),
      catchError((err) => {
        this.errorService.add(({ severity: 'error', summary: 'Error', detail: err.error}));
        this.router.navigateByUrl("");
        return of(false);
      })
    );
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
  let username : string|undefined 
  this._username.subscribe((val)=>username = val)
  this.apiService.saveSens(p, this.gameCode , username!).subscribe({
    error : (error)=> {
      this.errorService.add(({ severity: 'error', summary: 'Error', detail: error.error}));
    }, 
  })
}
}