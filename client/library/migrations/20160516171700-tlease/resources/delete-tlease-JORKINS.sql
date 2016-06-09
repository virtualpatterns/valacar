DELETE
FROM    tLease
WHERE   cAddress = '192.168.2.201' AND
        cFrom = datetime($From) AND
        cTo = datetime($To) AND
        cDevice = '08:00:27:66:5c:05' AND
        cHost = 'JORKINS';
