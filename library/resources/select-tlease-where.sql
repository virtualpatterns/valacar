SELECT  tLease.cAddress,
        datetime(tLease.cFrom, 'localtime') AS cFrom,
        datetime(tLease.cTo, 'localtime')   AS cTo,
        tLease.cDevice                      AS cDevice,
        CASE
          WHEN NOT tDeviceTranslation.cTo IS NULL THEN
            tDeviceTranslation.cTo
          WHEN NOT tHostTranslation.cTo IS NULL THEN
            tHostTranslation.cTo
          ELSE
            tLease.cHost
        END                                 AS cHost
FROM    tLease
          LEFT OUTER JOIN tTranslation AS tDeviceTranslation ON
            tLease.cDevice = tDeviceTranslation.cFrom
          LEFT OUTER JOIN tTranslation AS tHostTranslation ON
            tLease.cHost = tHostTranslation.cFrom
WHERE   tLease.cDevice LIKE $Filter OR
        tDeviceTranslation.cTo LIKE $Filter OR
        tLease.cHost LIKE $Filter OR
        tHostTranslation.cTo LIKE $Filter
ORDER
BY      tLease.cDevice,
        CASE
          WHEN NOT tDeviceTranslation.cTo IS NULL THEN
            tDeviceTranslation.cTo
          WHEN NOT tHostTranslation.cTo IS NULL THEN
            tHostTranslation.cTo
          ELSE
            tLease.cHost
        END,
        tLease.cTo ASC;
