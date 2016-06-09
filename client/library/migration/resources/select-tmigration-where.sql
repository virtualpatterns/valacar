SELECT  tMigration.cName
FROM    tMigration
WHERE   tMigration.cName = $Name AND
        tMigration.cUninstalled IS NULL;
