INSERT INTO tDeviceHost ( cDevice,
                          cHost,
                          cInserted )
SELECT  tLease.cDevice,
        tLease.cHost,
        datetime('now')
FROM    tLease
          INNER JOIN (  SELECT  tLease.cDevice        AS [cDevice],
                                MAX(tLease.cInserted) AS [cInserted]
                        FROM    tLease
                        WHERE   NOT tLease.cFrom = tLease.cTo AND
                                NOT tLease.cHost IS NULL
                        GROUP
                        BY      tLease.cDevice ) AS qDeviceInserted ON
            tLease.cDevice = qDeviceInserted.cDevice AND
            tLease.cInserted = qDeviceInserted.cInserted
WHERE   NOT tLease.cFrom = tLease.cTo AND
        NOT tLease.cHost IS NULL;
