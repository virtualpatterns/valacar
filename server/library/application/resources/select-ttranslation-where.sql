SELECT  tTranslation.cFrom                    AS [from],
        tTranslation.cTo                      AS [to],
        printf('%sZ', tTranslation.cInserted) AS [inserted]
FROM    tTranslation
WHERE   tTranslation.cFrom = $From;
