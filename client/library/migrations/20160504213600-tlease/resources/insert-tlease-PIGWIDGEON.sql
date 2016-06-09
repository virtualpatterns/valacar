INSERT INTO tLease (  cAddress,
                      cFrom,
                      cTo,
                      cDevice,
                      cHost,
                      cInserted )
VALUES (              '192.168.2.2',
                      datetime($From),
                      datetime($To),
                      '00:1c:23:b3:07:f6',
                      'PIGWIDGEON',
                      datetime('now') );
