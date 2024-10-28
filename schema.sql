/*

User Credentials Table

*/

CREATE USER 'networkx'@'localhost' IDENTIFIED BY 'networkx';
GRANT ALL PRIVILEGES ON *.* TO 'networkx'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;


/*
Database schema for the networkX
*/


create database NetworkX;
use NetworkX;



/*
table containing domain as a key and blocking pattern
let say the domain is google.com and the user wants to block certain subdomain so the second column will consist of
regex according to the blocked domain
*/


create table blocked_domain(
    domain varchar(255) primary key,
    blocking_pattern varchar(255)
);


CREATE TABLE blocked_ip (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    ip TEXT NOT NULL UNIQUE               
);
