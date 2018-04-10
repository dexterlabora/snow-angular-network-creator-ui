import {Injectable, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../services/message.service';
import { TableService } from '../services/table.service';

@Injectable()
export class MerakiService implements OnInit {

constructor(
  private http: HttpClient, 
  private tableService: TableService,
  private messageService: MessageService) { 
    this.baseUrl = '/api/x_170302_global/meraki_proxy';
}

baseUrl: String;

ngOnInit(): void {
    
}

listOrganizations = () => new Promise((resolve, reject) => {
    console.log('meraki service: listOrganizations');
      this.http.get<any>(this.baseUrl+'/organizations').subscribe( res => {
        console.log('listOrganizations res.result: ', res.result)
        resolve(res.result);
      });
  });

listNetworks = (orgId:String) => new Promise((resolve, reject) => {
    console.log('listNetworks orgId ',orgId)
    if(orgId){
      this.http.get<any>(this.baseUrl+'/organizations/'+orgId+'/networks').subscribe( res => {
        console.log('listNetworks res.result: ', res.result)
        resolve(res.result);
      });
    }else{
      reject("error: invalid orgId: "+ orgId);
    }
  });

newNetwork = (orgId:String, data:any) => new Promise((resolve, reject) => {
    console.log('newNetwork orgId, data ',orgId, data);
    if(orgId){
      this.http.post<any>(this.baseUrl+'/organizations/'+orgId+'/networks', data).subscribe(res => {
        console.log('newNetwork res.result: ', res.result)
        if(res.result.errors){
            let error = res.result.errors[0];
            console.log('newNetwork error: ', error)
            reject(error);
          }
          resolve(res.result);
        });
    }else{
      reject("error: invalid orgId: "+ orgId);
    }
  });

listTemplates = (orgId: String) => new Promise((resolve, reject) => {
    console.log('listTemplates');
      this.http.get<any>(this.baseUrl+'/organizations/'+orgId+'/configTemplates').subscribe( res => {
        console.log('listTemplates res.result: ', res.result)
        resolve(res.result);
      });
  });

attachTemplate = (netId: String, data: any) => new Promise((resolve, reject) => {
    console.log('attachTemplate: netId, data ',netId, data);
    if(netId){
      this.http.post<any>(this.baseUrl+'/networks/'+netId+'/bind', data).subscribe(res => {
        console.log('attchTemplate: res.result', res.result)
        //resolve(res.result);
        if(res.result.errors){
            let error = res.result.errors[0];
            console.log('Template Attach Error: ', error)
            reject(error);
          }       
          resolve(res.result);
        });
    }else{
      reject("error: invalid netId: "+ netId);
    }
  });

listInventory = (orgId: String) => new Promise((resolve, reject) => {
    console.log('listInventory');
    if(orgId){
      this.http.get<any>(this.baseUrl+'/organizations/'+orgId+'/inventory').subscribe( res => {
        console.log('listInventory res.result: ', res.result)
        resolve(res.result);
      });
    }else{
      reject("error: invalid orgId: "+ orgId);
    }
  });


returnNetwork = (netId: String) => new Promise((resolve, reject) => {
    console.log('returnNetwork');
    if(netId){
      this.http.get<any>(this.baseUrl+'/networks/'+netId).subscribe( res => {
        console.log('returnNetwork res.result: ', res.result)
        resolve(res.result);
      });
    }else{
      reject("error: invalid netId: "+ netId);
    }
  });

claimOrder = (orgId: String, data: any) => new Promise((resolve, reject) => {
    console.log('claimOrder: orgId, data ',orgId, data);
    if(orgId){
      this.http.post<any>(this.baseUrl+'/organizations/'+orgId+'/claim', data).subscribe(res => {
        if(res.result.errors){
            let error = res.result.errors[0];
            console.log('claimOrder error: ', error)
            reject(error);
        }else{
            resolve(res.result);
        }
      });
    }else{
      reject("error: invalid orgid: "+ orgId);
    }
  });

  
// wrapper to handle multiple devices, prints messages and commits to ServiceNow table
async addDevices(networkId: String, devices: any) {
  for (let d in devices){
    let serial = devices[d]['serial'];
    console.log("Adding serial: ", serial);
    // call API and await for response before next call. This helps avoid rate limit issues... although a bit slow.
    await this.claimDevice(networkId, {serial}).then( res => {
      console.log("addDevices device claimed");
      this.messageService.add('Device Added: '+serial);
      // log device entry to table DB
      //this.tableService.newInventory({networkId, serial});
    }).catch(error => {
      this.messageService.add('Device Add Error: '+error);
    })
  }
}
 

  claimDevice = (netId: String, data: any) => new Promise((resolve, reject) => {
    console.log('claimDevice: netId, data ',netId, data);
    if(netId){
      this.http.post<any>(this.baseUrl+'/networks/'+netId+'/devices/claim', data).subscribe(res => {
        console.log('claimDevice: res.result', res.result);
        if(res.result.errors){
          let error = res.result.errors[0];
          console.log('claimDevice error: ', error);
          reject(error);
        }
        resolve(res.result);
      });
    }else{
      reject("error: invalid netId: "+ netId);
    }
  });

}

