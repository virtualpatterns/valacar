UPDATE  tMigration
SET     cInstalled = datetime('now')
WHERE   cName = $Name AND
        cInstalled IS NULL AND
        cUninstalled IS NULL;
