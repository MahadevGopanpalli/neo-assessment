import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ModalService } from 'src/app/modal.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/services/auth.service';
import { VerifyBoxComponent } from 'src/app/view/verifybox/verifybox.component';
import { FacebookLoginProvider, SocialAuthService } from 'angularx-social-login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  bsModalRef: BsModalRef<VerifyBoxComponent>;

  constructor(private fb: FormBuilder,private router : Router,private authService: AuthService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.customEmailValidator]],
      password: ['', [Validators.required, Validators.minLength(8)]] 
    });
    this.authService.getUser().subscribe(
      response => {
        console.log('User data:', response);
        if(response.status==0)
          {
            console.log('Login successful', response);
            localStorage.setItem('token', response.data.token);
            this.authService.setCurrentUser();
            this.router.navigate(['/dashboard']);
          }
      },
      error => {
        console.error('Error fetching user data:', error);
      }
    );
  }
  customEmailValidator(control) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; 
    if (control.value && !emailRegex.test(control.value)) {
      return { 'custom': true }; 
    }
    return null; 
  }
  onSubmit(user){
    if (this.loginForm.valid) {
      const obj =  this.loginForm.value;
      this.login(obj);
    }
    else
    {
      console.log("Invalid Validation..");
    }
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
        else if(response.status==2)
        {
          this.toastr.error(response.msg,'Error');
          this.sendVerification({ email: response?.data?.userData?.email, from : "verify" });
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

  loginWithGoogle() {
    console.log('Logging in with Google');
    this.authService.loginWithGoogle()
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
  loginWithGithub() {
    console.log('Logging in with Google');
    this.authService.loginWithGithub()
  }
  loginWithFacebook() {
    console.log('Logging in with FacebookNew');
    // this.authService.loginWithFacebook()
    this.authService.getAuthState();
    this.authService.loginWithFacebook().then(user => {
      // Here you can handle the user data for signup or login
      console.log('User signed in:', user);
      this.login(user);
    }).catch(error => {
      console.error('Error during sign in:', error);
    });
    // .subscribe(
    //   (data) => {
    //     console.log('Successfully logged in with Google',data);
    //   },
    //   (error) => {
    //     console.error('Error logging in with Google:', error);
    //   }
    // );
  }

  forgotPassword()
  {
    if (this.loginForm.get('email').valid) {
      const email = this.loginForm.get('email').value;
          this.sendVerification({ email: email, from : "forgot" });
    } 
    else {
      this.toastr.error('Please enter a valid email address.', 'Error');
    }
  }

  sendVerification(obj)
  {
    this.authService.resendVerificationCode(obj).subscribe(
      res => {
        if (res.status === 0) {
          this.openVerifyModal(obj)
        } else {
          this.toastr.error(res.msg, 'Error');
        }
      },
      error => {
        this.toastr.error('Failed to resend verification code', 'Error');
      }
    );  
  }

  openVerifyModal(obj) {
    this.bsModalRef = this.modalService.show(VerifyBoxComponent, {initialState : obj });
  }

}
