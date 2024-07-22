import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.css']
})
export class PasswordResetComponent implements OnInit {
  @Input() id: string;
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService,
    public bsModalRef: BsModalRef
  ) {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.mustMatch('password', 'confirmPassword') });
  }

  ngOnInit(): void {}

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

  closeDialog() {
    this.bsModalRef.hide();
  }

  updatePassword() {
    if (this.passwordForm.valid) {
      const { password } = this.passwordForm.value;
      this.userService.updateUser(this.id,{ password }).subscribe(
        res => {
          if (res.status === 0) {
            this.bsModalRef.hide();
            localStorage.clear();
            this.toastr.success('Password updated successfully', 'Success');
          } else {
            this.toastr.error(res.msg, 'Error');
          }
        },
        error => {
          this.toastr.error('Password update failed', 'Error');
        }
      );
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }
}
