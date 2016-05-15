CREATE TABLE tLease ( cAddress NOT NULL,
                      cFrom NOT NULL,
                      cTo NOT NULL,
                      cDevice NOT NULL,
                      cHost,
                      cInserted NOT NULL,
                      PRIMARY KEY ( cAddress,
                                    cFrom,
                                    cTo ) );
