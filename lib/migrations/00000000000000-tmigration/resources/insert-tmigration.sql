INSERT INTO tMigration (  cName,
                          cVersion,
                          cInstalled,
                          cUninstalled)
                VALUES (  $Name,
                          $Version,
                          datetime('now'),
                          NULL );
