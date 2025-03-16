import { Injectable, signal } from '@angular/core';
import { ErrorServiceService } from './error-service.service';

@Injectable({
  providedIn: 'root',
})
export class BleServiceService {
  private sensitivityCharacteristic: BluetoothRemoteGATTCharacteristic | undefined;
  private pressionCharacteristic: BluetoothRemoteGATTCharacteristic | undefined;

  private SENSITIVITY_SERVICE_UUID = '19b10020-e8f2-537e-4f6c-d104768a1214';
  private PRESSION_SERVICE_UUID = '19b10030-e8f2-537e-4f6c-d104768a1214';
  private SENSITIVITY_CHAR_UUID = '19b10021-e8f2-537e-4f6c-d104768a1214';
  private PRESSION_CHAR_UUID = '19b10031-e8f2-537e-4f6c-d104768a1214';
  

  constructor(private errorService : ErrorServiceService) {}

  private _isConnected = signal<boolean>(false);
  public get isConnected() {
    return this._isConnected();
  }
  async connect(): Promise<void> {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [this.SENSITIVITY_SERVICE_UUID, this.PRESSION_SERVICE_UUID],
      });

      const server = await device.gatt?.connect();

      if (!server) {
        this.errorService.setError("server setup error")
        return
      }

      const service = await server.getPrimaryService(this.SENSITIVITY_SERVICE_UUID);
      this.sensitivityCharacteristic = await service.getCharacteristic(this.SENSITIVITY_CHAR_UUID);

      const pressionService = await server.getPrimaryService(this.PRESSION_SERVICE_UUID);
      this.pressionCharacteristic = await pressionService.getCharacteristic(this.PRESSION_CHAR_UUID);

      this._isConnected.set(true)
    } catch (error) {
      this.errorService.setError('BLE Connection Error:'+ error)
    }
  }

}



