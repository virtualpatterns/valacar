DELETE
FROM    tLease
WHERE   NOT cFrom = datetime($From) AND
        NOT cTo = datetime($To);
