import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  returnUrl: string;
  signinForm: FormGroup;
  submitted = false;
  userId: string;

  constructor(
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.userId = this.route.snapshot.queryParams['userId'];
    if (this.authenticationService.currentUserValue && this.authenticationService.currentUserValue.token) {
      this.router.navigate([this.returnUrl]);
    }
    this.initForm();
  }

  initForm() {
    this.signinForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() { return this.signinForm.controls; }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.signinForm.invalid) {
      return;
    }

    this.authenticationService.login(this.signinForm.value.username, this.signinForm.value.password).subscribe({
      next: (data) => {
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.showError();
      }
    });

  }

  openSignup() {
    this.router.navigate(["register"]);
  }

  showError() {
    this.toastr.error(
      'Invalid username or password',
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

  ngOnDestroy() {
  }

}
