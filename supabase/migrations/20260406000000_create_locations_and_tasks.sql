create table if not exists public.locations (
  id bigserial primary key,
  name text not null,
  x double precision not null,
  y double precision not null
);

create table if not exists public.tasks (
  id bigserial primary key,
  location_id bigint not null references public.locations(id) on delete cascade,
  status text not null check (status in ('pending', 'in_progress', 'completed'))
);

insert into public.locations (name, x, y)
select
  format('Location %s', row_number() over (order by gx, gy)),
  gx::double precision,
  gy::double precision
from generate_series(0, 4) as gx
cross join generate_series(0, 5) as gy;

insert into public.tasks (location_id, status)
values
  (1, 'pending'),
  (3, 'pending'),
  (5, 'pending'),
  (8, 'pending'),
  (11, 'pending'),
  (14, 'pending'),
  (17, 'pending'),
  (19, 'pending'),
  (22, 'pending'),
  (24, 'pending'),
  (27, 'pending'),
  (30, 'pending');
