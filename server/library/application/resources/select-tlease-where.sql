SELECT  tLease.cAddress                     AS [address],
        printf('%sZ', tLease.cFrom)         AS [from],
        printf('%sZ', tLease.cTo)           AS [to],
        -- datetime(tLease.cFrom, 'localtime') AS [from],
        -- datetime(tLease.cTo, 'localtime')   AS [to],
        tLease.cDevice                      AS [device],
        tLease.cHost                        AS [host],
        printf('%sZ', tLease.cInserted)     AS [inserted]
FROM    tLease
WHERE   tLease.cAddress = $Address AND
        tLease.cFrom = datetime($From) AND
        tLease.cTo = datetime($To);
