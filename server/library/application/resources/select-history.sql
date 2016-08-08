SELECT  qLease.cDevice                                        AS [device],
        qLease.cAddress                                       AS [address],
        strftime('%Y-%m-%dT%H:%M:%fZ', qLease.cMinimumFrom)   AS [from],
        strftime('%Y-%m-%dT%H:%M:%fZ', qLease.cMaximumTo)     AS [to],
        CASE
          WHEN NOT tDeviceTranslation.cTo IS NULL THEN
            tDeviceTranslation.cTo
          WHEN NOT tHostTranslation.cTo IS NULL THEN
            tHostTranslation.cTo
          ELSE
            tDeviceHost.cHost
            -- qDeviceHost.cHost
        END                                                   AS [host]
FROM    ( SELECT  tLease.cDevice                              AS [cDevice],
                  tLease.cAddress                             AS [cAddress],
                  MIN(tLease.cFrom)                           AS [cMinimumFrom],
                  MAX(tLease.cTo)                             AS [cMaximumTo]
          FROM    tLease
          WHERE   NOT tLease.cFrom = tLease.cTo AND
                  ( NOT $FilterFrom IS NULL AND
                    NOT $FilterTo IS NULL AND
                    ( tLease.cFrom >= datetime($FilterFrom) AND
                      tLease.cFrom < datetime($FilterTo) OR
                      tLease.cTo >= datetime($FilterFrom) AND
                      tLease.cTo < datetime($FilterTo) ) OR
                    $FilterFrom IS NULL AND
                    $FilterTo IS NULL )
          GROUP
          BY      tLease.cDevice,
                  tLease.cAddress ) AS qLease
            LEFT OUTER JOIN tTranslation AS tDeviceTranslation ON
              qLease.cDevice = tDeviceTranslation.cFrom
            LEFT OUTER JOIN tDeviceHost ON
              qLease.cDevice = tDeviceHost.cDevice
                LEFT OUTER JOIN tTranslation AS tHostTranslation ON
                  tDeviceHost.cHost = tHostTranslation.cFrom
            -- LEFT OUTER JOIN ( SELECT  tLease.cDevice          AS [cDevice],
            --                           MAX(tLease.cHost)       AS [cHost]
            --                   FROM    tLease
            --                   WHERE   NOT tLease.cFrom = tLease.cTo AND
            --                           NOT tLease.cHost IS NULL
            --                   GROUP
            --                   BY      tLease.cDevice ) AS qDeviceHost ON
            --   qLease.cDevice = qDeviceHost.cDevice
            --     LEFT OUTER JOIN tTranslation AS tHostTranslation ON
            --       qDeviceHost.cHost = tHostTranslation.cFrom
WHERE   NOT $FilterNull AND
        ( NOT $FilterString IS NULL AND
          ( qLease.cDevice LIKE $FilterString OR
            qLease.cAddress LIKE $FilterString OR
            CASE
              WHEN NOT tDeviceTranslation.cTo IS NULL THEN
                tDeviceTranslation.cTo
              WHEN NOT tHostTranslation.cTo IS NULL THEN
                tHostTranslation.cTo
              ELSE
                tDeviceHost.cHost
                -- qDeviceHost.cHost
            END LIKE $FilterString ) OR
          $FilterString IS NULL ) OR
        $FilterNull AND
        CASE
          WHEN NOT tDeviceTranslation.cTo IS NULL THEN
            tDeviceTranslation.cTo
          WHEN NOT tHostTranslation.cTo IS NULL THEN
            tHostTranslation.cTo
          ELSE
            tDeviceHost.cHost
            -- qDeviceHost.cHost
        END IS NULL
ORDER
BY      qLease.cMinimumFrom,
        qLease.cDevice,
        qLease.cAddress;
