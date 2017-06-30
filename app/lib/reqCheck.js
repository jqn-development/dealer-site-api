module.exports = function(req) {
  if ((req) && ((req.hasData || req.hasError))) return true;
  return false
}
