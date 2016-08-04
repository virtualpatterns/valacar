DELETE
FROM    tDeviceHost
WHERE   NOT EXISTS (  SELECT  tLease.cDevice        AS [cDevice],
                              MAX(tLease.cInserted) AS [cInserted]
                      FROM    tLease
                      WHERE   tLease.cDevice = tDeviceHost.cDevice AND
                              NOT tLease.cFrom = tLease.cTo AND
                              NOT tLease.cHost IS NULL
                      GROUP
                      BY      tLease.cDevice );
