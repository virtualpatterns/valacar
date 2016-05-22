 INSERT INTO tLease ( cAddress,
                      cFrom,
                      cTo,
                      cDevice,
                      cHost,
                      cInserted )
VALUES (              '192.168.2.201',
                      datetime($From),
                      datetime($To),
                      '08:00:27:66:5c:05',
                      'JORKINS',
                      datetime('now') );
