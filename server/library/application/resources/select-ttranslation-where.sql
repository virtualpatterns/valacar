SELECT  tTranslation.cFrom      AS [from],
        tTranslation.cTo        AS [to],
        tTranslation.cInserted  AS [inserted]
FROM    tTranslation
WHERE   tTranslation.cFrom = $From;
