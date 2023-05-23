import React, {useEffect, useState} from 'react';
import {BleManager} from 'react-native-ble-plx';
import {Button, View} from 'react-native';

const App = () => {
  const [manager, setManager] = useState(new BleManager());
  const [device, setDevice] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const subscription = manager.onStateChange(state => {
      if (state === 'PoweredOn') {
        scanAndConnect();
        subscription.remove();
      }
    }, true);
  }, []);

  const scanAndConnect = () => {
    setIsScanning(true);
    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.log(error);
        return;
      }

      if (scannedDevice.name === 'OBDII') {
        // Replace 'OBDII' with your actual device name
        manager.stopDeviceScan();
        setIsScanning(false);

        scannedDevice
          .connect()
          .then(device => {
            return device.discoverAllServicesAndCharacteristics();
          })
          .then(device => {
            setDevice(device);
          })
          .catch(error => {
            console.log(error);
          });
      }
    });
  };

  const sendCommandToObd = command => {
    // Assuming 'serviceUUID' and 'characteristicUUID' are the correct identifiers for your OBDII device.
    const serviceUUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
    const characteristicUUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

    if (!device) {
      console.log('No device is connected');
      return;
    }

    device
      .writeCharacteristicWithResponseForService(
        serviceUUID,
        characteristicUUID,
        command,
      )
      .then(characteristic => {
        console.log(characteristic.value); // this is the response from the OBDII device, in base64 format
      })
      .catch(error => {
        console.log(error);
      });
  };

  return (
    <View>
      <Button
        title="Connect to OBDII"
        onPress={scanAndConnect}
        disabled={isScanning}
      />
      <Button
        title="Send command to OBDII"
        onPress={() => sendCommandToObd('010D')}
      />
    </View>
  );
};

export default App;
