import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {AsYouType, parsePhoneNumber, getCountries, getCountryCallingCode, getPhoneCode} from "libphonenumber-js";
import {GoogleLoginProvider, SocialAuthService, SocialUser} from "@abacritt/angularx-social-login";
import {parseJson} from "@angular/cli/src/utilities/json-file";
import {AuthService} from "../../core/auth/auth.service";
import {LoginUser, User} from "./user.model";
import {StorageService} from "../../core/storage/storage.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  protected readonly getCountries = getCountries;
  protected readonly getCountryCallingCode = getCountryCallingCode;
  protected readonly getPhoneCode = getPhoneCode;
  registerFrom: FormGroup;

  errorMessages = {
    firstName: [
      { type: 'required', message: 'Imię jest wymagane' }
    ],
    lastName: [
      { type: 'required', message: 'Nazwisko jest wymagane' }
    ],
    email: [
      { type: 'required', message: 'Adres e-mail jest wymagany' },
      { type: 'email', message: 'Proszę podać prawidłowy adres e-mail' }
    ],
    phoneNumber: [
      { type: 'pattern', message: 'Proszę podać prawidłowy numer telefonu (9 cyfr)' }
    ],
    password: [
      { type: 'required', message: 'Hasło jest wymagane' },
      { type: 'minlength', message: 'Hasło musi mieć co najmniej 8 znaków' }
    ],
    confirmPassword: [
      { type: 'required', message: 'Potwierdzenie hasła jest wymagane' },
      { type: 'passwordMismatch', message: 'Hasła nie są identyczne' }
    ]
  };



  constructor(private socialAuthService: SocialAuthService,
              private authService: AuthService,
              private storageService: StorageService,
              private router: Router,
              formBuilder: FormBuilder) {
    this.socialAuthService = socialAuthService;
    this.authService = authService;
    this.storageService = storageService;
    this.router = router;
    this.registerFrom = formBuilder.group({
      firstName: ['', Validators.required, Validators.maxLength(30)],
      lastName: ['', Validators.required, Validators.maxLength(30)],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['PL'],
      phoneNumber: ['', this.phoneNumberValidator()],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
      confirmPassword: ['', [Validators.required, this.passwordValidator()]],
    });
  }

  ngOnInit(): void {
    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      console.log('User: ' + JSON.stringify(user));
    });
  }

  register(): void {
    console.log('Register');
    console.log(this.registerFrom.value);
    let user = new User();
    user.username = this.registerFrom.get('email')?.value;
    user.password = this.registerFrom.get('password')?.value;
    user.name = this.registerFrom.get('firstName')?.value;
    user.surname = this.registerFrom.get('lastName')?.value;
    this.authService.register(user).subscribe({
      next: data => {
        console.log(data);
        this.login(user);
      },
      error: error => {
        console.error(error);
      }
    });
  }

  login(user: User): void {
    let loginUser = new LoginUser();
    loginUser.username = user.username;
    loginUser.password = user.password;
    this.authService.login(loginUser).subscribe({
      next: data => {
        console.log(data);
        this.storageService.setTokens(data);
        this.router.navigate(['home'])
      },
      error: error => {
        console.error(error);
      }
    });
  }

  validationErrors(controlName: string): any[] {
    let errors = []
    // @ts-ignore
    for(let error of this.errorMessages[controlName]) {
      if(this.registerFrom.get(controlName)?.hasError(error.type)) {
        errors.push(error);
      }
    }
    return errors;
  }

  formatPhoneNumber(event: any) {
    const input = event.target as HTMLInputElement;
    const country = this.registerFrom.get('countryCode')?.value;
    let value = input.value.replace(/\D/g, ''); // Remove non-numeric characters

    // Use libphonenumber-js's AsYouType formatter to format the input
    const formatter = new AsYouType(country);
    value = formatter.input(value);

    // Limit to a maximum of 15 characters
    input.value = value.slice(0, 15);
  }

  getFullPhoneNumber(): string {
    const country = this.registerFrom.get('countryCode')?.value;
    const phoneNumber = this.registerFrom.get('phoneNumber')?.value;
    const fullPhoneNumber = `+${parsePhoneNumber(phoneNumber, country).countryCallingCode} ${phoneNumber}`;
    return fullPhoneNumber;
  }

  phoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const phoneNumber = control.value;
      const country = control.parent ? control.parent.get('countryCode')?.value : null;

      if (!phoneNumber || !country) {
        return null; // If the control or country code is empty, consider it valid.
      }

      try {
        const parsedPhoneNumber = parsePhoneNumber(phoneNumber, country);
        if (!parsedPhoneNumber.isValid()) {
          return {invalidPhoneNumber: true};
        }
      } catch (error) {
        return {invalidPhoneNumber: true};
      }

      return null;
    };
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const passwordToConfirm = control.value;
      const originalPassword = control.parent ? control.parent.get('password')?.value : null;

      if (!passwordToConfirm || !originalPassword) {
        return null; // If the control or country code is empty, consider it valid.
      }

      try {
        if (passwordToConfirm !== originalPassword) {
          return {passwordMismatch: true};
        }
      } catch (error) {
        return {passwordMismatch: true};
      }

      return null;
    };
  }

  signInWithGoogle(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)
      .then(user => {
        console.log(user);
        // Now you have access to user's information like name, email, etc.
        // Send this information to your Django backend.
      })
      .catch(error => {
        console.error(error);
      });
  }


}
