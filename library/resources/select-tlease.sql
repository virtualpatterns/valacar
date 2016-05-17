SELECT  tLease.cAddress,
        datetime(tLease.cFrom, 'localtime') AS cFrom,
        datetime(tLease.cTo, 'localtime')   AS cTo,
        tLease.cDevice,
        tLease.cHost
FROM    tLease
WHERE   tLease.cFrom = tLease.cTo OR
        ( tLease.cFrom <= datetime('now') AND
          tLease.cTo > datetime('now') )
ORDER
BY      tLease.cTo ASC,
        tLease.cHost;
