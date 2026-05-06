alter table public.wins add column if not exists is_permanent boolean;

update public.wins
set is_permanent = sort_order < 5
where is_permanent is null;

alter table public.wins alter column is_permanent set default false;
alter table public.wins alter column is_permanent set not null;
