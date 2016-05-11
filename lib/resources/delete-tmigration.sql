DELETE
FROM    tMigration
WHERE   cName = $Name AND
        NOT cInstalled IS NULL AND
        NOT cUninstalled IS NULL;
