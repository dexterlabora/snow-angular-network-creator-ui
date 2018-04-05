

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MerakiService } from '.././services/meraki.service'
import { MessageService } from '.././services/message.service';
import { GlideService } from '.././services/glide.service';

//import { TzList } from '../../assets/tzlist';
//import * as variable from 'tzList';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  baseUrl: any;
  orgs: any;
  nets: any;
  orgId: any;
  inventory: any;
  templates: any;
  form: FormGroup;
  newNet: any;
  loading: Boolean;
  eventLog: any;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private router: Router, 
    private messageService: MessageService,
    private glideService: GlideService,
    //private tzlist: TzList,
    private meraki: MerakiService) { }
    

  ngOnInit() {
    // The base API route to Meraki services. This must go through a backend server or proxy because of CORS 
    // The URL is unique to the ServiceNow instance or alternative backend.
   // this.baseUrl = '/api/x_170302_global/meraki_proxy';

    // Event Log for debugging/status
    //this.eventLog = [];
    //this.tz = this.tzlist;

    // setup form
    this.form = this.fb.group({
      orgId: "",
      templateId: "",
      name: "",
      address: "",
      timeZone: "",
      tags: "",
      type: "wireless", // hard coded for now. Will figure out templates later.
      orderNumber: ""
    });

    // watch for state changes
    this.onChanges();

    // get Organizations, templates to fill form selection
    this.loading = true;
    this.meraki.listOrganizations().then(res => {
      console.log('home: listOrganizations: res => ', res)
      this.loading = false;
      this.orgs = res;
      // set default form org
      this.form.get('orgId').setValue(this.orgs[0].id);
    }).then(() => {
      this.loading = true;
      this.meraki.listTemplates(this.orgs[0].id).then(res => {
        console.log('home: listTemplates: res => ', res)
        this.loading = false;   
        this.templates = res;
      });
    });
  }

  onChanges(): void {
    this.form.get('orgId').valueChanges.subscribe(val => {
      this.orgId = this.form.get('orgId').value;
      console.log('orgId', this.orgId);

      // get templates for this org    
      this.meraki.listTemplates(this.orgId).then(res => {
        console.log("changes: listTemplates: res", res)
        this.templates = res;
      });
    });
  }

  onSubmit(f: FormGroup) {
    //this.form = f.value; // make a copy
    console.log('f.value', f.value);
    let merakiData =   {
      "name": f.value.name,
      "timeZone": f.value.timeZone,
      "tags": f.value.tags,
      "type": "wireless" // hard coded for now. Will figure out templates later.
    }
    console.log('merakiData ', merakiData);

    this.loading = true;
    this.meraki.newNetwork(f.value.orgId, merakiData).then(res => {
      this.loading = false;
      this.newNet = res;
      this.eventLog.push(res);
      console.log('this.newNet', this.newNet);
      this.messageService.add("Network Created: "+ this.newNet.id);
    }).then(() => {
      var data = {
        "configTemplateId": this.form.get('templateId').value,
        "autoBind": false
      };
      this.loading = true;
      this.meraki.attachTemplate(this.newNet.id, data).then(res => {
        // update network with template info
        this.meraki.returnNetwork(this.newNet.id).then(res => {
          this.newNet = res;
          this.loading = false;
          this.messageService.add("Template Attached: "+ this.newNet.configTemplateId);
          // save to Glide Table
          this.glideService.newNetwork(this.newNet);
        });
      }).catch(error => {
        this.messageService.add("Template Error: "+ error)
      });
    }).catch(error => {
      this.messageService.add("New Network Error: "+ error)
    });
    
  }

  onAddDevices(){
    this.router.navigateByUrl('/claim/'+this.orgId+'/'+this.newNet.id);
  }

  // Helper Functions

  epochUTC(utcSeconds){
    var d = new Date(utcSeconds*1000); // The 0 there is the key, which sets the date to the epoch
    return d;   
  }

}
