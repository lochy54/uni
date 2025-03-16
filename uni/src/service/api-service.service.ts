import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface login {
  username : string
  password : string
}

export interface user {
	name   :  string
	surname : string 
	age   :   number
	cf    :   string 
	username : string 
	password : string 
}


const apiUrl = "localhost//"

@Injectable({
  providedIn: 'root'
})

export class ApiServiceService {
  constructor(private http : HttpClient) { }

  login(l : login) : Observable<string>{
    return this.http.post<string>(`${apiUrl}login`, JSON.stringify(l));
  }

  chekToken(token : string) : Observable<string> {
    return this.http.post<string>(`${apiUrl}chekToken`, JSON.stringify(token));
  }

  logout(token: string) : Observable<any> {
    return this.http.post<any>(`${apiUrl}logout`, JSON.stringify(token)); 
  }

  register(user : user) : Observable<string> {
    return this.http.post<string>(`${apiUrl}register`, JSON.stringify(user)); 
  }

}
