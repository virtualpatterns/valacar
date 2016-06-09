SELECT  tTranslation.cFrom,
        tTranslation.cTo
FROM    tTranslation
WHERE   tTranslation.cFrom = $From AND
        tTranslation.cTo = $To;
