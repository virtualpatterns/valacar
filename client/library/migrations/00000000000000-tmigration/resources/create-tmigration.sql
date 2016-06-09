CREATE TABLE tMigration ( cName NOT NULL,
                          cVersion NOT NULL,
                          cInstalled,
                          cUninstalled,
                          PRIMARY KEY ( cName ) );
