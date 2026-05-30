-- Translate built-in system categories to Spanish labels.

update public.categories
set name = 'Salario'
where is_system = true and category_type = 'income' and lower(name) = 'salary';

update public.categories
set name = 'Freelance'
where is_system = true and category_type = 'income' and lower(name) = 'freelance';

update public.categories
set name = 'Inversiones'
where is_system = true and category_type = 'income' and lower(name) = 'investments';

update public.categories
set name = 'Vivienda'
where is_system = true and category_type = 'expense' and lower(name) = 'housing';

update public.categories
set name = 'Servicios'
where is_system = true and category_type = 'expense' and lower(name) = 'utilities';

update public.categories
set name = 'Mercado'
where is_system = true and category_type = 'expense' and lower(name) = 'groceries';

update public.categories
set name = 'Transporte'
where is_system = true and category_type = 'expense' and lower(name) = 'transport';

update public.categories
set name = 'Salud'
where is_system = true and category_type = 'expense' and lower(name) = 'healthcare';

update public.categories
set name = 'Educacion'
where is_system = true and category_type = 'expense' and lower(name) = 'education';

update public.categories
set name = 'Entretenimiento'
where is_system = true and category_type = 'expense' and lower(name) = 'entertainment';
