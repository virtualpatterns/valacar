SELECT  tTranslation.cFrom                    AS [from],
        tTranslation.cTo                      AS [to],
        printf('%sZ', tTranslation.cInserted) AS [inserted]
FROM    tTranslation
ORDER
BY      tTranslation.cFrom ASC;
