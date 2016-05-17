SELECT  tLease.cAddress,
        datetime(tLease.cFrom, 'localtime') AS cFrom,
        datetime(tLease.cTo, 'localtime')   AS cTo,
        tLease.cDevice                      AS cDevice,
        CASE
          WHEN NOT tHostTranslation.cTo IS NULL THEN
            tHostTranslation.cTo
          WHEN NOT tDeviceTranslation.cTo IS NULL THEN
            tDeviceTranslation.cTo
          ELSE
            tLease.cHost
        END                                 AS cHost
FROM    tLease
          LEFT OUTER JOIN tTranslation AS tDeviceTranslation ON
            tLease.cDevice = tDeviceTranslation.cFrom
          LEFT OUTER JOIN tTranslation AS tHostTranslation ON
            tLease.cHost = tHostTranslation.cFrom
WHERE   tLease.cFrom = tLease.cTo OR
        ( tLease.cFrom <= datetime('now') AND
          tLease.cTo > datetime('now') )
ORDER
BY      tLease.cTo ASC,
        tLease.cHost;
