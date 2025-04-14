import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { debounce, debounceTime, Observable, of } from 'rxjs';

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

export interface game {
  pression : number 
  timestap : number
}

interface countGame {
  res : game[][]
  count : number
}

interface countPlayer {
  res : string[]
  count : number
}


export interface playerStats {
	maxPressure    :    number
	maxPressureDuration : number
	maxPressureLast     : number[]
	totalGames         : number
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
  saveSens(s : game[], c : string, p : string) : Observable<any> {
    return this.http.post<any>(`${apiUrl}/saveSens/${p}`, JSON.stringify(s),{headers: {
      Authorization: c}
    }); 
  }
  getPlayerNames(limit : number , index : number, filter : string | string[] | undefined ) : Observable<countPlayer> {
    if(filter){
      return this.http.get<countPlayer>(`${apiUrl}/getPlayerNames/${limit}/${index}/${filter}`); 
    }
    return this.http.get<countPlayer>(`${apiUrl}/getPlayerNames/${limit}/${index}`); 
  }
  getPlayerGamesByName(limit : number , index : number, player : string) : Observable<countGame> {
    return this.http.get<countGame>(`${apiUrl}/getPlayerGamesByName/${player}/${limit}/${index}`); 
  }
  getPlayerStats(player : string) : Observable<playerStats> {
    return this.http.get<playerStats>(`${apiUrl}/getPlayerStats/${player}`); 
  }
   



}
