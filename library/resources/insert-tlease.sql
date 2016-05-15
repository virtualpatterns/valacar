INSERT OR IGNORE INTO tLease ( cAddress,
                               cFrom,
                               cTo,
                               cDevice,
                               cHost,
                               cInserted )
VALUES (                       $Address,
                               datetime($From),
                               datetime($To),
                               $Device,
                               $Host,
                               datetime('now') );