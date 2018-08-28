import { Component, OnInit } from '@angular/core';

class Credentials {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials = new Credentials();

  constructor() { }

  ngOnInit() {
  }

}
