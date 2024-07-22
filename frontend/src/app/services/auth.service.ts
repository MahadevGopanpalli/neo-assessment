import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { FacebookLoginProvider, SocialAuthService, SocialUser } from 'angularx-social-login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; 
  popupObserver: any;

  constructor(private http: HttpClient,private router: Router,private cookieService: CookieService,
    private socialService : SocialAuthService
  ) { }

  login(body): Observable<any> {
    const url = `${this.apiUrl}/auth/login`;
    return this.http.post(url, body);
  }

  register(body:any): Observable<any> {
    const url = `${this.apiUrl}/auth/register`;
    return this.http.post(url, body);
  }

  fileUploadS3(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload`, formData);
  }


  getUser(): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Credentials': 'true'
    });

    return this.http.get(`${this.apiUrl}/auth/login/success`, { headers, withCredentials: true });
  }


  loginWithGoogle() {
    // return this.http.get(`${this.apiUrl}/auth/google`,{ withCredentials: true });
    window.open(`${this.apiUrl}/auth/google`, "_self");
  }

  loginWithGithub() {
    // return this.http.get(`${this.apiUrl}/auth/google`,{ withCredentials: true });
    window.open(`${this.apiUrl}/auth/github`, "_self");
  }

  getAuthState() {
    return this.socialService.authState;
  }

  loginWithFacebook():Promise<SocialUser> {
    // window.open(`${this.apiUrl}/auth/facebook`, "_self");
    return this.socialService.signIn(FacebookLoginProvider.PROVIDER_ID);

    // return this.http.get(`${this.apiUrl}/auth/facebook`,{ withCredentials: true });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  getToken():string
  {
    return localStorage.getItem('token');
  }
  setCurrentUser() : void
  {
      let data = this.decodeToken();
      localStorage.setItem('profile',JSON.stringify(data));
  }
  getCurrentUser() : any
  {
    return JSON.parse(localStorage.getItem('profile'));
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
    this.cookieService.deleteAll();
    window.open(`${this.apiUrl}/auth/logout`, "_self");
    // return this.http.get(`${this.apiUrl}/auth/logout`);
  }
  isAdmin(): any
  {
     let token = this.decodeToken();
     return token && token.role == 'admin' ? true : false;
  }
  decodeToken(): any {
    const token = this.getToken();
    if (token) {
      try {
        return jwtDecode(token);
      } catch (error) {
        console.error('Invalid token', error);
        return null;
      }
    }
    return null;
  }
  verifyCode(body)
  {
    return this.http.post<any>(`${this.apiUrl}/auth/verifyCode`, body);
  }
  resendVerificationCode(body)
  {
    return this.http.post<any>(`${this.apiUrl}/auth/resendCode`, body);
  }
}
