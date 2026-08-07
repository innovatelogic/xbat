function idm_deserialize_accounts()
{
  const user = IdM.get_current_user();
  return IdM._deserialize_accounts(user.sheet("Accounts_v2"));
}
