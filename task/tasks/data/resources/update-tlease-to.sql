UPDATE  tLease
SET     cTo = datetime(cTo, $Duration)
WHERE   ( tLease.cFrom <= datetime('now') AND
          tLease.cTo > datetime('now') ) AND
        NOT EXISTS (  SELECT  tLeaseExpiring.cAddress,
                              tLeaseExpiring.cFrom,
                              tLeaseExpiring.cFrom
                      FROM    tLease AS tLeaseExpiring
                      WHERE   tLeaseExpiring.cAddress = tLease.cAddress AND
                              NOT tLeaseExpiring.cFrom = tLease.cFrom AND
                              NOT tLeaseExpiring.cTo = tLease.cTo AND
                              tLeaseExpiring.cFrom >= tLease.cFrom AND
                              tLeaseExpiring.cFrom < tLease.cTo );
