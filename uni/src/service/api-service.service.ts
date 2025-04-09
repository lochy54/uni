import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

export interface login {
  username : string
  password : string
}

export interface user {
	name   :  string
	surname : string 
	username : string 
	password : string 
}

export interface sensibility {
  pression : number 
  timestap : number
}

export interface playerSens {
  player : string
  pression : sensibility[]
}


const apiUrl = "/api"

@Injectable({
  providedIn: 'root'
})

export class ApiServiceService {
  constructor(private http : HttpClient, private router : Router) { }

  login(l : login) : Observable<string>{
    return this.http.post<string>(`${apiUrl}/login`, JSON.stringify(l));
  }
  chekToken() : Observable<string> {
    return this.http.get<string>(`${apiUrl}/chekToken`);
  }
  register(user : user) : Observable<string> {
    return this.http.post<string>(`${apiUrl}/register`, JSON.stringify(user)); 
  }
  generateCode() : Observable<string> {
    return this.http.get<string>(`${apiUrl}/generate`); 
  }
  isCodeActive(code : string) : Observable<any> {
    return this.http.post<any>(`${apiUrl}/chekCode`, JSON.stringify(code)); 
  }
  saveSens(s : sensibility[], c : string, p : string) : Observable<any> {
    return this.http.post<any>(`${apiUrl}/saveSens`, JSON.stringify({ "player" : p , "pression" : s}),{headers: {
      Authorization: c}
    }); 
  }
  getSens() : Observable<playerSens[]>{
    return this.http.get<playerSens[]>(`${apiUrl}/getSens`);
  }
  
}
