/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';

interface Product {
  id: string;
  title: string;
}

@Component({
  selector: 'app-interface',
  templateUrl: './interface.page.html',
  styleUrls: ['./interface.page.scss'],
})
export class InterfacePage implements OnInit {
  products: Product[] = [
    {
      id: '1',
      title: '상품 1',
    },
    {
      id: '2',
      title: '상품 2',
    },
    {
      id: '3',
      title: '상품 3',
    },
  ];

  constructor() {}

  ngOnInit() {
    this.products.map((product: Product): Product => {
      product['isChecked'] = false;
      // return { ...product, isChecked: false };
      return product;
    });
  }
}
