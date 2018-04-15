import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IUser } from '../../../../api/src/models/iuser';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent {

  users: IUser[];

  constructor(private http: HttpClient) {
    http.get('/api/welcome/getall').toPromise().then((users: IUser[]) => {
      this.users = users;
    });
  }
}
