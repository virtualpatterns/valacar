UPDATE  tLease
SET     cFrom = datetime('now', '-6 hour'),
        cTo = datetime('now', '-4 hour')
WHERE   cHost = 'HOST2';
