import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  submitted = false;
  roles = [3, 4];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern("^[0-9]*$")]],
      userEmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      roleId: [this.roles[1], Validators.required]
    }, {
      validator: this.MustMatch('password', 'confirmPassword')
    });
  }

  MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        // return if another validator has already found an error on the matchingControl
        return;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }

  get f() { return this.registerForm.controls; }

  openSignin() {
    this.router.navigate(["login"]);
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.registerForm.invalid) {
      this.showError();
      return;
    }

    this.authenticationService.signup(this.registerForm.value).subscribe({
      next: (data) => {
        this.showSuccess(data.data.userId);
        this.router.navigate(["login"], { queryParams: { userId: data.data.userId} });
      },
      error: (err) => {
        this.showError();
        const validationErrors = err.error;
        Object.keys(validationErrors).forEach(prop => {
          const formControl = this.registerForm.get(prop);
          if (formControl) {
            formControl.setErrors({
              serverError: validationErrors[prop]
            });
          }
        });
      }
    });
  }

  showError() {
    this.toastr.error(
      'Fix the errors in registration from and resubmit',
      '',
      {
        timeOut: 8000,
        closeButton: true,
        tapToDismiss: false,
        positionClass: 'toast-top-right',
        progressBar: true
      }
    );
  }

  showSuccess(username: string) {
    this.toastr.success(
      'Registration Successful, your username is ' + username,
      '',
      {
        timeOut: 8000,
        closeButton: true,
        tapToDismiss: false,
        positionClass: 'toast-top-right',
        progressBar: true
      }
    );
  }

}
