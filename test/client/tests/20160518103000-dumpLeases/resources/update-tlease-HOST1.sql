UPDATE  tLease
SET     cFrom = datetime('now', '-1 hour'),
        cTo = datetime('now', '+1 hour')
WHERE   cHost = 'HOST1';
