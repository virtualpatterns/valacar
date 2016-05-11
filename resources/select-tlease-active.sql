SELECT  tLease.*
FROM    tLease
WHERE   tLease.cTo IS NULL OR
        ( tLease.cFrom <= datetime('now') AND
          tLease.cTo > datetime('now') )
ORDER
BY      tLease.cFrom DESC;
