SELECT  tLease.cAddress,
        tLease.cFrom,
        tLease.cTo,
        tLease.cDevice,
        tLease.cHost
FROM    tLease
ORDER
BY      tLease.cHost,
        tLease.cFrom DESC;
