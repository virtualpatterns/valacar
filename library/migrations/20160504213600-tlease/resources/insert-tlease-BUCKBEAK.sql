 INSERT INTO tLease ( cAddress,
                      cFrom,
                      cTo,
                      cDevice,
                      cHost,
                      cInserted )
VALUES (              '192.168.2.101',
                      datetime($From),
                      datetime($To),
                      'c8:2a:14:57:bb:1b',
                      'BUCKBEAK',
                      datetime('now') );