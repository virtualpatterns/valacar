DELETE
FROM    tLease
WHERE   cAddress = $Address AND
        cFrom = datetime($From) AND
        cTo = datetime($To)
 
