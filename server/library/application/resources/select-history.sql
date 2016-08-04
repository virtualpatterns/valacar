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

-- SELECT  qLease.cAddress                         AS [address],
--         strftime('%Y-%m-%dT%H:%M:%fZ', qLease.cMinimumFrom)      AS [from],
--         strftime('%Y-%m-%dT%H:%M:%fZ', qLease.cMaximumTo)        AS [to],
--         qLease.cDevice                          AS [device],
--         qLease.cHost                            AS [host]
--         -- CASE
--         --   WHEN NOT tDeviceTranslation.cTo IS NULL THEN
--         --     tDeviceTranslation.cTo
--         --   WHEN NOT tHostTranslation.cTo IS NULL THEN
--         --     tHostTranslation.cTo
--         --   ELSE
--         --     qLease.cHost
--         -- END                                     AS [host]
-- FROM    ( SELECT  tLease.cAddress               AS [cAddress],
--                   MIN(tLease.cFrom)             AS [cMinimumFrom],
--                   MAX(tLease.cTo)               AS [cMaximumTo],
--                   tLease.cDevice                AS [cDevice],
--                   CASE
--                     WHEN NOT tDeviceTranslation.cTo IS NULL THEN
--                       tDeviceTranslation.cTo
--                     WHEN NOT tHostTranslation.cTo IS NULL THEN
--                       tHostTranslation.cTo
--                     ELSE
--                       tLease.cHost
--                   END                           AS [cHost]
--                   -- tLease.cHost                  AS [cHost]
--           FROM    tLease
--                     LEFT OUTER JOIN tTranslation AS tDeviceTranslation ON
--                       tLease.cDevice = tDeviceTranslation.cFrom
--                     LEFT OUTER JOIN tTranslation AS tHostTranslation ON
--                       tLease.cHost = tHostTranslation.cFrom
--           WHERE   NOT tLease.cFrom = tLease.cTo AND
--                   ( NOT $FilterFrom IS NULL AND
--                     NOT $FilterTo IS NULL AND
--                     tLease.cFrom >= datetime($FilterFrom) AND
--                     tLease.cTo < datetime($FilterTo) OR
--                     $FilterFrom IS NULL AND
--                     $FilterTo IS NULL )
--           GROUP
--           BY      tLease.cAddress,
--                   tLease.cDevice,
--                   CASE
--                     WHEN NOT tDeviceTranslation.cTo IS NULL THEN
--                       tDeviceTranslation.cTo
--                     WHEN NOT tHostTranslation.cTo IS NULL THEN
--                       tHostTranslation.cTo
--                     ELSE
--                       tLease.cHost
--                   END ) AS qLease
--                   -- tLease.cHost ) AS qLease
--           -- LEFT OUTER JOIN tTranslation AS tDeviceTranslation ON
--           --   qLease.cDevice = tDeviceTranslation.cFrom
--           -- LEFT OUTER JOIN tTranslation AS tHostTranslation ON
--           --   qLease.cHost = tHostTranslation.cFrom
-- WHERE   NOT $FilterString IS NULL AND
--         ( qLease.cAddress LIKE $FilterString OR
--           qLease.cDevice LIKE $FilterString OR
--           qLease.cHost LIKE $FilterString ) OR
--         -- ( qLease.cAddress LIKE $FilterString OR
--         --   qLease.cDevice LIKE $FilterString OR
--         --   tDeviceTranslation.cTo LIKE $FilterString OR
--         --   qLease.cHost LIKE $FilterString OR
--         --   tHostTranslation.cTo LIKE $FilterString ) OR
--         $FilterString IS NULL
-- ORDER
-- BY      qLease.cMaximumTo,
--         qLease.cDevice,
--         qLease.cHost;
--         -- CASE
--         --   WHEN NOT tDeviceTranslation.cTo IS NULL THEN
--         --     tDeviceTranslation.cTo
--         --   WHEN NOT tHostTranslation.cTo IS NULL THEN
--         --     tHostTranslation.cTo
--         --   ELSE
--         --     qLease.cHost
--         -- END;

-- SELECT  tLease.cAddress                     AS [address],
--         strftime('%Y-%m-%dT%H:%M:%fZ', tLease.cFrom)         AS [from],
--         strftime('%Y-%m-%dT%H:%M:%fZ', tLease.cTo)           AS [to],
--         tLease.cDevice                      AS [device],
--         CASE
--           WHEN NOT tDeviceTranslation.cTo IS NULL THEN
--             tDeviceTranslation.cTo
--           WHEN NOT tHostTranslation.cTo IS NULL THEN
--             tHostTranslation.cTo
--           ELSE
--             tLease.cHost
--         END                                 AS [host],
--         strftime('%Y-%m-%dT%H:%M:%fZ', tLease.cInserted)     AS [inserted]
-- FROM    tLease
--           LEFT OUTER JOIN tTranslation AS tDeviceTranslation ON
--             tLease.cDevice = tDeviceTranslation.cFrom
--           LEFT OUTER JOIN tTranslation AS tHostTranslation ON
--             tLease.cHost = tHostTranslation.cFrom
-- WHERE   tLease.cFrom >= datetime($FilterFrom) AND
--         tLease.cTo < datetime($FilterTo) AND
--         NOT EXISTS (  SELECT  tLeaseExpiring.cAddress,
--                               tLeaseExpiring.cFrom,
--                               tLeaseExpiring.cFrom
--                       FROM    tLease AS tLeaseExpiring
--                       WHERE   tLeaseExpiring.cAddress = tLease.cAddress AND
--                               NOT tLeaseExpiring.cFrom = tLease.cFrom AND
--                               NOT tLeaseExpiring.cTo = tLease.cTo AND
--                               tLeaseExpiring.cFrom >= datetime($FilterFrom) AND
--                               tLeaseExpiring.cTo < datetime($FilterTo) AND
--                               tLeaseExpiring.cFrom >= tLease.cFrom AND
--                               tLeaseExpiring.cFrom < tLease.cTo )

-- WHERE   ( tLease.cAddress LIKE $Filter OR
--           tLease.cDevice LIKE $Filter OR
--           tDeviceTranslation.cTo LIKE $Filter OR
--           tLease.cHost LIKE $Filter OR
--           tHostTranslation.cTo LIKE $Filter OR
--           ( tLease.cFrom <= datetime($Filter) AND
--             tLease.cTo > datetime($Filter) ) ) AND
--         NOT EXISTS (  SELECT  tLeaseExpiring.cAddress,
--                               tLeaseExpiring.cFrom,
--                               tLeaseExpiring.cFrom
--                       FROM    tLease AS tLeaseExpiring
--                       WHERE   tLeaseExpiring.cAddress = tLease.cAddress AND
--                               NOT tLeaseExpiring.cFrom = tLease.cFrom AND
--                               NOT tLeaseExpiring.cTo = tLease.cTo AND
--                               tLeaseExpiring.cFrom <= datetime($Filter) AND
--                               tLeaseExpiring.cTo > datetime($Filter) AND
--                               tLeaseExpiring.cFrom >= tLease.cFrom AND
--                               tLeaseExpiring.cFrom < tLease.cTo )

--
-- ORDER
-- BY      tLease.cTo,
--         tLease.cDevice,
--         CASE
--           WHEN NOT tDeviceTranslation.cTo IS NULL THEN
--             tDeviceTranslation.cTo
--           WHEN NOT tHostTranslation.cTo IS NULL THEN
--             tHostTranslation.cTo
--           ELSE
--             tLease.cHost
--         END;
