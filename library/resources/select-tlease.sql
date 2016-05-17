SELECT  tLease.cAddress,
        tLease.cFrom,
        tLease.cTo,
        tLease.cDevice,
        tLease.cHost
FROM    tLease
WHERE   ( tLease.cFrom = datetime($From) AND
          tLease.cTo = datetime($To)) OR
        ( tLease.cFrom <= datetime('now') AND
          tLease.cTo > datetime('now') )
ORDER
BY      tLease.cTo DESC;
