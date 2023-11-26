import {Component, ViewChild} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {MatMenuTrigger} from "@angular/material/menu";
import {AuthService} from "../auth/auth.service";
import {Role} from "../../features/register/user.model";
import {StorageService} from "../storage/storage.service";
import {SocialAuthService} from "@abacritt/angularx-social-login";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {DocumentsService} from "../../features/documents/documents.service";
import {TopBarService} from "./top-bar.service";
import {Profile} from "../../features/Profile";

@Component({
  selector: 'app-top-app-bar',
  templateUrl: './top-app-bar.component.html',
  styleUrls: ['./top-app-bar.component.scss']
})
export class TopAppBarComponent {
  isInGardenInfoComponent: boolean = false;
  isInHomeComponent: boolean = false;
  isInCalendarComponent: boolean = false;
  isInVotingComponent: boolean = false;
  isInMyGardenPlotInfoComponent: boolean = false;
  isInGardenOffers: boolean = false;

  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;


  constructor(private router: Router,
              private storageService: StorageService,
              private authService: AuthService,
              private socialAuthService: SocialAuthService,private breakpointObserver: BreakpointObserver, private topBarService: TopBarService) {
    this.router = router;
    this.authService = authService;
    this.storageService = storageService;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const urlSegments = this.router.url.split('/');
        this.isInGardenInfoComponent = urlSegments.includes('garden-info');
        this.isInHomeComponent = urlSegments.includes('home');
        this.isInMyGardenPlotInfoComponent = urlSegments.includes('my-garden-plot-info');
        this.isInCalendarComponent = urlSegments.includes('calendar');
        this.isInVotingComponent = urlSegments.includes('voting');
        this.isInGardenOffers = urlSegments.includes('garden-offers');
      }
    });
    this.breakpointObserver.observe('(max-width: 1250px)').subscribe(result => {
      this.isWideScreen = result.matches;
    });
  }

  isWideScreen = false;



  navigate(path: string) {
    this.router.navigate([path]);
  }

  isLoggedIn(): boolean {
    return this.storageService.getLoggedIn();
  }

  logout(): void {
    this.socialAuthService.signOut();
    this.authService.logout();
  }

  navigateToProfileComponent() {
    let id :number;
    this.topBarService.getMyProfile().subscribe((result: Profile) => {
      id = result.id;
      this.router.navigate(['/user-info', id]);
    });
  }

  protected readonly Role = Role;
}
