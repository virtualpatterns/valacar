SELECT  tTranslation.cFrom      AS [from],
        tTranslation.cTo        AS [to],
        tTranslation.cInserted  AS [inserted]
FROM    tTranslation
ORDER
BY      tTranslation.cFrom ASC;
