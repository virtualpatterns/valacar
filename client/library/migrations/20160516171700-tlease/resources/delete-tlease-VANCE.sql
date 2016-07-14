DELETE
FROM    tLease
WHERE   cAddress = '192.168.2.200' AND
        cFrom = datetime($From) AND
        cTo = datetime($To) AND
        cDevice = '08:00:27:08:67:43' AND
        cHost = 'VANCE';
