import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { Sort } from './sort';

@Directive({
  selector: '[appSort]'
})
export class SortDirective {
  @Input() appSort: Array<any>|any;
  constructor(private renderer: Renderer2, private targetElem: ElementRef) { }

  @HostListener("click")
  sortData() {
      //create Object of sort Class
      const sort = new Sort();
      const elem = this.targetElem.nativeElement;
      const order = elem.getAttribute("data-order");
      const type = elem.getAttribute("data-type");
      const property = elem.getAttribute("data-name");

      if (order === "desc") {
          this.appSort.sort(sort.startSort(property, order, type));
          elem.setAttribute("data-order", "asc");
      } else {
          this.appSort.sort(sort.startSort(property, order, type));
          elem.setAttribute("data-order", "desc");
      }
  }
}
