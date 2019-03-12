import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[clickGeneratedLink]'
  })

export class ClickGeneratedLinkDirective {
  constructor() {}

  @HostListener('click', ["$event"]) onClick(event) {
    this.openGeneratedLinkUrl(event);
  }

  // this method is designed to open links in system browser
  private openGeneratedLinkUrl(event: any) {
    const element = event.target;
    if (element.tagName === 'A') {
      event.preventDefault();
      const url = /(http|https|file|ftp):\/\//.test(element.innerHTML) ? element.innerHTML : 'http://' + element.innerHTML;
      window.open(url, '_system', 'location=yes');
    }
  }
}
