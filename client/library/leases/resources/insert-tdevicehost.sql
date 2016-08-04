INSERT OR REPLACE INTO tDeviceHost (  cDevice,
                                      cHost,
                                      cInserted )
SELECT  tLease.cDevice,
        tLease.cHost,
        datetime('now')
FROM    tLease
          INNER JOIN (  SELECT  tLease.cDevice        AS [cDevice],
                                MAX(tLease.cInserted) AS [cInserted]
                        FROM    tLease
                        WHERE   ( NOT $Device IS NULL AND
                                  tLease.cDevice = $Device OR
                                  $Device IS NULL ) AND
                                NOT tLease.cFrom = tLease.cTo AND
                                NOT tLease.cHost IS NULL
                        GROUP
                        BY      tLease.cDevice ) AS qDeviceInserted ON
            tLease.cDevice = qDeviceInserted.cDevice AND
            tLease.cInserted = qDeviceInserted.cInserted
WHERE   ( NOT $Device IS NULL AND
          tLease.cDevice = $Device OR
          $Device IS NULL ) AND
        NOT tLease.cFrom = tLease.cTo AND
        NOT tLease.cHost IS NULL;
