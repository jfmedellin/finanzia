-- Default categories are shared (is_system=true, user_id=null).
insert into public.categories (name, category_type, color, icon, is_system, is_active)
values
  ('Salary', 'income', '#2ECC71', 'briefcase', true, true),
  ('Freelance', 'income', '#27AE60', 'sparkles', true, true),
  ('Investments', 'income', '#16A085', 'trending-up', true, true),
  ('Housing', 'expense', '#1A2B3C', 'home', true, true),
  ('Utilities', 'expense', '#34495E', 'bolt', true, true),
  ('Groceries', 'expense', '#7F8C8D', 'shopping-cart', true, true),
  ('Transport', 'expense', '#95A5A6', 'car', true, true),
  ('Healthcare', 'expense', '#8E44AD', 'heart-pulse', true, true),
  ('Education', 'expense', '#2980B9', 'book-open', true, true),
  ('Entertainment', 'expense', '#9B59B6', 'film', true, true)
on conflict do nothing;
