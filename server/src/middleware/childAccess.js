// M2 – Child access check (SCRUM-48)
// Use after authenticate on every /api/children/:childId/... route.
// The request goes on only if the logged-in user may see this child:
//   parent     -> it is their own child
//   specialist -> they are linked to the child right now (FR-M2-05)
//   child      -> it is their own profile
// On success the child's row is put on req.child for the route to use.
function requireChildAccess(db) {
  return (req, res, next) => {
    const child = db
      .prepare('SELECT * FROM children WHERE id = ?')
      .get(Number(req.params.childId));
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const { id, role } = req.user;
    let allowed = false;

    if (role === 'parent') {
      allowed = child.parentId === id;
    } else if (role === 'specialist') {
      // Read the link from the database on every request, so access ends
      // as soon as the parent unlinks, even if the token is still valid.
      const link = db
        .prepare('SELECT 1 FROM specialist_links WHERE childId = ? AND specialistId = ?')
        .get(child.id, id);
      allowed = !!link;
    } else if (role === 'child') {
      allowed = child.userId === id;
    }

    if (!allowed) {
      return res.status(403).json({ error: 'No access to this child' });
    }

    req.child = child;
    next();
  };
}

module.exports = { requireChildAccess };