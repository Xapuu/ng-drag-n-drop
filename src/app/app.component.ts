import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';

export interface IGridItem {
  y: number;
  x: number;
  width: number;
  height: number;
  [key: string]: any;
}

const GRID_CONFIG = {
  gridStep: 50,
  width: 600,
  height: 400
}


function floorToGrid(coordinates: number) {
  return Math.floor(coordinates / GRID_CONFIG.gridStep) * GRID_CONFIG.gridStep;
}

function xBoundry(coordinates: number) {
  return Math.floor(coordinates / GRID_CONFIG.gridStep) * GRID_CONFIG.gridStep;
}



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'drag-n-drop';

  gridStep = GRID_CONFIG.gridStep;
  height = GRID_CONFIG.height;
  width = GRID_CONFIG.width;

  items: IGridItem[] = [
    {
      y: 0,
      x: 0,
      width: 5,
      height: 2,
      label: 'Tile1',
      color: 'orange'
    },
    // {
    //   y: 0,
    //   x: 5 * 50,
    //   width: 2,
    //   height: 1,
    //   label: 'Tile 2',
    //   color: 'blue'
    // },
    {
      y: 0,
      x: 5 * this.gridStep + 2 * this.gridStep,
      width: 2,
      height: 1,
      label: 'Tile 3',
      color: 'red'
    }
  ];


  alignItems(box1: any, box2: any) {
    const box1xStart = floorToGrid(box1.x);
    const box1xEnd = (floorToGrid(box1.x + box1.width * this.gridStep));

    const box2xStart = floorToGrid(box2.x);
    const box2xEnd = floorToGrid(box2.x + box2.width * this.gridStep);


    //** No cross on X axis */
    if (box2xStart > box1xEnd) {
      return false
    }

    if (box2xStart < box1xEnd) {
      if (box2xStart > box1xStart + box1.width * this.gridStep / 2) {
        box2.x = box1xEnd;
      } else {
        box1.x = box2xEnd
      }

      return true
    }

    if (box2xEnd > box1xStart && box2xStart < box1xEnd) {
      box1.x = box2xEnd;
      return true
    }

    return false
  }

  calcLoop(items: any[]) {

    let unstable = false;
    this.items.forEach((outerItem, outerIdx) => {
      this.items.slice(outerIdx + 1).forEach((innerItem) => {
        /**
         * Dont compare with itself
         */
        // Add rule outerIndex > innerIndex // items.slice(outerIndex)
        // if (outerIdx === innerIdx) {
        //   return
        // };

        const alignResult = this.alignItems(outerItem, innerItem);
        if (alignResult) {
          unstable = alignResult
        }
      })
    })

    if (unstable) {
      this.calcLoop(items)
    }
  }



  handleDrop(e: CdkDragEnd, i: number) {
    console.log(i)
    console.log(e)


    this.items[i].x = floorToGrid(this.items[i].x + e.distance.x);
    this.items[i].y = floorToGrid(this.items[i].y + e.distance.y);

    this.calcLoop(this.items);


    // this.trimGrid();

  }

  handleMove(e: CdkDragMove, i: number) {
    console.log(e)



    // Expand box logic
    // const draggedItem = this.items[i];
    // const currentX = draggedItem.x + e.distance.x;
    // const currentY = draggedItem.y + e.distance.y;

    // if ((currentX + draggedItem.width * 50) > this.width) {
    //   this.width = this.width + this.gridStep;
    // }
    // if ((currentY + draggedItem.height * 50) > this.height) {
    //   this.height = this.height + this.gridStep;
    // }


  }

  trimGrid() {
    let maxHeight = 0;
    let maxWidth = 0;
    this.items.forEach(item => {
      const itemWidth = item.x + item.width * this.gridStep;
      maxWidth = itemWidth > maxWidth ? itemWidth : maxWidth;
      const itemHeight = item.y + item.height * this.gridStep;
      maxHeight = itemHeight > maxHeight ? itemHeight : maxHeight;
    })

    this.height = maxHeight;
    this.width = maxWidth;
  }

  expand() {
    this.height = this.height + 200;
  }
}
