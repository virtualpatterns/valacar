CREATE TABLE tLeaseModified ( cAddress NOT NULL,
                              cFrom NOT NULL,
                              cTo NOT NULL,
                              cDevice,
                              cHost,
                              cInserted NOT NULL,
                              PRIMARY KEY ( cAddress,
                                            cFrom,
                                            cTo ) );
