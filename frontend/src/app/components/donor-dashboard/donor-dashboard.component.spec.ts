import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonorDashboardComponent } from './donor-dashboard.component';

describe('DonorDashboardComponent', () => {
  let component: DonorDashboardComponent;
  let fixture: ComponentFixture<DonorDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DonorDashboardComponent]
    });
    fixture = TestBed.createComponent(DonorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
