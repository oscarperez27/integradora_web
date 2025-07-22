export const isAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const adminRoleId = "68703a8cbe19d4a7e175ea1a"; // El ID de Admin

    if (!user?.roles) return false;

    return user.roles.includes(adminRoleId);
  } catch {
    return false;
  }
};