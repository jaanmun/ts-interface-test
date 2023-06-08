import { Component, OnInit } from '@angular/core';
import { DbService } from 'src/services/db.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(private db: DbService) {}

  ngOnInit() {
    this.db.collection$('users').subscribe((data) => {
      console.log(data);
    });
  }
}
