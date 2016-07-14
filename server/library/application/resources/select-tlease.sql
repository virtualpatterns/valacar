SELECT  tLease.cAddress                     AS [address],
        datetime(tLease.cFrom, 'localtime') AS [from],
        datetime(tLease.cTo, 'localtime')   AS [to],
        tLease.cDevice                      AS [device],
        CASE
          WHEN NOT tDeviceTranslation.cTo IS NULL THEN
            tDeviceTranslation.cTo
          WHEN NOT tHostTranslation.cTo IS NULL THEN
            tHostTranslation.cTo
          ELSE
            tLease.cHost
        END                                 AS [host],
        tLease.cInserted                    AS [inserted]
FROM    tLease
          LEFT OUTER JOIN tTranslation AS tDeviceTranslation ON
            tLease.cDevice = tDeviceTranslation.cFrom
          LEFT OUTER JOIN tTranslation AS tHostTranslation ON
            tLease.cHost = tHostTranslation.cFrom
WHERE   ( tLease.cFrom = tLease.cTo OR
          ( tLease.cFrom <= datetime('now') AND
            tLease.cTo > datetime('now') ) ) AND
        NOT EXISTS (  SELECT  tLeaseExpiring.cAddress,
                              tLeaseExpiring.cFrom,
                              tLeaseExpiring.cFrom
                      FROM    tLease AS tLeaseExpiring
                      WHERE   tLeaseExpiring.cAddress = tLease.cAddress AND
                              NOT tLeaseExpiring.cFrom = tLease.cFrom AND
                              NOT tLeaseExpiring.cTo = tLease.cTo AND
                              tLeaseExpiring.cFrom >= tLease.cFrom AND
                              tLeaseExpiring.cFrom < tLease.cTo )
ORDER
BY      tLease.cTo ASC,
        tLease.cHost;
