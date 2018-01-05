//Инициализируем
billManager.options = {
	bmURL: "https://185.14.30.1:1500/billmgr",
	sessionExpire: 30,
	failToProlongSession: function() {
		//будет вызвана, если сессия биллинга будет просрочена, а продлить ее не получится. тут можно описать те или иные действия
	}
}

/*
billManager.registerUser(
	{//Данные для регистрации
		email: "testuser2@test.net",
		password: "hGb3294QsT",
		realname: "John Dow",
		phone: "+7 (987) 654-22-11",
		country_id: 182,
		project: 1,
		partner: "",
		lang: "ru"
	}, 
	function(data) {//Если что-то надо сделать после - пишем код тут. Приходит ID нового пользователя сюда
		console.log(data)
	}
);
*/

//Для всех методов общепринятый последний аргумент - callback функция. Если были какие-то ошибки во время выполнения запросов, то объект аргумента будет содержать св-во error с расшифровкой ошибки

/*
//Если данные верные, пользователь будет авторизован в системе, в Локальном хранилище браузера будет сохранен ID сессии биллинга
billManager.authorizeUser("avpmanager@gmail.com", "Alexander123", function(data){
	//действия после авторизации
});
*/

/*
//Смена пароля. Передаем id пользователя, старый пароль, новый пароль
billManager.changePassword(13, "Alexander321", "Alexander123", function(data){
	console.log(data);
});
*/

/*
//Восстановление пароля
//Первый параметр - email
billManager.recoverPassword("avpmanager@gmail.com", function(data){
	console.log(data);
});
*/

/*
//Получим: id, email, телефон, имя, временную зону пользователя
billManager.getUserInfo(function(data) {//Данные пользователя приходят сюда
	console.log(data)
});
*/

/*
//Получим: баланс пользователя с выбранной валютой биллинга и чистый баланс (одно число)
billManager.getUserBalance(function(data) {//Баланс пользователя приходит сюда
	console.log(data)
});
*/

/*
//Получаем информацию по всем продуктам авторизованного пользователя с заданным кодом из биллинга (к примеру, soft/vds/и т.п.)
//Вторым параметром указывается массив доп. св-в, которые надо получить, по умолчанию возвращаются: id, наименование, цена, период, дата создания, дата истечения срока, статус услуги
//Третьим параметром указывается массив с ID аддонов информацию по которым необходимо получить
billManager.getUserProducts("vds", ["datacentername", "domain"], ["addon_13", "addon_15", "addon_9"], function(data) {//Продукты пользователя приходят сюда
	console.log(data);
});
*/

/*
//Узнаем дату и сумму ближайшего платежа
billManager.getNextPaymentInfo("vds", function(data) {//Сюда придет объект со свойствами date и price
	console.log(data);
});
*/

/*
//Получает всю информацию по продуктам по их id в биллинге
billManager.getProductsInfo([1,8], function(data) {//Сюда придет ответ
	console.log(data);
});
*/

/*
//Пополнение баланса
//Передаем сумму пополнение, валюту в iso, Id валюты в биллинге, id платежной системы в биллинге, callback
//В callback придет URL на который надо перенаправить пользователя для осуществления платежа
billManager.addFundsToBalance(1000, "RUB", 126, 8, function(data){
	console.log(data);
});
*/


/*
//Покупка продукта
//Первый аргумент объект, содержащий св-ва: product_code - код продукта из биллинга; product_id - id продукта из биллинга; period - период покупки; project - проект; addons - массив аддонов к продукту, если таковые есть, каждый элемент массива вида addon_X=Y, где X - Id аддона, Y - значения аддона;
//amount - сумма покупки; currency_iso - iso валюты; currency_id - id валюты из биллинга; paymethod - id платежной системы из биллинг.
//В callback придет URL на который надо перенаправить пользователя для оплаты заказа
billManager.buyProduct({
	product_code: "vds",
	product_id: 8,
	period: 1,
	project: 1,
	addons: ["addon_13=8192", "addon_15=10", "addon_9=260"],
	amount: 196,
	currency_iso: "USD",
	currency_bm_id: 153,
	paymethod: 8
}, function(data){
	console.log(data);
});
*/

/*
//Получить все платежи пользователя
billManager.getUserPayments(function(data){
	console.log(data);
});
*/