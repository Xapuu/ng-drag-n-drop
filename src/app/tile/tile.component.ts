import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {


  @Input() width = 1;
  @Input() height = 1;
  @Input() background = 'red';

  constructor() { }

  ngOnInit(): void {
  }

}
