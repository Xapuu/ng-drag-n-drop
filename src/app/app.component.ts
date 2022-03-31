import { CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';

export interface IGridItem {
  y: number;
  x: number;
  width: number;
  height: number;
  id: number;
  type?: 'REGULAR' | 'PLACEHOLDER';
  [key: string]: any;
}

const GRID_CONFIG = {
  gridStep: 100,
  width: 1200,
  height: 800,
};

function floorToGrid(coordinates: number) {
  return Math.floor(coordinates / GRID_CONFIG.gridStep) * GRID_CONFIG.gridStep;
}

function xBoundry(coordinates: number) {
  return Math.floor(coordinates / GRID_CONFIG.gridStep) * GRID_CONFIG.gridStep;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'drag-n-drop';
  backgroundSize = `${GRID_CONFIG.gridStep / 10}px ${
    GRID_CONFIG.gridStep / 10
  }px, ${GRID_CONFIG.gridStep / 10}px ${GRID_CONFIG.gridStep / 10}px, ${
    GRID_CONFIG.gridStep
  }px ${GRID_CONFIG.gridStep}px, ${GRID_CONFIG.gridStep}px ${
    GRID_CONFIG.gridStep
  }px, ${GRID_CONFIG.gridStep}px ${GRID_CONFIG.gridStep}px, ${
    GRID_CONFIG.gridStep
  }px ${GRID_CONFIG.gridStep}px, ${GRID_CONFIG.gridStep}px ${
    GRID_CONFIG.gridStep
  }px, ${GRID_CONFIG.gridStep}px ${GRID_CONFIG.gridStep}px`;

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
      color: 'orange',
      id: Math.random(),
    },
    {
      y: 0,
      x: 5 * GRID_CONFIG.gridStep,
      width: 4,
      height: 2,
      label: 'Tile 2',
      color: 'blue',
      id: Math.random(),
    },
    {
      y: 2 * GRID_CONFIG.gridStep,
      x: 5 * GRID_CONFIG.gridStep,
      width: 4,
      height: 1,
      label: 'Tile 3',
      color: 'red',
      id: Math.random(),
    },
  ];

  affectedItems: IGridItem[] = [];

  alignItems(box1: any, box2: any) {
    const box1xStart = floorToGrid(box1.x);
    const box1xEnd = floorToGrid(box1.x + box1.width * this.gridStep);

    const box2xStart = floorToGrid(box2.x);
    const box2xEnd = floorToGrid(box2.x + box2.width * this.gridStep);

    //** No cross on X axis */
    if (box2xStart > box1xEnd) {
      return false;
    }

    if (box2xStart < box1xEnd) {
      if (box2xStart > box1xStart + (box1.width * this.gridStep) / 2) {
        box2.x = box1xEnd;
      } else {
        box1.x = box2xEnd;
      }

      return true;
    }

    if (box2xEnd > box1xStart && box2xStart < box1xEnd) {
      box1.x = box2xEnd;
      return true;
    }

    return false;
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
          unstable = alignResult;
        }
      });
    });

    if (unstable) {
      this.calcLoop(items);
    }
  }

  /**
   * check if item 1 and item 2 have crossing points
   * @param item1 item 1 / dropped item
   * @param item2 item 2
   */
  checkCrossing(item1: IGridItem, item2: IGridItem) {
    if (item1.x >= item2.x + item2.width * GRID_CONFIG.gridStep) {
      return false;
    }

    if (item1.x + item1.width * GRID_CONFIG.gridStep <= item2.x) {
      return false;
    }

    if (item1.y >= item2.y + item2.height * GRID_CONFIG.gridStep) {
      return false;
    }

    if (item1.y + item1.height * GRID_CONFIG.gridStep <= item2.y) {
      return false;
    }

    return true;
  }

  // Check for any boxes above the current
  checkXCrossingTop(item1: IGridItem, item2: IGridItem) {
    if (item1.x >= item2.x + item2.width * GRID_CONFIG.gridStep) {
      return false;
    }

    if (item1.x + item1.width * GRID_CONFIG.gridStep <= item2.x) {
      return false;
    }

    if (item1.y + item1.height * GRID_CONFIG.gridStep <= item2.y) {
      return false;
    }

    return true;
  }

  checkElevation(item: IGridItem, items: IGridItem[]) {
    let filteredValue = items
      .filter((x) => x.id !== item.id)
      .filter((ofItems) => this.checkXCrossingTop(item, ofItems));

    let nearestVerticalItem = filteredValue.sort(
      (a, b) =>
        b.y +
        b.height * GRID_CONFIG.gridStep -
        (a.y + a.height * GRID_CONFIG.gridStep)
    );

    console.log(nearestVerticalItem, '<<');
    const virtualItem = {
      y: nearestVerticalItem.length ? nearestVerticalItem[0] : 0,
      x: item.x,
      width: item.width,
      height: item.height,
      id: null,
    };

    console.log(filteredValue);

    item.y = nearestVerticalItem.length ? (nearestVerticalItem[0].y + nearestVerticalItem[0].height * GRID_CONFIG.gridStep) : 0;
  }

  moveTo(item: IGridItem, items: IGridItem[]) {
    // 0. Find all items that will be affected
    const crossing = items
      .filter((x) => x.id !== item.id)
      .filter((ofItems) => this.checkCrossing(item, ofItems));

    // 1. Decide the new position of the affected items

    crossing.forEach((crossedItem) => {
      crossedItem.y = item.y + item.height * GRID_CONFIG.gridStep;

      this.moveTo(
        crossedItem,
        crossing.filter((x) => x.id !== crossedItem.id)
      );
    });

    this.checkElevation(item, items);

    // crossing.forEach((crossedItem) => {
    //   const pastHalfOnXAxis =
    //     item.x - crossedItem.x < (crossedItem.width * GRID_CONFIG.gridStep) / 2;

    //   if (pastHalfOnXAxis) {
    //     item.x = crossedItem.x + crossedItem.width * GRID_CONFIG.gridStep;
    //   } else {
    //     item.x = crossedItem.x;
    //     crossedItem.x = item.x + item.width * GRID_CONFIG.gridStep;
    //   }
    // });

    // 2. Find all affected and push them to a storage

    // 3. For each item in the storage do 1 & 2 (e.g. call move-around)
  }

  handleDrop(e: CdkDragEnd, id: number) {
    const focusedItem = this.items.find((x) => x.id === id) as IGridItem;
    focusedItem.x = floorToGrid(focusedItem.x + e.distance.x);
    focusedItem.y = floorToGrid(focusedItem.y + e.distance.y);

    if (focusedItem.x < 0) {
      focusedItem.x = 0;
    }

    if (focusedItem.y < 0) {
      focusedItem.y = 0;
    }

    this.items = this.items.filter((x) => x.type !== 'PLACEHOLDER');
    // Removes the placeholder

    this.moveTo(focusedItem, this.items);

    this.items.forEach(x => {
      this.moveTo(x, this.items.filter(s => s.id !== x.id))
    })
  }

  handleMove(e: CdkDragMove, i: number) {
    // console.log(e);
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

  dragStart(e: CdkDragStart, i: number) {
    const copy = { ...this.items.find(x => x.id === i), type: 'PLACEHOLDER', id: 0 };

    this.items.unshift(copy as IGridItem);
  }

  // Sets the the height and width to the minimal rectangular shape
  trimGrid() {
    let maxHeight = 0;
    let maxWidth = 0;
    this.items.forEach((item) => {
      const itemWidth = item.x + item.width * this.gridStep;
      maxWidth = itemWidth > maxWidth ? itemWidth : maxWidth;
      const itemHeight = item.y + item.height * this.gridStep;
      maxHeight = itemHeight > maxHeight ? itemHeight : maxHeight;
    });

    this.height = maxHeight;
    this.width = maxWidth;
  }

  expand() {
    this.height = this.height + 200;
  }
}
