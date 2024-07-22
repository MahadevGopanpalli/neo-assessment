import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  users: any[] = [];
  page: number = 1;
  size: number = 10;
  totalUsers: number = 0;
  currentUser: any;
  sortColumn: string = 'name'; 
  sortDirection: string = 'asc';
  searchField: string = 'name';
  searchTerm: string = '';

  constructor(private userService: UserService,private toastr: ToastrService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser(); 
    this.loadUsers();
  }

  loadUsersNormal() {
    this.userService.getUsersNormal(this.page, this.size, this.sortColumn, (this.sortDirection == 'asc' ? 1 : -1)).subscribe(
    res => {
      if(res.status==0)
      {
        this.users = res.data.users;
        this.totalUsers = res.data.total;
      }
      else
      {
        this.toastr.error(res.msg,'Error');
      }
    },
    error => {
      console.error('Login failed', error);
    });
  }

  isAdmin()
  {
    return this.authService.isAdmin();
  }
  loadUsers() {
    const obj = {
      page : this.page,
      size : this.size,
      sortBy : this.sortColumn,
      order : (this.sortDirection == 'asc' ? 1 : -1),
      searchF : this.searchField,
      searchV : this.searchTerm ? this.searchTerm : null
    }
    this.userService.getUsers(obj).subscribe(
    res => {
      if(res.status==0)
      {
        this.users = res.data.users;
        this.totalUsers = res.data.total;
      }
      else
      {
        this.toastr.error(res.msg,'Error');
      }
    },
    error => {
      console.error('Login failed', error);
    });
  }

  deleteUser(id: number) {
    this.userService.deleteUser(id).subscribe(() => {
      this.loadUsers();
    });
  }
  onPageChange(page: any) {
    this.page = page;
    this.loadUsers();
  }

  navigateToAddUser() {
    this.router.navigate(['/user/add']);
  }

  navigateToEditUser(userId: string) {
    this.router.navigate([`/user/edit/${userId}`]);
  }

  applyFilter()
  {
    this.loadUsers();
  }

  clearFilter()
  {
      this.searchField = 'name';
      if(this.searchTerm!=='')
        {
          this.searchTerm = '';
          this.loadUsers()
        }
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadUsers();
  }
}
