import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl + '/users'; 

  constructor(private http: HttpClient) {}

  getUsersNormal(page: number, size: number,sortBy:string,order:number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}&sortBy=${sortBy}&order=${order}`);
  }

  getUsers(obj:any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/get`,obj);
  }

  getUser(id:any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, user);
  }

  updateUser(id:any, user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, user);
  }
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
