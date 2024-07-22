import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyboxComponent } from './verifybox.component';

describe('VerifyboxComponent', () => {
  let component: VerifyboxComponent;
  let fixture: ComponentFixture<VerifyboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyboxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
