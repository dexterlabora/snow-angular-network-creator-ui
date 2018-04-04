import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../services/message.service';

@Injectable()
export class GlideService {
 
  constructor(private http: HttpClient, private messageService: MessageService) { 
      this.baseUrl = '/api/x_170302_global/glide';
  }

  baseUrl: String;

  // API calls - Stores Meraki data into ServiceNow

  newNetwork = (data:any) => new Promise((resolve, reject) => {
    console.log('glide newData data ',data);
      this.http.post<any>(this.baseUrl+'/networks/new', data).subscribe(res => {
        console.log('glide newNetwork res.result: ', res.result)
        if(res.result.errors){
            let error = res.result.errors[0];
            console.log('glide newNetwork error: ', error)
            reject(error);
          }
          resolve(res.result);
        });
  });
  

  addDevices = (netId: String, data: any) => new Promise((resolve, reject) => {
    console.log('glide claimDevice: netId, data ',netId, data);
    if(netId){
      this.http.post<any>(this.baseUrl+'/networks/'+netId+'/devices/claim', data).subscribe(res => {
        console.log('glide claimDevice: res.result', res.result);
        if(res.result.errors){
          let error = res.result.errors[0];
          console.log('glide claimDevice error: ', error);
          reject(error);
        }
        resolve(res.result);
      });
    }else{
      reject("error: invalid netId: "+ netId);
    }
  });

 // network: any = {}


  /*
  network = {
    name: 
    id: 
    tags:
    timeZone:
    type:
    configTemplateId:
    devices: [
      {serial: ''},
      {serial: ''},
    ]
  }
*/

/*
POST glide/organizations/{{organizationId}}/networks

{
    "id": "N_646829496481143981",
    "organizationId": "549236",
    "type": "wireless",
    "name": "test - postman - 1113",
    "timeZone": "Europe/Amsterdam",
    "tags": " test "
    "configTemplateId"
}

PUT glide/networks/{{networkId}}

devices = {
  {serial: 1234},
  {serial: 2345}
}
*/


}