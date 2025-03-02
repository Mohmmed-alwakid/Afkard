-- Function to safely check auth.users table
CREATE OR REPLACE FUNCTION public.get_auth_users_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function runs with elevated privileges
  RETURN (SELECT count(*) FROM auth.users);
EXCEPTION
  WHEN undefined_table THEN
    RAISE EXCEPTION 'auth.users table does not exist';
  WHEN insufficient_privilege THEN
    RAISE EXCEPTION 'insufficient privileges to access auth.users';
END;
$$; 