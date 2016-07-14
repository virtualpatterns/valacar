SELECT  tLease.cAddress                     AS [address],
        datetime(tLease.cFrom, 'localtime') AS [from],
        datetime(tLease.cTo, 'localtime')   AS [to],
        tLease.cDevice                      AS [device],
        tLease.cHost                        AS [host],
        tLease.cInserted                    AS [inserted]
FROM    tLease
WHERE   tLease.cAddress = $Address AND
        tLease.cFrom = datetime($From) AND
        tLease.cTo = datetime($To);
