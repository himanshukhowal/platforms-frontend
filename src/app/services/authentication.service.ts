import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): any {
        return this.currentUserSubject.value;
    }

    initLoginHeaders(username: string, password: string): HttpHeaders {
        const headers = new HttpHeaders()
            .set('X-Auth-Client', 'client1')
            .set('Authorization', "Basic " + btoa(username + ":" + password));
        return headers;
    }

    initBasicHeaders(): HttpHeaders {
        const headers = new HttpHeaders()
            .set('X-Auth-Client', 'client1')
        return headers;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/authenticate`, {}, { headers: this.initLoginHeaders(username, password) })
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    // store user details and jwt token in session storage to keep user logged in between page refreshes
                    sessionStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }

                return user;
            }));
    }

    signup(userObj: any) {
        return this.http.post<any>(`${environment.apiUrl}/signup`, { ...userObj }, { headers: this.initBasicHeaders() });
    }

    logout() {
        // remove user from session storage to log user out
        sessionStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}