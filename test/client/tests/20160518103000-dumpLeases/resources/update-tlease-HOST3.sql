UPDATE  tLease
SET     cFrom = datetime('now', '+4 hour'),
        cTo = datetime('now', '+6 hour')
WHERE   cHost = 'HOST3';
