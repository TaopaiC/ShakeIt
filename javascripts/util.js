function RGB(red, green, blue) {
  return ["rgb(", red.toString(16), ",", green.toString(16), ",", blue.toString(16), ")"].join("");
}

var old_axis;

function onMotion(evt) {
  var x = evt.accelerationIncludingGravity.x;
  var y = evt.accelerationIncludingGravity.y;
  var z = evt.accelerationIncludingGravity.z;

  var axis = x;

  if (Math.abs(axis) > 10 && (Math.abs(old_axis - axis) > 5)) {
    react(true, evt);
  } else {
    react(false, evt);
  }
  old_axis = axis;
}
