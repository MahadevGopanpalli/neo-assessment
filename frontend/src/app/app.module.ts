import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from 'src/app/auth/login/login.component';
import { SignupComponent } from 'src/app/auth/signup/signup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './view/dashboard/dashboard.component';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import { NgxPaginationModule } from 'ngx-pagination';
import { CookieService } from 'ngx-cookie-service';
import { VerifyBoxComponent } from './view/verifybox/verifybox.component';
import { CountdownModule } from 'ngx-countdown';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { PasswordResetComponent } from './view/passwordreset/passwordreset.component';
import { SharedModule } from './shared/shared.module';
import { FacebookLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from 'angularx-social-login';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    VerifyBoxComponent,
    PasswordResetComponent
  ],
  imports: [
    SocialLoginModule,
    SharedModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule, 
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxPaginationModule,
    CountdownModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot({
      positionClass: 'toast-top-right', // Positioning the toast at top-right
      preventDuplicates: true, // Prevent duplicate toasts
      closeButton: true, // Show close button
      progressBar: true // Show progress bar
    })  ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
      {
        provide: 'SocialAuthServiceConfig',
        useValue: {
          autoLogin: false,
          providers: [
            {
              id: FacebookLoginProvider.PROVIDER_ID,
              provider: new FacebookLoginProvider(environment.facebookId)
            }
          ],
          onError: (err) => {
            console.error(err);
          }
        } as SocialAuthServiceConfig,
      },
      UserService,
      AuthService,
      CookieService,
      BsModalRef,
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
      }
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
