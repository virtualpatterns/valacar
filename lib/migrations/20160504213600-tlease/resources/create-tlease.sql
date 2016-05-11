CREATE TABLE tLease ( cAddress NOT NULL,
                      cFrom,
                      cTo,
                      cDevice NOT NULL,
                      cHost,
                      cInserted NOT NULL,
                      PRIMARY KEY ( cAddress,
                                    cFrom,
                                    cTo ) );
