DELETE
FROM    tLease
WHERE   cAddress = $Address AND
        cFrom IS NULL AND
        cTo IS NULL;
