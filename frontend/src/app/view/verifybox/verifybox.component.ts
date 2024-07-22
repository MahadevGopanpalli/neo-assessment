import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { CountdownComponent, CountdownEvent } from 'ngx-countdown';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PasswordResetComponent } from '../passwordreset/passwordreset.component';

@Component({
  selector: 'app-verifybox',
  templateUrl: './verifybox.component.html',
  styleUrls: ['./verifybox.component.css']
})
export class VerifyBoxComponent implements OnInit {
  @Input() email: string;
  @Input() from: string;
  codeForm: FormGroup;
  timer: number;
  interval;
  countdownTime: number = 10;
  resendEnabled: boolean = false;
  showModal: any = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    public bsModalRef: BsModalRef,
    private modelService: BsModalService
  ) {
    this.codeForm = this.fb.group({
      code: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // this.modalService.modalState$.subscribe(state => {
    //   this.email = state.email;
    //   this.showModal = state.show;
    //   if (state.show) {
    //     this.startTimer();
    //   }
    // });
  }

  startTimer() {
    this.timer = 120; // 2 minutes
    this.interval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.interval);
      }
    }, 1000);
  }
  onCountdownEvent(event: CountdownEvent): void {
    if (event.action === 'done') {
      this.resendEnabled = true;
    }
  }
  resendCode() {
    // Code to resend the verification code
    this.authService.resendVerificationCode({email : this.email}).subscribe(
      res => {
        if (res.status === 0) {
          this.toastr.success('Verification code resent', 'Success');
          this.resendEnabled = false;
        } else {
          this.toastr.error(res.msg, 'Error');
        }
      },
      error => {
        this.toastr.error('Failed to resend verification code', 'Error');
      }
    );
  }
  closeDialog() {
    this.bsModalRef.hide();
  }
  verifyCode() {
    if (this.codeForm.valid) {
      const code = this.codeForm.get('code').value;
      this.authService.verifyCode({ email :this.email, code : code}).subscribe(
        res => {
          if (res.status === 0) {
            this.toastr.success('Verification successful', 'Success');
            this.bsModalRef.hide();
            if(this.from=='forgot')
            {
              localStorage.setItem('token', res.data.token);
              this.modelService.show(PasswordResetComponent,{initialState : {
                id : res.data.id
              }})
            }
            else{
              this.router.navigate(['/login']);
            }
          } else {
            this.toastr.error(res.msg, 'Error');
          }
        },
        error => {
          this.toastr.error('Verification failed', 'Error');
        }
      );
    } else {
      this.codeForm.markAllAsTouched();
    }
  }
}
