import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service'; // Adjust the path as needed
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  selectedFile: any;
  profileImage: string | ArrayBuffer;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: [''],
      about: [''],
      strength: this.fb.array([]) // FormArray for strength
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id');
      if (this.userId) {
        this.isEditMode = true;
        this.loadUserData();
      }
    });
  }
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result;
        this.fileUpload()
      };
      reader.readAsDataURL(file);
    }
  }

  fileUpload() {
    if (this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        this.authService.fileUploadS3(formData).subscribe(
          res => {
            if (res.status === 0) {
              console.log("S3---",res);
              this.profileImage = res.path ? res.path : '';
            } else {
              this.toastr.error(res.msg, 'Error');
            }
          },
          error => {
            console.error('Signup failed', error);
          }
        );
    }
  }
  get strength(): FormArray {
    return this.userForm.get('strength') as FormArray;
  }

  addStrength(): void {
    this.strength.push(this.fb.control(''));
  }

  removeStrength(index: number): void {
    this.strength.removeAt(index);
  }

  loadUserData(): void {
    this.userService.getUser(this.userId).subscribe(data => {
      if (data.status === 0) {
        const user = data.data;
        this.userForm.patchValue(user);
        this.strength.clear();
        user.strength.forEach((s: string) => {
          this.strength.push(this.fb.control(s));
        });
        this.profileImage = user.profile ? user.profile : '';
      }
    });
  }

  saveUser(): void {
    if (this.userForm.valid) {
      const user = this.userForm.value;
      user['profile'] = this.profileImage;
      if (this.isEditMode) {
        this.userService.updateUser(this.userId, user).subscribe(data => {
          if (data.status === 0) {
            this.router.navigate(['/dashboard']); 
          }
        });
      } else {
        this.userService.createUser(user).subscribe(data => {
          if (data.status === 0) {
            this.router.navigate(['/dashboard']); 
          }
        });
      }
    }
  }
}
