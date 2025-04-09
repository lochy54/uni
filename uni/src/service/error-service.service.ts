import { Injectable, signal } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorServiceService {
  private _errorS : string[] = [];
  private err : ReplaySubject<string[]> = new ReplaySubject(1)
  public get errorS(): Observable<string[]>  {
    return this.err.asObservable();
  }


  setError(errorString: string){
    console.log(errorString)
    this._errorS.push(errorString)
    this.err.next(this._errorS)
      setTimeout(() => {
        this._errorS.pop()
        this.err.next(this._errorS)
      }, 4000);


  }
  
  constructor() { }
}
