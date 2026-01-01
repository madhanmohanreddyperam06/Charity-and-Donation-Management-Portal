import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Contribution } from '../../models/donation.model';

@Component({
  selector: 'app-contribution-details-dialog',
  templateUrl: './contribution-details-dialog.component.html',
  styleUrls: ['./contribution-details-dialog.component.scss']
})
export class ContributionDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ContributionDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { contribution: Contribution }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
