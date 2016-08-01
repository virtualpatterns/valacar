SELECT  tDeviceHost.cDevice,
        tDeviceHost.cHost
FROM    tDeviceHost
WHERE   tDeviceHost.cDevice = $Device AND
        tDeviceHost.cHost = $Host;
