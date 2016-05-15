SELECT  tLease.*
FROM    tLease
WHERE   tLease.cFrom = tLease.cTo OR
        ( tLease.cFrom <= datetime('now') AND
          tLease.cTo > datetime('now') )
ORDER
BY      tLease.cFrom DESC;
