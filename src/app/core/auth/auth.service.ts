import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable, tap} from "rxjs";
import {LoginUser, User} from "../../features/register/user.model";
import {AuthResponse} from "./auth-response.model";
import {StorageService} from "../storage/storage.service";
import {Router} from "@angular/router";
import {API_ENDPOINTS} from "../../shared/config/api-endpoints.config";

@Injectable({
  providedIn: 'root'
})
@Injectable()
export class AuthService {
  baseUrl = '/api/';

  constructor(private httpClient: HttpClient, private storageService: StorageService, private router: Router) {
  }

  register(user: User): Observable<any> {
    return this.httpClient.post<any>(API_ENDPOINTS.public.register, user);
  }

  loginGoogle(token: string): Observable<any> {
    return this.httpClient.post<any>(API_ENDPOINTS.public.loginGoogle, {token: token}).pipe(
      tap(value => {
        this.storageService.setLoggedIn(true);
      })
    );
  }

  login(user: LoginUser): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(API_ENDPOINTS.public.login, user).pipe(
      tap(value => {
        this.storageService.setLoggedIn(true);
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storageService.getRefreshToken();
    console.log('Refresh token in auth:' + refreshToken)
    return this.httpClient.post<AuthResponse>(API_ENDPOINTS.public.refreshToken,
      {refresh: this.storageService.getRefreshToken()});
  }

  logout(): void {
    this.storageService.clearTokens();
    this.storageService.clearRoles();
    this.storageService.setLoggedIn(false);
    // this.httpClient.post<any>(API_ENDPOINTS.mixed.logout, {}).subscribe(
    //   {
    //     next: data => {
    //       this.router.navigate(['login']);
    //     },
    //     error: error => {
    //       console.error(error);
    //       this.router.navigate(['login']);
    //     }
    //   }
    // );
  }

}
