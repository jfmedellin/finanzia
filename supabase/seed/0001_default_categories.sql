-- Default categories are shared (is_system=true, user_id=null).
insert into public.categories (name, category_type, color, icon, is_system, is_active)
values
  ('Salario', 'income', '#2ECC71', 'briefcase', true, true),
  ('Freelance', 'income', '#27AE60', 'sparkles', true, true),
  ('Inversiones', 'income', '#16A085', 'trending-up', true, true),
  ('Vivienda', 'expense', '#1A2B3C', 'home', true, true),
  ('Servicios', 'expense', '#34495E', 'bolt', true, true),
  ('Mercado', 'expense', '#7F8C8D', 'shopping-cart', true, true),
  ('Transporte', 'expense', '#95A5A6', 'car', true, true),
  ('Salud', 'expense', '#8E44AD', 'heart-pulse', true, true),
  ('Educacion', 'expense', '#2980B9', 'book-open', true, true),
  ('Entretenimiento', 'expense', '#9B59B6', 'film', true, true)
on conflict do nothing;
