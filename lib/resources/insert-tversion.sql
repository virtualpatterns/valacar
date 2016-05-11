INSERT OR IGNORE INTO tVersion (  cValue,
                                  cInstalled )
                        VALUES (  $Value,
                                  datetime('now') );
