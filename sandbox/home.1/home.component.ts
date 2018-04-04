import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  users: any;
  orgs: any;
  nets: any;
  form: any;
  newNet: any;

  constructor(
    private http: HttpClient) { 
      this.form = {
        "name": "",
        "timeZone": "",
        "tags": "",
        "type": "wireless" // hard coded for now. Will figure out templates later.
      }
    }

    onSubmit(f: NgForm) {
      this.form = f.value; // make a copy
      console.log('this.form', this.form);
      let merakiData =   {
        "name": this.form.name,
        "timeZone": this.form.timeZone,
        "tags": this.form.tags,
        "type": "wireless" // hard coded for now. Will figure out templates later.
      }
      console.log('merakiData ', merakiData);

      this.http.post<any>('/api/x_170302_global/networks', merakiData).subscribe(res => {
          this.newNet = res.result;
          console.log('this.newNet', this.newNet);
        });
    }

    ngOnInit() {
      // make an api call. Treat the "HttpClient" service just as you would the standard Http service.
      this.http.get<any>('/api/now/table/sys_user?sysparm_fields=first_name,last_name,email,sys_created_on').subscribe( res => {

        // let's take the response, parse the dates and store it in a users array
        this.users = res.result.map( user => {
          user.sys_created_on = new Date(user.sys_created_on);
          return user;

        // a quick and dirty sort...
        }).sort( (a,b) => `${a.first_name}${a.last_name}` < `${b.first_name}${b.last_name}` ? - 1 : 1);

      });

      this.http.get<any>('/api/x_170302_global/organizations').subscribe( res => {
        console.log('results: res => ', res.result)
        this.orgs = res.result;
      });

      this.http.get<any>('/api/x_170302_global/networks').subscribe( res => {
        console.log('results: res => ', res.result)
        this.nets = res.result;
      });
    }

}
