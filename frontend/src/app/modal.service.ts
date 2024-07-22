import { Injectable, ComponentFactoryResolver, Injector, ApplicationRef, ComponentRef, EmbeddedViewRef } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalContainer: HTMLElement | null = null;
  private componentRef: ComponentRef<any> | null = null;
  private modalStateSubject = new Subject<any>();
  modalState$ = this.modalStateSubject.asObservable();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  private getModalContainer(): HTMLElement {
    if (!this.modalContainer) {
      this.modalContainer = document.createElement('div');
      document.body.appendChild(this.modalContainer);
    }
    return this.modalContainer;
  }

  openModal(component: any, data?: any) {
    const container = this.getModalContainer();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    const componentRef = componentFactory.create(this.injector);
    if (data) {
      Object.assign(componentRef.instance, data); // Pass data to component instance
    }
    this.appRef.attachView(componentRef.hostView);

    container.appendChild((componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0]);

    this.componentRef = componentRef;

    // Notify observers with modal state
    this.modalStateSubject.next(data);
  }

  closeModal() {
    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = null;
      this.getModalContainer().innerHTML = ''; // Clear modal container
    }
    this.modalStateSubject.next({ show: false });
  }
}
