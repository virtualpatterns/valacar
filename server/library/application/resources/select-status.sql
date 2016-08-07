SELECT  strftime('%Y-%m-%dT%H:%M:%fZ', datetime('now'))   AS [now],
        sqlite_source_id()                                AS [source],
        sqlite_version()                                  AS [version];
