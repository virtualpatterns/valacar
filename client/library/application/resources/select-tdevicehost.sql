SELECT  tDeviceHost.cDevice,
        tDeviceHost.cHost,
        datetime(tDeviceHost.cInserted, 'localtime')  AS [cInserted]
FROM    tDeviceHost
ORDER
BY      tDeviceHost.cDevice ASC;
