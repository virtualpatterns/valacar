UPDATE  tMigration
SET     cUninstalled = datetime('now')
WHERE   cName = $Name AND
        NOT cInstalled IS NULL AND
        cUninstalled IS NULL;
