create table products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  price numeric(10, 2)
);

create table stocks (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid unique,
  count integer,
  foreign key ("product_id") references "products" ("id")
);
