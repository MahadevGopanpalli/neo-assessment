import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { VerifyBoxComponent } from 'src/app/view/verifybox/verifybox.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  selectedFile: File = null;
  profileImage: string | ArrayBuffer;
  profile: any;
  email: any;
  showVerificationDialog: boolean;

  constructor(private fb: FormBuilder,private authService: AuthService,
    private toastr: ToastrService, private router : Router,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.showVerificationDialog = false;
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.mustMatch('password', 'confirmPassword') });
  }
  mustMatch(password: string, confirmPassword: string) {
    return (formGroup: FormGroup) => {
      const passwordControl = formGroup.controls[password];
      const confirmPasswordControl = formGroup.controls[confirmPassword];

      if (confirmPasswordControl.errors && !confirmPasswordControl.errors.mustMatch) {
        return;
      }

      if (passwordControl.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ mustMatch: true });
      } else {
        confirmPasswordControl.setErrors(null);
      }
    };
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
              this.profile = res.path ? res.path : '';
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
  signup() {
    if (this.signupForm.valid) {
      const obj = this.signupForm.value;
      obj['profile'] = this.profile;
      delete obj['confirmPassword'];
      this.authService.register(obj).subscribe(
        res => {
          if(res.status==0)
          {
            this.toastr.success('Registerd Successfully','Success');
            // this.router.navigate(['/login']);
            this.email = obj.email;
            this.openVerifyModal();
          }
          else
          {
            this.toastr.error(res.msg,'Error');
            this.signupForm.reset();
          }
        },
        error => {
          console.error('Signup failed', error);
        }
      );
    }
    else
    {
      this.signupForm.markAllAsTouched();
    }
  }

  openVerifyModal() {
    this.modalService.show(VerifyBoxComponent, {initialState :{ email: this.email, from : "signup" } });
  }

  signupWithGoogle() {
    console.log('Signing in with Google');
    this.authService.loginWithGoogle();
    // .subscribe(
    //   (response) => {
    //     console.log('Successfully logged in with Google',response);
    //     if(response.status==0)
    //       {
    //         console.log('Login successful', response);
    //         localStorage.setItem('token', response.data.token);
    //         this.authService.setCurrentUser();
    //         this.router.navigate(['/dashboard']);
    //       }
    //       else
    //       {
    //         this.toastr.error(response.msg,'Error');
    //       }
    //   },
    //   (error) => {
    //     console.error('Error logging in with Google:', error);
    //   }
    // );
  }

  login(obj)
  {
    this.authService.login(obj).subscribe(
      response => {
        if(response.status==0)
        {
          console.log('Login successful', response);
          localStorage.setItem('token', response?.data?.token);
          this.authService.setCurrentUser();
          this.router.navigate(['/dashboard']);
        }
        else
        {
          this.toastr.error(response.msg,'Error');
        }
      },
      error => {
        console.error('Login failed', error);
      }
    );
  }
  signupWithFacebook() {
    console.log('Signing up with Facebook');
    this.authService.loginWithFacebook().then(user => {
      console.log('User signed in:', user);
      this.login(user);
    }).catch(error => {
      console.error('Error during sign in:', error);
    });  }

  switchToLogin() {
    console.log('Switching to Login');
  }
  signupWithGithub()
  {
    this.authService.loginWithGithub();
  }
}
