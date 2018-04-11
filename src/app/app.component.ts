import { Component, OnInit } from '@angular/core';
import { MessagesComponent } from './messages/messages.component'
import { ToasterService} from 'angular2-toaster';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  branding = 'Meraki Network Creator';

  private toasterService: ToasterService;
  constructor(
    toasterService: ToasterService
  ) { 
    this.toasterService = toasterService;
  }

  ngOnInit() {
    document.title = this.branding;
  }

  // for testing
  popToast() {
    this.toasterService.pop('success', 'Args Title', 'Args Body');
  }

}

