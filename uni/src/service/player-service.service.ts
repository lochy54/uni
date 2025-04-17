import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { ApiServiceService, game } from './api-service.service';
import {
  BehaviorSubject,
  catchError,
  filter,
  map,
  Observable,
  of,
  ReplaySubject,
  switchMap,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlayerServiceService implements CanActivate {
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiServiceService);

  private gameCode: string = '';

  private readonly _username = new BehaviorSubject<string | undefined>(
    undefined
  );
  private readonly _pressureSet = new BehaviorSubject(1);
  private readonly _difficulty = new BehaviorSubject(2);
  private readonly _pouse = new BehaviorSubject(false);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const params = route.params;

    if (!params['username'] || !params['code']) {
      this.router.navigate(['/']);
      return of(false);
    }
    this.gameCode = params['code'];
    this._username.next(params['username']);

    return this.apiService.isCodeActive(this.gameCode).pipe(
      map(() => true),
      catchError((_) => {
        this.router.navigateByUrl('');
        return of(false);
      })
    );
  }

  pouse(k: boolean) {
    this._pouse.next(k);
  }

  setDifficulty(n: number) {
    this._difficulty.next(n);
  }

  setPressure(n: number) {
    this._pressureSet.next(n);
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

  savePression(p: game[]) {
    this.usernameSignal
      .pipe(
        switchMap((username) => {
          if (username) {
            return this.apiService.saveSens(p, this.gameCode, username);
          } else {
            return throwError(() => new Error('username not found'));
          }
        })
      )
      .subscribe();
  }
}
