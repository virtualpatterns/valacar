INSERT OR REPLACE INTO tTranslation ( cFrom,
                                      cTo,
                                      cInserted )
VALUES (                              $From,
                                      $To,
                                      datetime('now') );
