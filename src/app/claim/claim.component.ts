import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MerakiService } from '.././services/meraki.service'
import { MessageService } from '.././services/message.service';
import { GlideService } from '.././services/glide.service';
import { TableService } from '.././services/table.service';
import { ToasterService} from 'angular2-toaster';

@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.css']
})
export class ClaimComponent implements OnInit {
  // subscribe to paramater values
  private sub: any;

  // url param supplied
  netId: String;
  orgId: String;
 
  // API results
  network: any = {
    id: String,
    name: String
  }; 
  inventory: any;

  // Form
  form: FormGroup;
  devicesToAdd: any = [];
  
  // Loader
  loading: Boolean;
  

  // Table
  rows: any = [];
  columns: any = [];
  //devicesAvailable: Boolean = false;

  /* Table Data Format (for reference)
  rows = [
    { serial: '1111-1234-1234', model: 'MR33', claimedAt: '12-12-15 4:15pm' },
    { serial: '2222-1234-1234', model: 'MR33', claimedAt: '12-12-15 4:15pm' },
    { serial: '3333-1234-1234', model: 'MR33', claimedAt: '12-12-15 4:15pm' },
  ];
  columns = [
    { name: 'serial' },
    { name: 'Model' },
    { name: 'Claimed At' }
  ];
  */

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute, 
    private router: Router, 
    private messageService: MessageService,
    private glideService: GlideService,
    private tableService: TableService,
    private toasterService: ToasterService, 
    private meraki: MerakiService) { 
      this.toasterService = toasterService;
    }


  ngOnInit() {
    // Table API test
    //this.tableService.listInventory().then(res => this.table);

    // Listen for URL netId parameter change and update state
    this.sub = this.route.params.subscribe(params => {
      this.netId = params['netId'];
      this.orgId = params['orgId'];
    })
    
    this.getNetwork();
    this.getInventory();
      
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  // Populate Data

  getNetwork() {
    this.loading = true;
    this.meraki.returnNetwork(this.netId).then(res => {
      console.log('onInit returnNetwork: res => ', res)
      this.loading = false;
      this.network = res;
    });
  }

  getInventory (){
    // get Inventory
    this.devicesToAdd = [];
    this.loading = true;
    this.meraki.listInventory(this.orgId).then(res => {
      console.log('onInit lisInventory: res => ', res)
      this.loading = false;
      this.inventory = res;

      // FILTER inventory
      // Remove networks bound to a network
      this.inventory = this.inventory.filter(i => i.networkId === null);
      // Remove networkId property
      this.inventory.forEach(i => { delete i.networkId });
      // Remove publicIp property
      this.inventory.forEach(i => { delete i.publicIp });
      
      console.log('onInit lisInventory Filtered: res => ', this.inventory);

      //map data to rows and columns
      this.columns = [];
      this.rows = [];
      for (var prop in this.inventory[0]) {
        // skip loop if the property is from prototype
        if(!this.inventory[0].hasOwnProperty(prop)) continue;
        this.columns.push({
          // insert a space before all caps, then capatilize everything
          name: prop.replace(/([A-Z])/g, ' $1').toUpperCase()      
        })
      }
      console.log('columns ', this.columns);
      this.rows = this.inventory;
   
      // format time
      for (var r in this.rows){
        this.rows[r].claimedAt = this.epochUTC(this.rows[r].claimedAt);
      }
      
      console.log("rows ", this.rows);

      // filter list
      //this.onFilterUnclaimed();

    });
  }
 

  // Table Handlers

  onActivate(){
  }

  isDevicesSelected(){
    if(this.devicesToAdd.length >0){return true}else{return false}
  }

  onSelect({ selected }) {
    console.log('Table onSelect selected', selected);
    this.devicesToAdd.splice(0, this.devicesToAdd.length);
    this.devicesToAdd.push(...selected);
    console.log('Claim onSelect this.devicesToAdd', this.devicesToAdd);  
  }

  /* Old Filters for full inventory. Removed because there is no use case. Performing filtering on initialization now.
  onFilterUnclaimed() {
    this.rows = this.inventory.filter(i => !i.networkId);
    console.log("filterUnclaimed rows: ", this.rows);
    this.devicesAvailable = true;
  }

  onFilterThisNet(){
    this.rows = this.inventory.filter(i => i.networkId == this.netId);
    console.log("filterThisNet rows: ", this.rows);
    this.devicesAvailable = false;
  }

  onFilterAll(){
    this.rows = this.inventory;
    console.log("onFilterALl rows: ", this.rows);
    this.devicesAvailable = false;
  }

  onButtonGroupClick($event){
    let clickedElement = $event.target || $event.srcElement;
    if( clickedElement.nodeName === "BUTTON" ) {
      let isCertainButtonAlreadyActive = clickedElement.parentElement.querySelector(".active");
      // if a Button already has Class: .active
      if( isCertainButtonAlreadyActive ) {
        isCertainButtonAlreadyActive.classList.remove("active");
      }
      clickedElement.className += " active";
    }
  }
  */

  /*
  checkSelectable(event) {
    console.log('Checking if selectable', event);
    if(!event.networkId){
      this.devicesAvailable = true;
      return true;
    }else{
      this.devicesAvailable = false;
    }
      return false;
  }
  */

  onAddDevices(){
    this.loading = true;
    this.meraki.addDevices(this.netId, this.devicesToAdd).then( res => {
      this.messageService.add("Device Add Complete");
      this.loading = false;
      //this.glideService.addDevices(this.netId, this.devicesToAdd);
      this.updateServiceNow();
      this.toasterService.pop('success', 'Devices Added');
      // refresh inventory list
      this.getInventory();
      }).catch(error => {
        this.loading = false;
        this.messageService.add("Device Add Error: "+ error)
        this.toasterService.pop('error', 'Devices Add Error', error);
      });
  }

  updateServiceNow(){
    // filter inventory for list of devices for this network
    let tableData = this.inventory.filter(i => i.networkId != this.netId);
    //this.tableService.newInventory(tableData).then(res => console.log("table DB updated")); // native table API
    console.log('updateServiceNow netId, tableData', this.netId, tableData)
    this.messageService.add("updateServiceNow...")
    this.loading = true;
    this.glideService.addDevices(this.netId, tableData).then(res => {
      this.loading = false;
      console.log("updateServiceNow glide table res", res)
      this.messageService.add("ok");
    }).catch(error => {
      this.loading = false;  
      this.messageService.add("updateServiceNow error: "+ error)
    });
  }

  onCreateNetwork(){
    this.router.navigateByUrl('/');
  }

  // Utility Functions
  epochUTC(utcSeconds){
    var d = new Date(utcSeconds*1000).toISOString().split('T')[0]; // The 0 there is the key, which sets the date to the epoch
    return d;   
  }

  // Add to Inventory 

  onClaimOrder(event){
    this.meraki.claimOrder(this.orgId, {order: event}).then( res => {
      this.messageService.add("Order Claimed");
      this.toasterService.pop('success', 'Order Claimed');
      this.getInventory ();
      }).catch(error => {
        this.messageService.add("Order Error: "+ error)
        this.toasterService.pop('error', 'Claim Error: '+ error);
      });
  }
  onClaimSerial(event){
    this.meraki.claimOrder(this.orgId, {serial: event}).then( res => {
      this.messageService.add("Serial Claimed");
      this.toasterService.pop('success', 'Serial Claimed');
      this.getInventory ();
      }).catch(error => {
        this.messageService.add("Serial Error: "+ error)
        this.toasterService.pop('error', 'Serial Error: '+ error);
      });
  }
  onClaimLicense(event){
    this.meraki.claimOrder(this.orgId, {
      licenseKey: event,
      licenseMode: 'addDevices'
    }).then( res => {
      this.messageService.add("License Claimed");
      this.toasterService.pop('success', 'License Claimed');
      }).catch(error => {
        this.messageService.add("License Error: "+ error);
        this.toasterService.pop('error', 'License Error: '+ error);
      });;
  }

}
