import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { debounce, debounceTime, Observable, of, tap } from 'rxjs';
import { MessageService } from 'primeng/api';

export interface login {
  username: string;
  password: string;
}

export interface user {
  name: string;
  surname: string;
  username: string;
  password: string;
}

export interface game {
  pression: number;
  timestap: number;
}

interface countGame {
  res: game[][];
  count: number;
}

interface countPlayer {
  res: string[];
  count: number;
}

export interface playerStats {
  maxPressure: number;
  maxPressureDuration: number;
  maxPressureLast: number[];
  totalGames: number;
}

const apiUrl = '/api';

@Injectable({
  providedIn: 'root',
})
export class ApiServiceService {
  private readonly errorService = inject(MessageService);
  private readonly http = inject(HttpClient);

  login(l: login): Observable<string> {
    return this.http.post<string>(`${apiUrl}/login`, JSON.stringify(l)).pipe(
      tap({
        error: (err) =>
          this.errorService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error,
          }),
      })
    );
  }

  chekToken(): Observable<string> {
    return this.http.get<string>(`${apiUrl}/chekToken`).pipe(
      tap({
        error: (err) =>
          this.errorService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error,
          }),
      })
    );
  }

  register(user: user): Observable<string> {
    return this.http
      .post<string>(`${apiUrl}/register`, JSON.stringify(user))
      .pipe(
        tap({
          error: (err) =>
            this.errorService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error,
            }),
        })
      );
  }

  generateCode(): Observable<string> {
    return this.http.get<string>(`${apiUrl}/generate`).pipe(
      tap({
        error: (err) =>
          this.errorService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error,
          }),
      })
    );
  }
  isCodeActive(code: string): Observable<any> {
    return this.http.post<any>(`${apiUrl}/chekCode`, JSON.stringify(code)).pipe(
      tap({
        error: (err) =>
          this.errorService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error,
          }),
      })
    );
  }

  saveSens(s: game[], c: string, p: string): Observable<any> {
    return this.http
      .post<any>(`${apiUrl}/saveSens/${p}`, JSON.stringify(s), {
        headers: {
          Authorization: c,
        },
      })
      .pipe(
        tap({
          error: (err) =>
            this.errorService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error,
            }),
        })
      );
  }
  getPlayerNames(
    limit: number,
    index: number,
    filter: string | string[] | undefined
  ): Observable<countPlayer> {
    if (filter) {
      return this.http
        .get<countPlayer>(
          `${apiUrl}/getPlayerNames/${limit}/${index}/${filter}`
        )
        .pipe(
          tap({
            error: (err) =>
              this.errorService.add({
                severity: 'error',
                summary: 'Error',
                detail: err.error,
              }),
          })
        );
    }
    return this.http
      .get<countPlayer>(`${apiUrl}/getPlayerNames/${limit}/${index}`)
      .pipe(
        tap({
          error: (err) =>
            this.errorService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error,
            }),
        })
      );
  }
  getPlayerGamesByName(
    limit: number,
    index: number,
    player: string
  ): Observable<countGame> {
    return this.http
      .get<countGame>(
        `${apiUrl}/getPlayerGamesByName/${player}/${limit}/${index}`
      )
      .pipe(
        tap({
          error: (err) =>
            this.errorService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error,
            }),
        })
      );
  }
  getPlayerStats(player: string): Observable<playerStats> {
    return this.http
      .get<playerStats>(`${apiUrl}/getPlayerStats/${player}`)
      .pipe(
        tap({
          error: (err) =>
            this.errorService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error,
            }),
        })
      );
  }
}
