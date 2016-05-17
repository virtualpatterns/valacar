 INSERT INTO tLease ( cAddress,
                      cFrom,
                      cTo,
                      cDevice,
                      cHost,
                      cInserted )
VALUES (              '192.168.2.200',
                      datetime($From),
                      datetime($To),
                      '08:00:27:08:67:43',
                      'VANCE',
                      datetime('now') );
