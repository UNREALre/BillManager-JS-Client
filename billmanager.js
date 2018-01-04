var billManager = (function(){

	var ajaxConnectionError = "Error during request to BILLmanager!";

	function compare(a,b) {
		var date1 = new Date(a.expiredate), date2 = new Date(b.expiredate);
		if (date1 < date2)
			return -1;

		if (date1 > date2)
			return 1;

		return 0;
	}

	return {
		options: {
			bmURL: "",
			errorContainerID: "",
			sessionExpire: 0,
			failToProlongSession: function(){},
		},

		//Authorize user in BM and saving auth data and bm session id within session storage
		authorizeUser: function(login, password, callback) {
			var $this = this;
			this.sendRequest({
		    	"func": "auth",
		        "username": login,
		        "password": password,
		        "out": "json"
			}).done(function(response){
				if (response.doc.error) {
					callback({
						error: response.doc.error.msg.$
					});
				} else {
					sessionStorage.setItem("bm_authinfo", login+":"+password);
					sessionStorage.setItem("bm_session_id", response.doc.auth.$id);
					sessionStorage.setItem("bm_session_created", Date.now());

					callback();
				}
			}).fail(function(response){
				callback({
					error: ajaxConnectionError
				});
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
					callback({
						error: response.doc.error.msg.$
					});
				} else {
					callback(response.doc["user.id"].$);
				}
			}).fail(function(response){
				callback({
					error: ajaxConnectionError
				});
			});
		},

		//
		changePassword: function(user_id, old_pass, new_pass, callback) {
			if (!this.checkSession()) {
				this.options.failToProlongSession()
				return false;
			}

			var $this = this;
			this.sendRequest({
		    	"func": "usrparam",
		        "old_passwd": old_pass,
		        "passwd": new_pass,
		        "clicked_button": "ok",
		        "elid": user_id,
		        "auth": sessionStorage.getItem("bm_session_id"),
		        "sok": "ok",
		        "out": "json"
			}).done(function(response){
				if (response.doc.error) {
					callback({
						error: response.doc.error.msg.$
					});
				} else {
					callback();
				}
			}).fail(function(response){
				callback({
					error: ajaxConnectionError
				});
			});
		},

		//Checks, if stored session is expired in BM, then we have to retrieve user login and pass from storage and re-authorize user
		checkSession: function() {
			var expiration_time = +sessionStorage.getItem("bm_session_created") + this.options.sessionExpire * 60000;
			var cur_time = Date.now();
			var is_session_valid = (expiration_time - cur_time > 0 ? true : false);
			if (sessionStorage.getItem("bm_authinfo")) {
				var auth_info = sessionStorage.getItem("bm_authinfo").split(":");

				if (!is_session_valid) {
					this.authorizeUser(auth_info[0], auth_info[1], function(){});
				}

				return true;
			} else {
				return false;
			}
		},

		//Getting basic information about user from BM
		getUserInfo: function(callback) {
			if (!this.checkSession()) {
				this.options.failToProlongSession()
				return false;
			}

			var $this = this;
			this.sendRequest({
		    	"func": "clientoption",
		        "auth": sessionStorage.getItem("bm_session_id"),
		        "out": "json"
			}).done(function(response){
				if (response.doc.error) {
					callback({
						error: response.doc.error.msg.$
					});
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
				callback({
					error: ajaxConnectionError
				});
			});
		},

		//Getting user Balance from BM
		getUserBalance: function(callback) {
			if (!this.checkSession()) {
				this.options.failToProlongSession()
				return false;
			}

			var $this = this;
			this.sendRequest({
		    	"func": "desktop",
		        "auth": sessionStorage.getItem("bm_session_id"),
		        "out": "json"
			}).done(function(response){
				if (response.doc.error) {
					callback({
						error: response.doc.error.msg.$
					});
				} else {
					var clean_balance = response.doc.balance.$.split(" ");
					callback({
						"balance": response.doc.balance.$,
						"clean_balance": clean_balance[0]
					});
				}
			}).fail(function(response){
				callback({
					error: ajaxConnectionError
				});
			});
		},

		//Get info about all user products with bm_product_code (for example: soft).
		getUserProducts: function(bm_product_code, add_props, addons, callback) {
			if (!this.checkSession()) {
				this.options.failToProlongSession()
				return false;
			}

			var $this = this;
			var products = [];
			var created_date;
			var expire_date;
			var cur_product;
			var addon_info = [];
			this.sendRequest({
		    	"func": bm_product_code,
		        "auth": sessionStorage.getItem("bm_session_id"),
		        "out": "json"
			}).done(function(response){
				if (response.doc.error) {
					callback({
						error: response.doc.error.msg.$
					});
				} else {

					if (response.doc.elem) {

						var promises = [];

						response.doc.elem.forEach(function(product){

							created_date = product.createdate.$.split("-");
							created_date = created_date[1]+"."+created_date[2]+"."+created_date[0];

							expire_date = product.expiredate.$.split("-");
							expire_date = expire_date[1]+"."+expire_date[2]+"."+expire_date[0];

							cur_product = {
			                    id: product.id.$,
			                    name: product.name.$,
			                    price: product.cost.$,
			                    period: product.period.$,
			                    created: created_date,
			                    expiredate: expire_date,
			                    status: product.status.$,//5 - processing; 2 - active; 1 - just ordered
			                    item_status: product.item_status.$orig,
							};

							if (add_props.length) {
								for (var i=0; i<add_props.length; i++) {
									if (product.hasOwnProperty(add_props[i])) {
										cur_product[add_props[i]] = product[add_props[i]].$;
									}
								}
							}

							if (addons.length) {

								//We have to make array of promises to gather info about service addons
								promises.push($this.sendRequest({
							    	"func": bm_product_code+".edit",
							    	"elid": product.id.$,
							        "auth": sessionStorage.getItem("bm_session_id"),
							        "out": "json",
								}).done(function(data) {
									
									for (var i=0; i<addons.length; i++) {
										if (data.doc.hasOwnProperty(addons[i])) {
											addon_info.push({
												product_id: product.id.$,
												addon_id: addons[i],
												value: data.doc[addons[i]].$,
												addon_name: data.doc.messages.msg[addons[i]]
											});
											
										}
									}
									
								}));

							}

							products.push(cur_product);

						});

						if (addons.length) {
							var promise = $.when.apply($, promises);
							var tmp_addons;
							promise.done(function(data) {//When all ajax queries to retive addon info done, assign addons to it products
								for (var i=0; i<products.length; i++) {
									tmp_addons = [];
									for (var j=0; j<addon_info.length; j++) {
										if (products[i].id == addon_info[j].product_id) {
											tmp_addons.push(addon_info[j]);
										}
									}

									products[i].addon_info = tmp_addons;
								}

								callback(products);
							});
						} else {
							callback(products);
						}

					} else {
						callback(products);
					}
					
				}
			}).fail(function(response){
				callback({
					error: ajaxConnectionError
				});
			});
		},

		//Get closest payment that user have to do
		getNextPaymentInfo: function(bm_product_code, callback) {
			this.getUserProducts(bm_product_code, [], [], function(products) {
				var active_products = [];
				var price = 0;
				var closest_date;
				var clean_price;

				if (products.length) {
					products.forEach(function(product){
						if (product.status != 1) {
							active_products.push(product);
						}
					});
					active_products.sort(compare);

					closest_date = active_products[0].expiredate;
					active_products.forEach(function(product){//if there are several products with same expiration date - get sum of them
						if (product.expiredate == closest_date) {
							clean_price = product.price.split(" ");
							price += +clean_price[0];
						} else {
							return false;
						}
					});

				}

				callback({
					date: closest_date,
					price: price
				});
			});
		},

		//Return all product (product IDs in products arg) data from BM
		getProductsInfo: function(products, callback) {
			if (!this.checkSession()) {
				this.options.failToProlongSession()
				return false;
			}

			var $this = this;
			var good_products = [];
			this.sendRequest({
		    	"func": "pricelist.export",
		        "auth": sessionStorage.getItem("bm_session_id"),
		        "out": "json"
			}).done(function(response){
				if (response.doc.error) {
					callback({
						error: response.doc.error.msg.$
					});
				} else {
					
					products.forEach(function(id) {
						for (var i=0; i<response.doc.pricelist.length; i++) {
							if (id == response.doc.pricelist[i].id.$) {
								good_products.push(response.doc.pricelist[i]);
							}
						}
					});

					callback(good_products);

				}
			}).fail(function(response){
				callback({
					error: ajaxConnectionError
				});
			});
		},

		//Adding funds to user balance
		addFundsToBalance: function(amount, currency_iso, currency_bm_id, pay_method_id, callback) {
			if (!this.checkSession()) {
				this.options.failToProlongSession()
				return false;
			}

			var $this = this;
			this.sendRequest({
		    	"func": "payment.add.pay",
		        "auth": sessionStorage.getItem("bm_session_id"),
				"amount": amount,
				"amount_currency": amount + " " + currency_iso,
				"clicked_button": "finish",
				"newwindow": "extform",
				"payment_currency": currency_bm_id,
				"paymethod": pay_method_id,
	            "randomnumber": Math.random().toString(36).substr(2, 12),
	            "u": "n",
	            "sok": "ok",
	            "out": "json"
			}).done(function(response){
				if (response.doc.error) {
					callback({
						error: response.doc.error.msg.$
					});
				} else {
					
					var redirect_url = response.doc.ok.$, final_url = $this.options.bmURL.replace("/billmgr", "") + redirect_url + "&auth="+sessionStorage.getItem("bm_session_id"), payment_id = response.doc.payment_id.$;

					callback(final_url);
				}
			}).fail(function(response){
				callback({
					error: ajaxConnectionError
				});
			});
		},

		//Purchase product for user
		buyProduct: function(purchaseParams, callback) {
			if (!this.checkSession()) {
				this.options.failToProlongSession()
				return false;
			}

			var $this = this;

			//Adding to cart
			var cart_params = {
	            "func": purchaseParams.product_code+".order.param",
	            "pricelist": purchaseParams.product_id,
	            "period": purchaseParams.period,
	            "auth": sessionStorage.getItem("bm_session_id"),
	            "project": purchaseParams.project,
	            "sok": "ok",
	            "out": "json",
			};
			if (purchaseParams.addons.length) {
				var tmp;
				purchaseParams.addons.forEach(function(item){
					tmp = item.split("=");
					cart_params[tmp[0]] = tmp[1];
				});
			}

			this.sendRequest(cart_params).done(function(response){
				if (response.doc.error) {
					callback({
						error: response.doc.error.msg.$
					});
				} else {
					var billorder_id = response.doc["billorder.id"].$;

					$this.sendRequest({
			            "func": "payment.add.pay",
			            "auth": sessionStorage.getItem("bm_session_id"),
						"amount": purchaseParams.amount,
						"amount_currency": purchaseParams.amount + " " + purchaseParams.currency_iso,
						"billorder": billorder_id,
						"clicked_button": "finish",
						"newwindow": "extform",
						"payment_currency": purchaseParams.currency_bm_id,
						"paymethod": purchaseParams.paymethod,
			            "randomnumber": Math.random().toString(36).substr(2, 12),
			            "u": "n",
			            "sok": "ok",
			            "out": "json",
					}).done(function(bill_response){
						if (response.doc.error) {
							callback({
								error: bill_response.doc.error.msg.$
							});
						} else {
							
							var redirect_url = bill_response.doc.ok.$, final_url = $this.options.bmURL.replace("/billmgr", "") + redirect_url + "&auth="+sessionStorage.getItem("bm_session_id");

							callback(final_url);
						}
					});

				}
			}).fail(function(response){
				callback({
					error: ajaxConnectionError
				});
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