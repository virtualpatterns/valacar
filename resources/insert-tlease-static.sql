INSERT OR REPLACE INTO tLease ( cAddress,
                                cFrom,
                                cTo,
                                cDevice,
                                cHost,
                                cInserted )
VALUES (                        $Address,
                                NULL,
                                NULL,
                                $Device,
                                $Host,
                                datetime('now') );
