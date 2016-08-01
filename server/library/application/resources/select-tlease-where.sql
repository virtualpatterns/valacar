SELECT  tLease.cAddress                                     AS [address],
        strftime('%Y-%m-%dT%H:%M:%fZ', tLease.cFrom)        AS [from],
        strftime('%Y-%m-%dT%H:%M:%fZ', tLease.cTo)          AS [to],
        tLease.cDevice                                      AS [device],
        tLease.cHost                                        AS [host],
        strftime('%Y-%m-%dT%H:%M:%fZ', tLease.cInserted)    AS [inserted]
FROM    tLease
WHERE   tLease.cAddress = $Address AND
        tLease.cFrom = datetime($From) AND
        tLease.cTo = datetime($To);
