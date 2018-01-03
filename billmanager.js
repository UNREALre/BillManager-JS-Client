var billManager = (function(){

	var ajaxConnectionError = "Error during request to BILLmanager!";

	return {
		options: {
			bmURL: "",
			errorContainerID: "",
			sessionExpire: 0,
		},

		//Authorize user in BM and saving auth data and bm session id within session storage
		authorizeUser: function(login, password) {
			var $this = this;
			this.sendRequest({
		    	"func": "auth",
		        "username": login,
		        "password": password,
		        "out": "json"
			}).done(function(response){
				if (response.doc.error) {
					$("#"+$this.options.errorContainerID).html(response.doc.error.msg.$);
				} else {
					sessionStorage.setItem("bm_authinfo", login+":"+password);
					sessionStorage.setItem("bm_session_id", response.doc.auth.$id);
					sessionStorage.setItem("bm_session_created", Date.now());
				}
			}).fail(function(response){
				$("#"+$this.options.errorContainerID).html(ajaxConnectionError);
			});
		},

		//User registration within BILLmanager
		registerUser: function(reg_data, callback) {
			var $this = this;
			this.sendRequest({
	            "func": "register",
	            "email": reg_data.email,
	            "passwd": reg_data.password,
	            "realname": reg_data.realname,
	            "country": reg_data.country_id,
	            "phone": reg_data.phone,
	            "project": reg_data.project,
	            "partner": reg_data.partner,
	            "sesid": '',
	            "sok": "ok",
	            "lang": reg_data.lang,
	            "out": "json",
	            "conditions_agree" : "on",
			}).done(function(response){
				if (response.doc.error) {
					$("#"+$this.options.errorContainerID).html(response.doc.error.msg.$);
				} else {
					callback(response.doc["user.id"].$);
				}
			}).fail(function(response){
				$("#"+$this.options.errorContainerID).html(ajaxConnectionError);
			});
		},

		//Checks, if stored session is expired in BM, then we have to retrieve user login and pass from storage and re-authorize user
		checkSession: function() {
			var expiration_time = +sessionStorage.getItem("bm_session_created") + this.options.sessionExpire * 60000;
			var cur_time = Date.now();
			var is_session_valid = (expiration_time - cur_time > 0 ? true : false);
			var auth_info = sessionStorage.getItem("bm_authinfo").split(":");

			if (!is_session_valid) {
				this.authorizeUser(auth_info[0], auth_info[1]);
			}
		},

		//Getting basic information about user from BM
		getUserInfo: function(callback) {
			this.checkSession();

			var $this = this;
			this.sendRequest({
		    	"func": "clientoption",
		        "auth": sessionStorage.getItem("bm_session_id"),
		        "out": "json"
			}).done(function(response){
				if (response.doc.error) {
					$("#"+$this.options.errorContainerID).html(response.doc.error.msg.$);
				} else {
					callback({
						"id": response.doc.user_id.$,
						"email": response.doc.user_email.$,
						"name": response.doc.user_realname.$,
						"phone": response.doc.user_phone.$,
						"timezone": response.doc.user_timezone.$,
					});
				}
			}).fail(function(response){
				$("#"+$this.options.errorContainerID).html(ajaxConnectionError);
			});
		},

		//Getting user Balance from BM
		getUserBalance: function(callback) {
			this.checkSession();

			var $this = this;
			this.sendRequest({
		    	"func": "desktop",
		        "auth": sessionStorage.getItem("bm_session_id"),
		        "out": "json"
			}).done(function(response){
				if (response.doc.error) {
					$("#"+$this.options.errorContainerID).html(response.doc.error.msg.$);
				} else {
					var clean_balance = response.doc.balance.$.split(" ");
					callback({
						"balance": response.doc.balance.$,
						"clean_balance": clean_balance[0]
					});
				}
			}).fail(function(response){
				$("#"+$this.options.errorContainerID).html(ajaxConnectionError);
			});
		},

		//Get info about all user products with bm_product_code (for example: soft)
		getUserProducts: function(bm_product_code, callback) {
			this.checkSession();

			var $this = this;
			this.sendRequest({
		    	"func": bm_product_code,
		        "auth": sessionStorage.getItem("bm_session_id"),
		        "out": "json"
			}).done(function(response){
				if (response.doc.error) {
					$("#"+$this.options.errorContainerID).html(response.doc.error.msg.$);
				} else {
					console.log(response);
				}
			}).fail(function(response){
				$("#"+$this.options.errorContainerID).html(ajaxConnectionError);
			});
		},

		sendRequest: function(params) {
		    return $.ajax({
				dataType: "jsonp",
				url: this.options.bmURL,
				type: 'POST',
				data: params,
			});
		}
	}

})();