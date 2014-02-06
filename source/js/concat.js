function Alerter(msg) {
	this.message = msg;

	var prepend = "You told me: ";

	this.appear = function() {
		alert(prepend + this.message);
	};
}window.onload = function() {
	var a = new Alerter("JS works");
	a.appear();
};