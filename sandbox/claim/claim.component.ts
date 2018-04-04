import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TableComponent } from '../table/table.component';
import { ActivatedRoute } from '@angular/router';
import { MerakiService } from '.././services/meraki.service'
import { MessageService } from '.././services/message.service';

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
  devicesAvailable: Boolean = false;

  /*
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
    private messageService: MessageService,
    private meraki: MerakiService) { }


  ngOnInit() {
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
    this.loading = true;
    this.meraki.listInventory(this.orgId).then(res => {
      console.log('onInit lisInventory: res => ', res)
      this.loading = false;
      this.inventory = res;

      //map data to rows and columns
      for (var prop in this.inventory[0]) {
        // skip loop if the property is from prototype
        if(!this.inventory[0].hasOwnProperty(prop)) continue;
        this.columns.push({
          name: prop
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
      this.onFilterUnclaimed();

    });
  }
 

  // Table Handlers

  onActivate(){
  }

  onSelect({ selected }) {
    console.log('Table onSelect selected', selected);
    this.devicesToAdd.splice(0, this.devicesToAdd.length);
    this.devicesToAdd.push(...selected);
    console.log('Claim onSelect this.devicesToAdd', this.devicesToAdd);  
  }

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

  onAddDevices(){
    this.meraki.addDevices(this.netId, this.devicesToAdd).then( res => {
      this.messageService.add("Devices Added");
      }).catch(error => {
        this.messageService.add("Device Add Error: "+ error)
      });
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
      this.getInventory ();
      }).catch(error => {
        this.messageService.add("Order Error: "+ error)
      });
  }
  onClaimSerial(event){
    this.meraki.claimOrder(this.orgId, {serial: event}).then( res => {
      this.messageService.add("Serial Claimed");
      this.getInventory ();
      }).catch(error => {
        this.messageService.add("Serial Error: "+ error)
      });
  }
  onClaimLicense(event){
    this.meraki.claimOrder(this.orgId, {
      licenseKey: event,
      licenseMode: 'addDevices'
    }).then( res => {
      this.messageService.add("License Claimed");
      }).catch(error => {
        this.messageService.add("License Error: "+ error)
      });;
  }

}
