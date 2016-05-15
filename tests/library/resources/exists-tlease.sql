SELECT  tLease.cAddress,
        tLease.cFrom,
        tLease.cTo
FROM    tLease
WHERE   tLease.cAddress = $Address AND
        tLease.cFrom = datetime($From) AND
        tLease.cTo = datetime($To) AND
        tLease.cDevice = $Device AND
        tLease.cHost = $Host AND
        NOT tLease.cInserted IS NULL
