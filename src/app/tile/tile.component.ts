import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {


  @Input() width = 1;
  @Input() height = 1;
  @Input() gridStep = 50;
  @Input() background = 'red';
  @Input() item: any;

  constructor() { }

  ngOnInit(): void {
  }

}
