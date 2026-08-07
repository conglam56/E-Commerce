CREATE TABLE category(
    id UUID PRIMARY KEY,
    name varchar(255) not null unique,
    slug varchar(255) not null unique,
    status varchar(255) not null default 'ACTIVE'
);

CREATE TABLE product(
    id UUID PRIMARY KEY,
    name varchar(255) not null unique,
    quantity int not null,
    description text,
    image_url varchar(255),
    category_id uuid not null,
    price dec(10,2) not null,
    status varchar(255) not null default 'ACTIVE',
    constraint fk_category_id foreign key (category_id) references category(id)
);
