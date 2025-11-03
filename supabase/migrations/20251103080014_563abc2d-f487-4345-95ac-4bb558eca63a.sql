-- Create trigger to automatically assign admin role to Taku
CREATE TRIGGER on_auth_user_created_assign_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_role_to_taku();
