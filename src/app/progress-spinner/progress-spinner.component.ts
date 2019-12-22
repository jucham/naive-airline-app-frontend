import {Component, DoCheck, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {ProgressSpinnerMode, ThemePalette} from '@angular/material';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';

@Component({
  selector: 'app-progress-spinner',
  templateUrl: './progress-spinner.component.html',
  styleUrls: ['./progress-spinner.component.css']
})
export class ProgressSpinnerComponent implements OnInit, DoCheck {
  @Input() color?: ThemePalette;
  @Input() diameter = 100;
  @Input() mode?: ProgressSpinnerMode;
  @Input() displayProgressSpinner: boolean;

  @ViewChild('progressSpinnerRef', {static: true})
  private progressSpinnerRef: TemplateRef<any>;
  private overlayRef: OverlayRef;

  constructor(private vcRef: ViewContainerRef, private overlay: Overlay) {
  }

  ngOnInit() {
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
    });
  }

  ngDoCheck() {
    if (this.displayProgressSpinner && !this.overlayRef.hasAttached()) {
      this.overlayRef.attach(new TemplatePortal(this.progressSpinnerRef, this.vcRef));
    } else if (!this.displayProgressSpinner && this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }
  }
}
