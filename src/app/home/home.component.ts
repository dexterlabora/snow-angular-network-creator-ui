

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MerakiService } from '.././services/meraki.service'
import { MessageService } from '.././services/message.service';
import { GlideService } from '.././services/glide.service';
import { TableService } from '.././services/table.service';
import { ToasterService} from 'angular2-toaster';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  orgs: any;
  nets: any;
  orgId: any;
  inventory: any;
  templates: any;
  form: FormGroup;
  newNet: any = {};
  loading: Boolean;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private router: Router, 
    private messageService: MessageService,
    private glideService: GlideService,
    private tableService: TableService, //native table API
    private toasterService: ToasterService, 
    private meraki: MerakiService) {
      this.toasterService = toasterService;
     }
    

  ngOnInit() {
    //this.tableService.listInventory().then(res => this.table); //native table API

    // setup form
    this.form = this.fb.group({
      orgId: "",
      templateId: "",
      name: "",
      address: "",
      timeZone: "",
      tags: "",
      type: ""
    });

    // watch for state changes
    this.onChanges();

    // get Organizations, templates to fill form selection
    this.getOrgs();
  }

  onChanges(): void {
    this.form.get('orgId').valueChanges.subscribe(val => {
      this.orgId = this.form.get('orgId').value;
      console.log('orgId', this.orgId);

      // get templates for this org    
      this.getTemplates();
    });
  }

  onSubmit(f: FormGroup) {
    console.log('f.value', f.value);

    // Create Network
    let merakiData =   {
      "name": f.value.name,
      "tags": f.value.tags,
      "type": "wireless switch appliance" // hard coded for now. 
    }
    console.log('merakiData ', merakiData);
    this.loading = true;
    this.messageService.add("Creating Network...");
    this.meraki.newNetwork(f.value.orgId, merakiData).then(res => {
      this.newNet = res;
      this.loading = false; 
      console.log('newNetwork this.newNet', this.newNet);
      this.messageService.add("Network Created: "+ this.newNet.id);
    }).then(() => {
      // Attach Template
      var merakiData = {
        "configTemplateId": f.value.templateId,
        "autoBind": false
      };
      this.loading = true;
      console.log('newNetwork attaching Template merakiData', merakiData);
      this.messageService.add("Attaching Template...(this could take a while).."+ f.value.templateId);
      this.meraki.attachTemplate(this.newNet.id, merakiData).then(res => {
        // update final results with template info and address
        this.meraki.returnNetwork(this.newNet.id).then(res => {
          this.newNet = res;
          this.loading = false;
          this.toasterService.pop('success', 'Network Created');
          this.newNet.address = f.value.address;
          console.log('final this.newNet', this.newNet);
          this.messageService.add("Template Attached: "+ this.newNet.configTemplateId);
          // save to Glide Table
          // this.glideService.newNetwork(this.newNet); // Native API method
          this.updateServiceNow();
        });
      }).catch(error => {
        this.loading = false;
        this.toasterService.pop('error', 'Template Error', error);
        this.messageService.add("Template Error: "+ error)
      });
    }).catch(error => {
      this.loading = false;  
      this.toasterService.pop('error', 'Network Creation Error', error);
      this.messageService.add("New Network Error: "+ error)
    });
    
  }

  // API Handlers
  getOrgs(){
    this.loading = true;
    this.messageService.add("Loading Organizations...");
    this.meraki.listOrganizations().then(res => {
      this.messageService.add("ok");
      console.log('home: listOrganizations: res => ', res)
      this.loading = false;
      this.orgs = res;
      // set default form org
      this.form.get('orgId').setValue(this.orgs[0].id);
    });
  }

  getTemplates(){
    this.loading = true;
    this.messageService.add("Loading Templates...");
    this.meraki.listTemplates(this.orgs[0].id).then(res => {
      console.log('home: listTemplates: res => ', res)
      this.messageService.add("ok");
      this.loading = false;   
      this.templates = res;
    });
  }


  // Commit updates to ServiceNow 
  updateServiceNow(){
    console.log('updateServiceNow newNet', this.newNet)
    this.messageService.add("Updating ServiceNow DB...");
    this.glideService.newNetwork(this.newNet).then(res => {
      console.log("updateServiceNow glide table updated with newNet res", res)
      this.messageService.add("ok");
    }).catch(err => {
      console.log("updateServiceNow error", err)
      this.messageService.add(err);
    });
  }

  // Helper Function
  epochUTC(utcSeconds){
    var d = new Date(utcSeconds*1000);
    return d;   
  }

  // Navigation
  onAddDevices(){
    this.router.navigateByUrl('/claim/'+this.orgId+'/'+this.newNet.id);
  }

}
