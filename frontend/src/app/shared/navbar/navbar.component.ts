import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser: any;

  constructor(private authService : AuthService) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser(); 
  }


  logout() {
    this.authService.logout()
    // .subscribe(
    //   response => {
    //     console.log("Logged out :",response)
    //   },
    //   error => {
    //     console.error('Login failed', error);
    //   }
    // );
  }

}
