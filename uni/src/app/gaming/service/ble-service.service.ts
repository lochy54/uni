import { computed, Injectable, signal } from '@angular/core';
import { BehaviorSubject, from, Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BleServiceService {
  private readonly PRESSION_SERVICE_UUID = '19b10030-e8f2-537e-4f6c-d104768a1214';
  private readonly PRESSION_CHAR_UUID = '19b10031-e8f2-537e-4f6c-d104768a1214';

  private _pressureSignal : ReplaySubject<number | undefined> = new ReplaySubject(undefined);

  public get pressureSignal() {
    return this._pressureSignal.asObservable();
  }

  private characteristic: BluetoothRemoteGATTCharacteristic | undefined = undefined;

  constructor() {}

  connect(): Observable<void> {
    return from(this._connect());
  }

  private async _connect(): Promise<void> {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [this.PRESSION_SERVICE_UUID],
      });
      device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Server setup error');
      }
      const pressionService = await server.getPrimaryService(this.PRESSION_SERVICE_UUID);
      this.characteristic = await pressionService.getCharacteristic(this.PRESSION_CHAR_UUID);
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', this.onPressureChanged.bind(this));

    } catch (error) {
      throw error;
    }
  }

  private onPressureChanged(event: Event) {
    if (this.characteristic) {
      const value = this.characteristic.value;
      if (value) {
        const pressure = this.convertPressure(value);
        this._pressureSignal.next(pressure);
      }
    }
  }

  private convertPressure(value: DataView): number {
    
    return Math.round(value.getFloat32(0, /* littleEndian = */ true)*1000)/1000;
  }


  private onDisconnected() {
    this._pressureSignal.next(undefined);  
    this.characteristic = undefined;  
}

}