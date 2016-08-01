SELECT  tTranslation.cFrom                                      AS [from],
        tTranslation.cTo                                        AS [to],
        strftime('%Y-%m-%dT%H:%M:%fZ', tTranslation.cInserted)  AS [inserted]
FROM    tTranslation
WHERE   tTranslation.cFrom = $From;
