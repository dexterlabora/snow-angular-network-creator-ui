import {Injectable, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../services/message.service';

@Injectable()
export class TableService implements OnInit {

        constructor(private http: HttpClient, private messageService: MessageService) { 
            this.baseUrl = '/api/now/table/x_170302_global_';
        }

        baseUrl: String;

        ngOnInit(): void {
            
  }

  listInventory = () => new Promise((resolve, reject) => {
      console.log('table listNetworks')
      this.http.get<any>(this.baseUrl+'inventory_meraki').subscribe( res => {
        console.log('listNetworks res.result: ', res.result)
        resolve(res.result);
      });
     
    });

  newInventory = (data: any) => new Promise((resolve, reject) => {
      console.log('table newNetwork data ', data);

      let tableData = {
        "network_name": data['name'],
        "sys_tags": data['tags'],
        "mac": data['mac'],
        "serial": data['serial'],
        "model": data['model'],
        "claimed_at": data['claimedAt'],
        "network_id": data['networkId'],
        "public_ip": data['publicIp']
      };
     
      this.http.post<any>(this.baseUrl+'inventory_meraki', tableData).subscribe(res => {
        console.log('table newInventory res.result: ', res.result)
        if(res.result.errors){
            let error = res.result.errors[0];
            console.log('table newInventory error: ', error)
            reject(error);
          }
          resolve(res.result);
        });
    });
}