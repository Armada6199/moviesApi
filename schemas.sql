create table  movies(
    id serial primary key,
    movieId integer,
    title varchar(255),
    relase_date integer,
    comments varchar(10000),
    rating integer
);
