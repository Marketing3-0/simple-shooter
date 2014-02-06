function Alerter(msg) {
	this.message = msg;

	var prepend = "You told me: ";

	this.appear = function() {
		console.log(prepend + this.message);
	};
}window.onload = function() {
	var a = new Alerter("JS works");
	a.appear();
};