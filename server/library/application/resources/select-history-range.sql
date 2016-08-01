SELECT  COUNT(tLease.cInserted)                                 AS [numberOfSystemLeases],
        strftime('%Y-%m-%dT%H:%M:%fZ', MIN(tLease.cFrom))       AS [minimumFrom],
        strftime('%Y-%m-%dT%H:%M:%fZ', MAX(tLease.cTo))         AS [maximumTo],
        strftime('%Y-%m-%dT%H:%M:%fZ', MIN(tLease.cInserted))   AS [minimumInserted],
        strftime('%Y-%m-%dT%H:%M:%fZ', MAX(tLease.cInserted))   AS [maximumInserted]
FROM    tLease
WHERE   NOT tLease.cFrom = tLease.cTo;
