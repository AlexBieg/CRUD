$(function() {
    //Event handlers
    $('#new-review').submit(function() {
        saveComment();
        return false;
    });

    $('#log-in').submit(function() {
    	logIn();
    	return false;
    });

    $('#sign-up').submit(function() {
    	signUp();
    	return false;
    });

    //Raty Stuff
    $('#new-rating').raty();

    //Parse Stuff
    Parse.initialize("Xk793dlhs4fBUePzAHYjR3q4EaYFjUGUsg549qoY", "i38xWEG2u6THD6hlXk89mKhpfXZH9SMTwIUxbSMa");
    var Reviews = Parse.Object.extend("Reviews");

    //get the reviews saved on parse and put them on the page
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

    //builds the reviews on the page when given them
    var buildUserReviews = function(data) {
    	$("#review-area").empty();
    	var avgRating = null;
    	var bestRating = -1;
    	var helpful = null;

    	data.forEach(function(d) {
    		addSingleReview(d);
    		avgRating = avgRating == null ? d.get("rating") : avgRating + d.get("rating");
    		if (d.get('thumbs') > bestRating) {
    			helpful = d;
    		}
    	});

    	addHelpful(helpful);

    	$('#avg-rating').raty({
    		half: true, 
    		readOnly: true,
    		score: avgRating / data.length
    	});
    }

    //adds a single review to the page
    var addSingleReview = function(comment) {
    	var review = $("<div></div>");
    	review.addClass("review");
    	review.addClass("col-xs-12");
    	review.attr('id', comment.id);

    	var title = $("<h3></h3>");
    	title.text(comment.get("title"));

    	var content = $("<p></p>");
    	content.text(comment.get("content"));

    	var rating = $("<div></div>");
    	rating.raty({
    		score: comment.get("rating"),
    		readOnly: true
    	});

    	var reviewer = $('<div></div>');
    	reviewer.addClass('user');
    	reviewer.text('By ' + comment.get('user'));

    	var helpful = $('<div></div>');
    	var remove = null;
    	if(Parse.User.current() != null) {
    		//check if the current user made the comment
	    	if(!(comment.get('user') == Parse.User.current().getUsername())) {
		    	helpful.addClass('thumb');
		    	var up = $("<i class='fa fa-thumbs-up'></i>");
		    	console.log($.inArray(comment.id, Parse.User.current().get('thumbs')));
		    	console.log(comment.id);
		    	console.log(Parse.User.current().get('thumbs'))
		    	 //check if the current user like the comment
		    	if ($.inArray(comment.id, Parse.User.current().get('thumbs')) == -1) {
	    			up = $("<i class='fa fa-thumbs-o-up'></i>");
	    		}
		    	helpful.append(up);
		    	helpful.click(function() {
		    		likeReview(this);
		    		$(this).empty();
		    		$(this).append("<i class='fa fa-thumbs-up'></i>");
		    	});
	    	} else {
	    		remove = $('<button>Delete</button>');
	    		remove.addClass('btn', 'btn-primary');
	    		//remove the comment from the page and from parse
	    		remove.click(function() {
					var query = new Parse.Query(Reviews);
					var toDelete = query.get($(this).parent().attr('id'), {
						success: function(r) {
							r.destroy();
						},
						error: function(r, error) {
							console.log(error);
						}
					});
	    			$(this).parent().remove();
	    		});
	    	}
    	}

    	var thumbs = $('<p>');
    	thumbs.addClass('num-liked')
    	thumbs.text('People who gave this a thumbs up: ' + comment.get('thumbs'));

    	review.append(title, reviewer, rating, helpful, content, thumbs, remove);
    	$("#review-area").append(review);
    }

    //save the curent comment to parse and put it on the page
    var saveComment = function() {
    	if($('#new-rating').raty('score') > 0) {
    		var review = new Reviews();
    		review.set({
    			title: $('#write-area #review-title').val(),
    			content: $('#write-area textarea').val(),
    			rating: $('#new-rating').raty('score'),
    			user: Parse.User.current().getUsername(),
    			thumbs: 0
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

    //check who the user is to determine what to show them
    var checkUser = function () {
    	var button = $("<button class='btn btn-primary'></button>");
    	var text = $("<span></span>");
    	var user = Parse.User.current();
    	if (user == null) {
    		button.text('Log In');
    		button.attr('data-toggle', 'modal');
    		button.attr('data-target', '#myModal');

    		removeUserItems();
    		text.text('Howdy!');
    	} else {
    		text.text("Howdy, "+ Parse.User.current().getUsername());

    		button.text("Log Out");
    		button.addClass("log-out");

    		button.click(function() { //adds log out button and function
	    		Parse.User.logOut();
	    		location.reload();
	    	});
    	}

    	$('#nav-user').append(text).append(button);
    }

    //log in the user with the given info
    var logIn = function() {
    	Parse.User.logIn( $('#li-username').val(), $('#li-password').val() ).then(
    		function(user) {
    			console.log('signed in');
    			location.reload();
    		},
    		function(error) {
    			console.log(error);
    			if(error.message == 'invalid login parameters') {
    				alert("Oops, looks like your username or password is incorrect.")
    			}
    		}
    	);
    }

    //sign up the user with the given info
    var signUp = function() {
    	var user = new Parse.User();
    	
    	user.set('username', $("#su-username").val());
    	user.set('password', $("#su-password").val());
    	user.set('email', $("#su-email").val());
    	user.set('thumbs', []);

    	console.log($("#su-email").val());

    	user.signUp(null, {
    		success: function(user) {
    			console.log("signed up");
    			location.reload();
    		},

    		error: function(user, error) {
    			console.log(error);
    			alert(error.message);
    		}
    	})
    }

    //remove things that only users can see
    var removeUserItems = function() {
    	$('#write-area').hide();
    }

    //like a review when given the thumb cliked on
    var likeReview = function(thumb) {
    	var likedNum = Parse.User.current().get('thumbs').length;
    	var review = $(thumb).parent();
    	var query = new Parse.Query(Reviews);
    	query.get(review.attr('id'), {
    		success: function(r) {
    			Parse.User.current().addUnique('thumbs', r.id);//try to add id to user
    			Parse.User.current().save(null, {
    				success: function() {
    					console.log('checking if it has successfully been added');
    					if (Parse.User.current().get('thumbs').length > likedNum) {//if it worked then increment thumbs
    						r.increment('thumbs');
    						r.save();
    					}
    				}
    			});
    		},
    		error: function(r, error) {
    			console.log(error);
    		}
    	});
    }

    //add the most helpful review to the page
    var addHelpful = function(helpful) {
    	$('#helpful').empty();
    	var title = $('<h3>');
    	title.text(helpful.get('title'));

    	var user = $('<p>');
    	user.text("by " + helpful.get('user'));

    	var contents = $('<p>');
    	contents.text(helpful.get('content'));

    	var rating = $("<div></div>");
    	rating.raty({
    		score: helpful.get("rating"),
    		readOnly: true
    	});

    	$('#helpful').append(title, user, rating, contents);
    }

    //call when page starts
	getReviews();
	checkUser();
});
