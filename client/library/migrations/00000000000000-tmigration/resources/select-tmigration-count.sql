SELECT  COUNT(tMigration.cName) AS cCountOfMigrations
FROM    tMigration
WHERE   NOT tMigration.cName = $Name AND
        tMigration.cUninstalled IS NULL;
