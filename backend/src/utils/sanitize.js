function stripPassword(employee) {
  if (!employee) return employee;
  const { password, ...safe } = employee;
  return safe;
}

function stripPasswords(employees) {
  return employees.map(stripPassword);
}

module.exports = { stripPassword, stripPasswords };
