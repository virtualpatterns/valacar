SELECT  sqlite_master.name
FROM    sqlite_master
WHERE   sqlite_master.type = 'table' AND
        sqlite_master.name = $Name;
