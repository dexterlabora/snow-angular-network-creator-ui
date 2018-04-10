

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MerakiService } from '.././services/meraki.service'
import { MessageService } from '.././services/message.service';
import { GlideService } from '.././services/glide.service';
import { TableService } from '.././services/table.service';

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
  eventLog: any;
  modal: Boolean = true;
  
  // testing table API
  table: any;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private router: Router, 
    private messageService: MessageService,
    private glideService: GlideService,
    private tableService: TableService,
    private meraki: MerakiService) { }
    

  ngOnInit() {
    this.tableService.listInventory().then(res => this.table);

    // setup form
    this.form = this.fb.group({
      orgId: "",
      templateId: "",
      name: "",
      address: "",
      timeZone: "",
      tags: "",
      type: "wireless" // hard coded for now. Will figure out templates later.
    });

    // watch for state changes
    this.onChanges();

    // get Organizations, templates to fill form selection
    this.loading = true;
    this.messageService.add("Loading Organizations...");
    this.meraki.listOrganizations().then(res => {
      this.messageService.add("ok");
      console.log('home: listOrganizations: res => ', res)
      this.loading = false;
      this.orgs = res;
      // set default form org
      this.form.get('orgId').setValue(this.orgs[0].id);
    }).then(() => {
      this.loading = true;
      this.messageService.add("Loading Templates...");
      this.meraki.listTemplates(this.orgs[0].id).then(res => {
        console.log('home: listTemplates: res => ', res)
        this.messageService.add("ok");
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
    console.log('f.value', f.value);
    let merakiData =   {
      "name": f.value.name,
      //"timeZone": f.value.timeZone, // applied via template
      "tags": f.value.tags,
      "type": "wireless switch appliance" // hard coded for now. Will figure out templates later.
    }
    console.log('merakiData ', merakiData);

    this.loading = true;
    this.messageService.add("Creating Network...");
    this.meraki.newNetwork(f.value.orgId, merakiData).then(res => {
      this.loading = false;
      this.newNet = res;
      console.log('newNetwork this.newNet', this.newNet);
      this.messageService.add("Network Created: "+ this.newNet.id);
    }).then(() => {
      var merakiData = {
        "configTemplateId": this.form.get('templateId').value,
        "autoBind": false
      };
      this.loading = true;
      this.messageService.add("Attaching Template...(this could take a while)..");
      this.meraki.attachTemplate(this.newNet.id, merakiData).then(res => {
        // update final results with template info and address
        this.meraki.returnNetwork(this.newNet.id).then(res => {
          this.newNet = res;
          this.loading = false;
          this.newNet.address = f.value.address;
          console.log('final this.newNet', this.newNet);
          this.messageService.add("Template Attached: "+ this.newNet.configTemplateId);
          // save to Glide Table
          //this.glideService.newNetwork(this.newNet);
        });
      }).catch(error => {
        this.loading = false;
        this.messageService.add("Template Error: "+ error)
      });
    }).catch(error => {
      this.loading = false;  
      this.messageService.add("New Network Error: "+ error)
    });
    
  }

  onAddDevices(){
    this.router.navigateByUrl('/claim/'+this.orgId+'/'+this.newNet.id);
  }

  // Helper Functions

  epochUTC(utcSeconds){
    var d = new Date(utcSeconds*1000);
    return d;   
  }

}
