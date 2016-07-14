INSERT INTO tLease (  cAddress,
                      cFrom,
                      cTo,
                      cDevice,
                      cHost,
                      cInserted )
VALUES (              '192.168.2.100',
                      datetime($From),
                      datetime($To),
                      '00:22:68:0e:3c:b3',
                      'LOVEGOOD',
                      datetime('now') );
