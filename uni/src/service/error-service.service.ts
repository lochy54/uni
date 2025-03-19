import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorServiceService {
  private _errorS = signal<string[]>([]);

  public get errorS() {
    return this._errorS.asReadonly();
  }


  setError(errorString: string){
    this._errorS.update(val=>{
     val.push(errorString)
      return val
    })
      setTimeout(() => {
        this._errorS.update(val=>{
          val.pop()
           return val
         })
      }, 4000);


  }
  
  constructor() { }
}
