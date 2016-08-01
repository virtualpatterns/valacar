UPDATE  tLease
SET     cHost = NULL
WHERE   cHost = '(unknown)' OR
        cHost = '(Unknown)';
