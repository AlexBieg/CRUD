$(function() {
    //Event handlers
    $('#new-review').submit(function() {
        saveComment();
        return false;
    });

    $('#log-in').submit(function() {
    	logIn();
    });

    $('#sign-up').submit(function() {
    	signUp();
    });

    //Raty Stuff
    $('#new-rating').raty();

    //Parse Stuff
    Parse.initialize("Xk793dlhs4fBUePzAHYjR3q4EaYFjUGUsg549qoY", "i38xWEG2u6THD6hlXk89mKhpfXZH9SMTwIUxbSMa");
    var Reviews = Parse.Object.extend("Reviews");

    var getReviews = function () {
    	var query = new Parse.Query(Reviews);
    	query.notEqualTo("rating", null);
    	query.notEqualTo("title", "");
    	query.find({
    		success: function(results) {
    			buildUserReviews(results);
    		}
    	});
    }

    var buildUserReviews = function(data) {
    	$("#review-area").empty();
    	var avgRating = null;
    	var helpfulPostitive = null;
    	var helpfulNegative = null;

    	data.forEach(function(d) {
    		addSingleReview(d);
    		avgRating = avgRating == null ? d.get("rating") : avgRating + d.get("rating");
    		//if (helpfulPostitive == null || helpfulPostitive.get("rating") < )
    	});

    	$('#avg-rating').raty({
    		half: true, 
    		readOnly: true,
    		score: avgRating / data.length
    	});
    }

    var addSingleReview = function(comment) {
    	var review = $("<div></div>");
    	review.addClass("review");
    	review.addClass("col-xs-12");

    	var title = $("<h3></h3>");
    	title.text(comment.get("title"));

    	var content = $("<p></p>");
    	content.text(comment.get("content"));

    	var rating = $("<div></div>");
    	rating.raty({
    		score: comment.get("rating"),
    		readOnly: true
    	});

    	review.append(title).append(rating).append(content);
    	$("#review-area").append(review);
    }

    var saveComment = function() {
    	if($('#new-rating').raty('score') > 0) {
    		var review = new Reviews();
    		review.set({
    			title: $('#write-area #review-title').val(),
    			content: $('#write-area textarea').val(),
    			rating: $('#new-rating').raty('score')
    		});
    		review.save();

    		$('#write-area #review-title').val("");
    		$('#write-area textarea').val("");
    		$('#new-rating').raty({
    			score: 0
    		});
    		getReviews();
    	} else {
    		alert("You forgot to give it a rating!");
    	}
    }

    var checkUser = function () {
    	var button = $("<button class='btn btn-primary'></button>");
    	var text = $("<span></span>");
    	if (Parse.User.current() == null) {
    		button.text('Log In');
    		button.attr('data-toggle', 'modal');
    		button.attr('data-target', '#myModal');

    		text.text('Howdy!');
    	} else {
    		text.text("Howdy, "+ Parse.User.current().getUsername());

    		button.text("Log Out");
    		button.addClass("log-out");
    	}

    	$('#nav-user').append(text).append(button);
    }

    var logIn = function() {

    }

    var signUp = function() {
    	var user = new Parse.User();
    	
    	user.set('username', $("#sign-up #su-username").val());
    	user.set('password', $("#sign-up #su-password").val());
    	user.set('email', $("#sign-up #su-email").val());

    	console.log($("#su-email").val());

    	user.signUp(null, {
    		success: function(user) {
    			console.log("signed up");
    		},

    		error: function(user, error) {
    			console.log(error);
    		}
    	})
    }

    //First Calls
	getReviews();
	checkUser();
});
